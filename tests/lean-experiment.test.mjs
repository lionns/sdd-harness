import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { after } from "node:test";
import { makeRepo, lint, cleanup } from "./helpers/fixture.mjs";

after(cleanup);

const script = fileURLToPath(new URL("../experiments/lean-workflow/summarize.mjs", import.meta.url));
const run = (file) => spawnSync(process.execPath, [script, file], { encoding: "utf8" });
const sample = (pairId, mode, overrides = {}) => ({
  pairId, project: "app", taskId: `${pairId}-${mode}`, category: "bugfix",
  mode, agent: "agent", model: "model", evidence: "test log",
  elapsedMinutes: mode === "current" ? 20 : 15,
  humanReviewMinutes: mode === "current" ? 8 : 5,
  inputTokens: mode === "current" ? 2000 : 1000,
  outputTokens: mode === "current" ? 1000 : 500,
  costUsd: null, accepted: true, reworkMinutes7d: 0, escapedDefects7d: 0,
  ...overrides,
});
const fixture = (records) => {
  const file = join(mkdtempSync(join(tmpdir(), "lean-pilot-")), "runs.jsonl");
  writeFileSync(file, records.map((record) => JSON.stringify(record)).join("\n"));
  return file;
};

test("compares only matched pairs and leaves missing token and cost values missing", () => {
  const file = fixture([
    sample("p1", "current"), sample("p1", "lean"),
    sample("p2", "current", { inputTokens: null }), sample("p2", "lean"),
    sample("p3", "lean"),
  ]);
  const result = run(file);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.runs, 5);
  assert.equal(report.matchedPairs, 2);
  assert.deepEqual(report.unpaired, ["p3"]);
  assert.deepEqual(report.metrics.elapsedMinutes, { pairedCount: 2, medianLeanMinusCurrent: -5 });
  assert.deepEqual(report.metrics.tokens, { pairedCount: 1, medianLeanMinusCurrent: -1500 });
  assert.deepEqual(report.metrics.costUsd, { pairedCount: 0, medianLeanMinusCurrent: null });
});

test("rejects a pair that changes the model and a duplicate mode", () => {
  const changed = run(fixture([sample("p1", "current"), sample("p1", "lean", { model: "other" })]));
  assert.equal(changed.status, 2);
  assert.match(changed.stderr, /model differs between modes/);
  const duplicate = run(fixture([sample("p1", "current"), sample("p1", "current")]));
  assert.equal(duplicate.status, 2);
  assert.match(duplicate.stderr, /already has a current run/);
});

test("the compact contract can close under the existing 0.9 solo gate", () => {
  const template = readFileSync(new URL("../experiments/lean-workflow/contract.md", import.meta.url), "utf8");
  const filled = template
    .replace("T-###", "T-001")
    .replace("status: ready", "status: done")
    .replaceAll("- [ ]", "- [x]")
    .replace("exact/path", "docs/project/brief.md")
    .replace("YYYY-MM-DD", "2026-09-26");
  const root = makeRepo({
    config: { harness: "0.9.0" },
    tasks: { "T-001-compact-pilot.md": filled },
    project: { "brief.md": "# Fixture brief\n" },
  });
  const result = lint(root);
  assert.equal(result.code, 0, result.stderr);
});
