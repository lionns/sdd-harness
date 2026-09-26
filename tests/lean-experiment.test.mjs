import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { after } from "node:test";
import { makeRepo, lint, cleanup } from "./helpers/fixture.mjs";

after(cleanup);

const script = fileURLToPath(new URL("../pilot/summarize.mjs", import.meta.url));
const run = (file) => spawnSync(process.execPath, [script, file], { encoding: "utf8" });
const sample = (pairId, mode, overrides = {}) => ({
  pairId, project: "app", taskId: `${pairId}-${mode}`, category: "bugfix",
  mode, agent: "agent", model: "model", evidence: "test log",
  agentCount: 1, independentVerifier: false, integrationEvidence: null, behaviorObserved: true,
  elapsedMinutes: mode === "current" ? 20 : 15,
  humanReviewMinutes: mode === "current" ? 8 : 5,
  coordinationMinutes: 0,
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
  assert.deepEqual(report.observedBehavior, { current: 2, lean: 2 });
});

test("multi-agent measurements need integration evidence", () => {
  const result = run(fixture([sample("p1", "lean", { agentCount: 2 })]));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /multi-agent run needs integrationEvidence/);
});

test("rejects a pair that changes the model and a duplicate mode", () => {
  const changed = run(fixture([sample("p1", "current"), sample("p1", "lean", { model: "other" })]));
  assert.equal(changed.status, 2);
  assert.match(changed.stderr, /model differs between modes/);
  const duplicate = run(fixture([sample("p1", "current"), sample("p1", "current")]));
  assert.equal(duplicate.status, 2);
  assert.match(duplicate.stderr, /already has a current run/);
});

test("the compact contract needs recorded checks and human acceptance before closure", () => {
  const template = readFileSync(new URL("../pilot/contract.md", import.meta.url), "utf8");
  const filled = template
    .replace("T-###", "T-001")
    .replace("status: ready", "status: done")
    .replaceAll("- [ ]", "- [x]")
    .replace("exact/path", "docs/project/brief.md")
    .replace("YYYY-MM-DD", "2026-09-26")
    .replace(/^(- Behavior evidence:) .*$/m, "$1 observed output in docs/evidence/T-001.json")
    .replace(/^(- Residual risk:) .*$/m, "$1 none")
    .replace(/^(- Human decision:) .*$/m, "$1 accepted by owner");
  const root = makeRepo({
    config: { harness: "0.10.0", workflow: "lean" },
    tasks: { "T-001-compact-pilot.md": filled },
    project: { "brief.md": "# Fixture brief\n" },
  });
  assert.match(lint(root).stderr, /lean closure needs readable docs\/evidence\/T-001.json/);
  mkdirSync(join(root, "docs/evidence"));
  const records = ["baseline", "task-specific", "final"].map((phase) =>
    ({ phase, command: ["node", "--version"], exitCode: 0 }));
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(records));
  assert.equal(lint(root).code, 0, lint(root).stderr);
  records[1].exitCode = 1;
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(records));
  assert.match(lint(root).stderr, /passing recorded task-specific command/);
});

test("parallel lean closure requires ownership, integration, and a separate verifier", () => {
  const template = readFileSync(new URL("../pilot/contract.md", import.meta.url), "utf8");
  const task = template.replace("T-###", "T-001").replace("status: ready", "status: done")
    .replaceAll("- [ ]", "- [x]").replace("- Mode: single", "- Mode: parallel")
    .replace(/^(- Human decision:) .*$/m, "$1 accepted by owner");
  const root = makeRepo({ config: { harness: "0.10.0", workflow: "lean" }, tasks: { "T-001-parallel.md": task } });
  const report = lint(root).stderr;
  assert.match(report, /parallel lean task needs - Ownership/);
  assert.match(report, /parallel lean task needs - Integration/);
  assert.match(report, /verifier distinct from the implementers/);
  const complete = task
    .replace(/^(- Ownership:) .*$/m, "$1 agent A owns src/a; agent B owns src/b")
    .replace(/^(- Integration:) .*$/m, "$1 node test integration.test.mjs")
    .replace(/^(- Verifier:) .*$/m, "$1 independent agent C")
    .replace(/^(- Behavior evidence:) .*$/m, "$1 integration output")
    .replace(/^(- Residual risk:) .*$/m, "$1 none");
  writeFileSync(join(root, "docs/tasks/T-001-parallel.md"), complete);
  mkdirSync(join(root, "docs/evidence"));
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(
    ["baseline", "task-specific", "final"].map((phase) => ({ phase, command: ["node", "--version"], exitCode: 0 }))));
  assert.equal(lint(root).code, 0, lint(root).stderr);
});
