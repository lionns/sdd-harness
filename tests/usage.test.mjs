import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { collect } from "../pilot/usage.mjs";

const usageScript = fileURLToPath(new URL("../pilot/usage.mjs", import.meta.url));
const summaryScript = fileURLToPath(new URL("../pilot/summarize.mjs", import.meta.url));
const at = "2026-09-29T14:30:00Z";
const codex = (id, overrides = {}) => ({ type: "token_usage_record", timestamp: at,
  payload: { thread_id: "cx", response_id: id, usage: {
    input_tokens: 100, cached_input_tokens: 60, cache_write_input_tokens: 10,
    output_tokens: 20, reasoning_output_tokens: 5, ...overrides,
  } } });
const claude = (id, overrides = {}) => ({ type: "assistant", sessionId: "cl", timestamp: at,
  message: { id, model: "claude-test", content: [{ text: "PRIVATE CONTENT MUST NOT BE COPIED" }],
    usage: { input_tokens: 10, cache_read_input_tokens: 50, cache_creation_input_tokens: 20,
      output_tokens: 5, ...overrides } } });
function fixture(t, files) {
  const dir = mkdtempSync(join(tmpdir(), "usage pilot "));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [name, records] of Object.entries(files)) {
    writeFileSync(join(dir, name), records.map((r) => JSON.stringify(r)).join("\n") + "\n");
  }
  return dir;
}
const manifest = (sessions, overrides = {}) => ({ project: "app", taskId: "T-101", coverage: "complete",
  sessions: sessions.map(([provider, sessionId, path]) => ({ provider, sessionId, path })), ...overrides });
const cx = ["codex", "cx", "cx.jsonl"], cl = ["claude", "cl", "cl.jsonl"];

test("collects multiple agents and retries once, normalizes cache, omits transcript and pricing", async (t) => {
  const dir = fixture(t, { "cx.jsonl": [codex("r1"), codex("r1"), codex("retry")],
    "cl.jsonl": [claude("m1"), claude("m1", { output_tokens: 9 })] });
  const report = await collect(manifest([cx, cl]), dir);
  assert.equal(report.coverage, "complete");
  assert.equal(report.inputTokens, 280);
  assert.equal(report.outputTokens, 49);
  assert.equal(report.cachedInputTokens, 170);
  assert.equal(report.reasoningOutputTokens, null);
  assert.equal(report.costUsd, null);
  assert.deepEqual(report.sessions.map((s) => s.records), [2, 1]);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE CONTENT|usage pilot|content|instructions/);
  assert.deepEqual(report, await collect(manifest([cx, cl]), dir), "repeat collection is idempotent");
});

test("time interval excludes old responses and uses timezone-aware [from,to) boundaries", async (t) => {
  const dir = fixture(t, { "cx.jsonl": [codex("now"), { ...codex("old"), timestamp: "2026-09-29T13:00:00Z" },
    { ...codex("edge"), timestamp: "2026-09-29T15:00:00Z" }] });
  const report = await collect(manifest([cx], { from: "2026-09-29T09:00:00-05:00", to: "2026-09-29T15:00:00Z" }), dir);
  assert.equal(report.inputTokens, 100);
  await assert.rejects(collect(manifest([cx], { from: "2026-09-29" }), dir), /timezone/);
  await assert.rejects(collect(manifest([cx], { from: at, to: at }), dir), /precede/);
});

test("inherited Codex records and cumulative token_count events are not counted again", async (t) => {
  const inherited = codex("ancestor"); inherited.payload.thread_id = "ancestor-thread";
  const dir = fixture(t, { "cx.jsonl": [inherited, codex("ours"),
    { type: "event_msg", payload: { type: "token_count", info: { total_token_usage: { input_tokens: 9999 } } } }] });
  assert.equal((await collect(manifest([cx]), dir)).inputTokens, 100);
});

test("missing sources, old schemas, and unsupported providers remain missing, never zero", async (t) => {
  const dir = fixture(t, { "cx.jsonl": [{ type: "event_msg" }] });
  const report = await collect(manifest([cx, cl, ["gemini", "g", "g.json"]]), dir);
  assert.equal(report.coverage, "partial");
  assert.equal(report.inputTokens, null);
  assert.equal(report.observedInputTokens, null);
  assert.deepEqual(report.sessions.map((s) => s.status), ["missing", "missing", "missing"]);
});

test("partial coverage cannot masquerade as a complete task total", async (t) => {
  const dir = fixture(t, { "cx.jsonl": [codex("r")] });
  const report = await collect(manifest([cx], { coverage: "partial" }), dir);
  assert.equal(report.inputTokens, null);
  assert.equal(report.observedInputTokens, 100);
});

test("invalid or absent counters and identity cannot produce complete coverage", async (t) => {
  for (const bad of [codex("r", { input_tokens: -1 }), codex("r", { input_tokens: null }),
    codex("r", { reasoning_output_tokens: 30 }), { ...codex("r"), timestamp: null }, codex(null)]) {
    const dir = fixture(t, { "cx.jsonl": [codex("valid"), bad] });
    const report = await collect(manifest([cx]), dir);
    assert.equal(report.coverage, "partial");
    assert.equal(report.inputTokens, null);
  }
  const dir = fixture(t, { "cl.jsonl": [claude("m", { cache_creation_input_tokens: null })] });
  assert.equal((await collect(manifest([cl]), dir)).inputTokens, null);
});

test("rejects ambiguous duplicate sessions, symlink aliases, and cross-session responses", async (t) => {
  const other = codex("shared"); other.payload.thread_id = "other";
  const dir = fixture(t, { "cx.jsonl": [codex("shared")], "other.jsonl": [other] });
  await assert.rejects(collect(manifest([cx, cx]), dir), /Duplicate session/);
  symlinkSync(join(dir, "cx.jsonl"), join(dir, "alias.jsonl"));
  await assert.rejects(collect(manifest([cx, ["codex", "other", "alias.jsonl"]]), dir), /same log file/);
  await assert.rejects(collect(manifest([cx, ["codex", "other", "other.jsonl"]]), dir), /multiple sessions/);
});

test("malformed log diagnostics never echo private input", async (t) => {
  const dir = fixture(t, {});
  writeFileSync(join(dir, "cx.jsonl"), '{"secret":"PRIVATE CONTENT"');
  await assert.rejects(collect(manifest([cx]), dir), (error) => {
    assert.match(error.message, /Invalid JSON.*line 1/);
    assert.doesNotMatch(error.message, /PRIVATE/);
    return true;
  });
});

test("CLI resolves paths from the manifest directory, including spaces", (t) => {
  const dir = fixture(t, { "cx.jsonl": [codex("r")] });
  const file = join(dir, "sessions.json"); writeFileSync(file, JSON.stringify(manifest([cx])));
  const result = spawnSync(process.execPath, [usageScript, file], { encoding: "utf8", cwd: tmpdir() });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).inputTokens, 100);
});

test("paired summaries load matching usage files and exclude partial coverage", async (t) => {
  const dir = fixture(t, { "cx.jsonl": [codex("r")] });
  const report = await collect(manifest([cx]), dir);
  writeFileSync(join(dir, "usage.json"), JSON.stringify(report));
  const sample = JSON.parse(readFileSync(new URL("../pilot/run.example.json", import.meta.url), "utf8"));
  const runs = ["current", "lean"].map((mode) => ({ ...sample, project: "app", taskId: "T-101", mode,
    usageFile: "usage.json", elapsedMinutes: 10, agentCount: 1 }));
  const file = join(dir, "runs.jsonl"); writeFileSync(file, runs.map((r) => JSON.stringify(r)).join("\n"));
  const run = () => spawnSync(process.execPath, [summaryScript, file], { encoding: "utf8" });
  let result = run(); assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).metrics.tokens.pairedCount, 1);
  report.coverage = "partial"; writeFileSync(join(dir, "usage.json"), JSON.stringify(report));
  assert.equal(JSON.parse(run().stdout).metrics.tokens.pairedCount, 0);
  report.taskId = "T-999"; writeFileSync(join(dir, "usage.json"), JSON.stringify(report));
  result = run(); assert.equal(result.status, 2); assert.match(result.stderr, /matching usage report/);
});

test("Claude subagents sharing the parent's session ID are counted separately", async (t) => {
  const child = { ...claude("child-response"), agentId: "reviewer" };
  const dir = fixture(t, { "cl.jsonl": [claude("parent-response")], "child.jsonl": [child] });
  const spec = manifest([cl]);
  spec.sessions.push({ provider: "claude", sessionId: "cl", agentId: "reviewer", path: "child.jsonl" });
  const report = await collect(spec, dir);
  assert.equal(report.coverage, "complete");
  assert.equal(report.inputTokens, 160);
  assert.equal(report.outputTokens, 10);
  delete spec.sessions[1].agentId;
  await assert.rejects(collect(spec, dir), /Duplicate session identity/);
});
