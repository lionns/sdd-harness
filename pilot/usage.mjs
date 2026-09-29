#!/usr/bin/env node
// Read explicit local logs only. No model calls, network access, pricing, or transcript output.
import { readFileSync, realpathSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const number = (n) => Number.isSafeInteger(n) && n >= 0;
const text = (s) => typeof s === "string" && s.trim().length > 0;
const keys = ["inputTokens", "outputTokens", "cachedInputTokens", "cacheWriteInputTokens", "reasoningOutputTokens"];
const sum = (values) => Object.fromEntries(keys.map((key) => [key,
  values.some((v) => v[key] == null) ? null : values.reduce((n, v) => n + v[key], 0),
]));
const optional = (n) => n == null ? null : number(n) ? n : (() => { throw Error("Invalid usage counter"); })();

function normalize(provider, usage) {
  if (!usage || !number(usage.input_tokens) || !number(usage.output_tokens)) {
    throw Error("Missing or invalid input/output counters");
  }
  let inputTokens = usage.input_tokens;
  let cachedInputTokens, cacheWriteInputTokens, reasoningOutputTokens;
  if (provider === "claude") {
    // Anthropic's three input buckets are disjoint. Require them to avoid undercounting.
    if (!number(usage.cache_read_input_tokens) || !number(usage.cache_creation_input_tokens)) {
      throw Error("Claude cache counters are unavailable");
    }
    cachedInputTokens = usage.cache_read_input_tokens;
    cacheWriteInputTokens = usage.cache_creation_input_tokens;
    inputTokens += cachedInputTokens + cacheWriteInputTokens;
    reasoningOutputTokens = null;
  } else {
    // Codex input includes cache, and output includes reasoning; never add them twice.
    cachedInputTokens = optional(usage.cached_input_tokens);
    cacheWriteInputTokens = optional(usage.cache_write_input_tokens);
    reasoningOutputTokens = optional(usage.reasoning_output_tokens);
    if ((cachedInputTokens ?? 0) + (cacheWriteInputTokens ?? 0) > inputTokens
        || (reasoningOutputTokens ?? 0) > usage.output_tokens) throw Error("Inconsistent usage counters");
  }
  if (!number(inputTokens)) throw Error("Usage counter exceeds safe integer range");
  return { inputTokens, outputTokens: usage.output_tokens, cachedInputTokens,
    cacheWriteInputTokens, reasoningOutputTokens };
}

export async function collect(manifest, baseDir = process.cwd()) {
  if (!manifest || !text(manifest.project) || !text(manifest.taskId)
      || !["complete", "partial"].includes(manifest.coverage)
      || !Array.isArray(manifest.sessions) || !manifest.sessions.length) {
    throw Error("Expected project, taskId, coverage (complete|partial), and nonempty sessions");
  }
  const boundary = (value, fallback) => {
    if (value == null) return fallback;
    if (!text(value) || !Number.isFinite(Date.parse(value)) || !/(Z|[+-]\d\d:\d\d)$/.test(value)) {
      throw Error("Time boundaries need an ISO timestamp with a timezone");
    }
    return Date.parse(value);
  };
  const from = boundary(manifest.from, -Infinity), to = boundary(manifest.to, Infinity);
  if (from >= to) throw Error("from must precede to");
  const identities = new Set(), paths = new Set(), requests = new Map();
  const sessions = [];
  for (const source of manifest.sessions) {
    if (!source || !text(source.provider) || !text(source.sessionId) || !text(source.path)) {
      throw Error("Each session needs provider, sessionId, and path");
    }
    if (source.agentId != null && (source.provider !== "claude" || !text(source.agentId))) {
      throw Error("agentId is only supported for Claude subagent logs");
    }
    const identity = JSON.stringify([source.provider, source.sessionId, source.agentId ?? null]);
    if (identities.has(identity)) throw Error("Duplicate session identity");
    identities.add(identity);
    const result = { provider: source.provider, sessionId: source.sessionId, agentId: source.agentId ?? null,
      sourceId: null, records: 0, models: [], ...Object.fromEntries(keys.map((k) => [k, null])),
      status: "missing", reason: null };
    sessions.push(result);
    if (!["codex", "claude"].includes(source.provider)) {
      result.reason = "Unsupported log provider";
      continue;
    }
    let path;
    try { path = realpathSync(resolve(baseDir, source.path)); }
    catch { result.reason = "Log file unavailable"; continue; }
    if (paths.has(path)) throw Error("The same log file was listed twice");
    paths.add(path);
    result.sourceId = createHash("sha256").update(path).digest("hex");
    const values = new Map(), models = new Set();
    let lineNo = 0;
    const input = createReadStream(path, { encoding: "utf8" });
    const lines = createInterface({ input, crlfDelay: Infinity });
    // Forward file errors to the iterator without exposing a transcript or absolute path.
    input.on("error", () => lines.close());
    let inputError = false;
    input.on("error", () => { inputError = true; });
    try {
      for await (const line of lines) {
        lineNo++;
        if (!line.trim()) continue;
        let event;
        try { event = JSON.parse(line); }
        catch { throw Error(`Invalid JSON in session ${source.sessionId}, line ${lineNo}`); }
        if (!event || typeof event !== "object") throw Error(`Invalid record at line ${lineNo}`);
        let id, usage, model;
        if (source.provider === "codex") {
          // Per-response records avoid cumulative-counter resets and inherited fork history.
          if (event.type !== "token_usage_record" || event.payload?.thread_id !== source.sessionId) continue;
          id = event.payload.response_id;
          usage = event.payload.usage;
        } else {
          if (event.type !== "assistant" || event.sessionId !== source.sessionId
              || (event.agentId ?? null) !== (source.agentId ?? null)
              || event.message?.model === "<synthetic>") continue;
          id = event.message?.id;
          usage = event.message?.usage;
          model = event.message?.model;
        }
        if (!text(id)) { result.reason = "Usage record lacks response identity"; continue; }
        const time = Date.parse(event.timestamp);
        if (!Number.isFinite(time)) { result.reason = "Usage record lacks a valid timestamp"; continue; }
        if (time < from || time >= to) continue;
        let counters;
        try { counters = normalize(source.provider, usage); }
        catch (error) { result.reason = error.message; continue; }
        const key = `${source.provider}:${id}`;
        const previous = requests.get(key);
        // Repeated Claude content blocks can update the same response's usage.
        // Keep the largest counters; conflicting cross-session copies are ambiguous.
        if (previous && previous.identity !== identity) {
          throw Error("A response occurs in multiple sessions; select nonoverlapping logs");
        }
        const existing = values.get(key);
        if (existing) counters = Object.fromEntries(keys.map((k) => [k,
          existing[k] == null || counters[k] == null ? null : Math.max(existing[k], counters[k]),
        ]));
        requests.set(key, { identity });
        values.set(key, counters);
        if (text(model)) models.add(model);
      }
    } finally { lines.close(); input.destroy(); }
    if (inputError) throw Error(`Cannot read session ${source.sessionId}`);
    result.records = values.size;
    result.models = [...models].sort();
    if (!values.size && !result.reason) result.reason = "No supported usage records in the selected interval";
    if (values.size) Object.assign(result, sum([...values.values()]));
    if (!result.reason) result.status = "observed";
  }
  const available = sessions.filter((s) => s.records > 0);
  const observed = available.length ? sum(available) : Object.fromEntries(keys.map((k) => [k, null]));
  for (const value of Object.values(observed)) if (value != null && !number(value)) throw Error("Usage total exceeds safe integer range");
  const complete = manifest.coverage === "complete" && sessions.every((s) => s.status === "observed");
  return { schemaVersion: 1, kind: "harness-agent-usage", project: manifest.project, taskId: manifest.taskId,
    from: manifest.from ?? null, to: manifest.to ?? null, coverage: complete ? "complete" : "partial",
    inputTokens: complete ? observed.inputTokens : null, outputTokens: complete ? observed.outputTokens : null,
    observedInputTokens: observed.inputTokens, observedOutputTokens: observed.outputTokens,
    cachedInputTokens: observed.cachedInputTokens, cacheWriteInputTokens: observed.cacheWriteInputTokens,
    reasoningOutputTokens: observed.reasoningOutputTokens, costUsd: null,
    note: "Local recorded usage, not a billing statement. Coverage is declared, not independently proven.", sessions };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw Error("Usage: node pilot/usage.mjs <session-manifest.json>");
    const file = resolve(process.argv[2]);
    let manifest;
    try { manifest = JSON.parse(readFileSync(file, "utf8")); }
    catch { throw Error("Cannot read a valid session manifest"); }
    console.log(JSON.stringify(await collect(manifest, dirname(file)), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
