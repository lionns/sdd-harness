#!/usr/bin/env node
// Descriptive paired pilot summary. Missing telemetry is never inferred.
import { readFileSync } from "node:fs";

const [file] = process.argv.slice(2);
if (!file) {
  console.error("Usage: node experiments/lean-workflow/summarize.mjs <runs.jsonl>");
  process.exit(2);
}

const requiredText = ["pairId", "project", "taskId", "category", "mode", "agent", "model", "evidence"];
const requiredNumber = ["elapsedMinutes", "humanReviewMinutes"];
const optionalNumber = ["inputTokens", "outputTokens", "costUsd", "reworkMinutes7d", "escapedDefects7d"];
const grouped = new Map();
let count = 0;

let source;
try {
  source = readFileSync(file, "utf8");
} catch (error) {
  console.error(`Cannot read ${file}: ${error.message}`);
  process.exit(2);
}

for (const [index, line] of source.split(/\r?\n/).entries()) {
  if (!line.trim()) continue;
  let run;
  try {
    run = JSON.parse(line);
  } catch (error) {
    console.error(`Line ${index + 1}: invalid JSON — ${error.message}`);
    process.exit(2);
  }
  if (!run || typeof run !== "object" || Array.isArray(run)) {
    console.error(`Line ${index + 1}: expected a JSON object`);
    process.exit(2);
  }
  for (const key of requiredText) {
    if (typeof run[key] !== "string" || !run[key].trim()) {
      console.error(`Line ${index + 1}: ${key} must be nonempty text`);
      process.exit(2);
    }
  }
  if (!["current", "lean"].includes(run.mode)) {
    console.error(`Line ${index + 1}: mode must be current or lean`);
    process.exit(2);
  }
  for (const key of requiredNumber) {
    if (!Number.isFinite(run[key]) || run[key] < 0) {
      console.error(`Line ${index + 1}: ${key} must be a nonnegative number`);
      process.exit(2);
    }
  }
  for (const key of optionalNumber) {
    if (run[key] != null && (!Number.isFinite(run[key]) || run[key] < 0)) {
      console.error(`Line ${index + 1}: ${key} must be null or a nonnegative number`);
      process.exit(2);
    }
  }
  if (typeof run.accepted !== "boolean") {
    console.error(`Line ${index + 1}: accepted must be a boolean`);
    process.exit(2);
  }
  const pair = grouped.get(run.pairId) ?? {};
  if (pair[run.mode]) {
    console.error(`Line ${index + 1}: pair ${run.pairId} already has a ${run.mode} run`);
    process.exit(2);
  }
  pair[run.mode] = run;
  grouped.set(run.pairId, pair);
  count++;
}

const pairs = [];
const unpaired = [];
const metricNames = ["elapsedMinutes", "humanReviewMinutes", "tokens", "costUsd", "reworkMinutes7d", "escapedDefects7d"];
const deltas = Object.fromEntries(metricNames.map((key) => [key, []]));
const tokens = (run) => run.inputTokens == null || run.outputTokens == null
  ? null : run.inputTokens + run.outputTokens;

for (const [pairId, pair] of grouped) {
  if (!pair.current || !pair.lean) {
    unpaired.push(pairId);
    continue;
  }
  const { current, lean } = pair;
  for (const key of ["project", "category", "agent", "model"]) {
    if (current[key] !== lean[key]) {
      console.error(`Pair ${pairId}: ${key} differs between modes; pair comparable tasks only`);
      process.exit(2);
    }
  }
  const values = {
    elapsedMinutes: [current.elapsedMinutes, lean.elapsedMinutes],
    humanReviewMinutes: [current.humanReviewMinutes, lean.humanReviewMinutes],
    tokens: [tokens(current), tokens(lean)],
    costUsd: [current.costUsd, lean.costUsd],
    reworkMinutes7d: [current.reworkMinutes7d, lean.reworkMinutes7d],
    escapedDefects7d: [current.escapedDefects7d, lean.escapedDefects7d],
  };
  const difference = {};
  for (const key of metricNames) {
    const [before, after] = values[key];
    difference[key] = before == null || after == null ? null : after - before;
    if (difference[key] != null) deltas[key].push(difference[key]);
  }
  pairs.push({
    pairId, project: current.project, category: current.category,
    currentTask: current.taskId, leanTask: lean.taskId,
    accepted: { current: current.accepted, lean: lean.accepted },
    leanMinusCurrent: difference,
  });
}

const median = (numbers) => {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const metrics = Object.fromEntries(metricNames.map((key) => [key, {
  pairedCount: deltas[key].length,
  medianLeanMinusCurrent: median(deltas[key]),
}]));

console.log(JSON.stringify({
  note: "Descriptive matched-pair results; no causal claim or missing-value imputation.",
  runs: count,
  matchedPairs: pairs.length,
  unpaired,
  acceptance: {
    current: pairs.filter((pair) => pair.accepted.current).length,
    lean: pairs.filter((pair) => pair.accepted.lean).length,
  },
  metrics,
  pairs,
}, null, 2));
