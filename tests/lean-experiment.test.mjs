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
  documentationMinutes: mode === "current" ? 7 : 3,
  coordinationMinutes: 0,
  inputTokens: mode === "current" ? 2000 : 1000,
  outputTokens: mode === "current" ? 1000 : 500,
  costUsd: null, accepted: true, reworkMinutes7d: 0, escapedDefects7d: 0,
  resourceRegression7d: false,
  ...overrides,
});
const fixture = (records) => {
  const file = join(mkdtempSync(join(tmpdir(), "lean-pilot-")), "runs.jsonl");
  writeFileSync(file, records.map((record) => JSON.stringify(record)).join("\n"));
  return file;
};

test("compares only matched pairs and leaves missing token and cost values missing", () => {
  const file = fixture([
    sample("p1", "current"), sample("p1", "lean", { resourceRegression7d: true }),
    sample("p2", "current", { inputTokens: null, resourceRegression7d: null }), sample("p2", "lean"),
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
  assert.deepEqual(report.metrics.documentationMinutes, { pairedCount: 2, medianLeanMinusCurrent: -4 });
  assert.deepEqual(report.observedBehavior, { current: 2, lean: 2 });
  assert.deepEqual(report.resourceRegressions7d, { current: 0, lean: 1, observedPairs: 1 });
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

const filledTask = ({ validation = "routine", impact = "none — no runtime path" } = {}) =>
  readFileSync(new URL("../pilot/contract.md", import.meta.url), "utf8")
    .replace("T-###", "T-001")
    .replace(/^harness: .*$/m, "harness: 0.12.0")
    .replace("status: ready", "status: done")
    .replace("validation: pending", `validation: ${validation}`)
    .replace("Resource impact: pending", `Resource impact: ${impact}`)
    .replaceAll("- [ ]", "- [x]")
    .replace("exact/path", "docs/project/brief.md")
    .replace(/^(- Behavior evidence:) .*$/m, "$1 observed output in docs/evidence/T-001.json")
    .replace(/^(- Residual risk:) .*$/m, "$1 none");

const checkRecords = (phases = ["baseline", "task-specific", "final"]) => phases.map((phase) =>
  ({ phase, command: ["node", "--version"], exitCode: 0 }));

test("routine lean closure needs recorded checks but no human acceptance", () => {
  const root = makeRepo({
    config: { harness: "0.12.0", workflow: "lean" },
    tasks: { "T-001-compact-pilot.md": filledTask() },
    project: { "brief.md": "# Fixture brief\n" },
  });
  assert.match(lint(root).stderr, /lean closure needs readable docs\/evidence\/T-001.json/);
  mkdirSync(join(root, "docs/evidence"));
  const records = checkRecords();
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(records));
  assert.equal(lint(root).code, 0, lint(root).stderr);
  records[1].exitCode = 1;
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(records));
  assert.match(lint(root).stderr, /passing recorded task-specific command/);
});

test("current lean work classifies validation and resource impact before implementation", () => {
  const task = readFileSync(new URL("../pilot/contract.md", import.meta.url), "utf8")
    .replace("T-###", "T-001").replace("status: ready", "status: doing");
  const root = makeRepo({ config: { harness: "0.12.0", workflow: "lean" },
    tasks: { "T-001-classification.md": task } });
  const report = lint(root).stderr;
  assert.match(report, /validation: routine\|product\|consequential before work starts/);
  assert.match(report, /Resource impact: none\|measured/);
  writeFileSync(join(root, "docs/tasks/T-001-classification.md"), task
    .replace("validation: pending", "validation: routine")
    .replace("Resource impact: pending", "Resource impact: none — no runtime path"));
  assert.equal(lint(root).code, 0, lint(root).stderr);
});

test("parallel lean closure requires ownership, integration, and a separate verifier", () => {
  const task = filledTask().replace("- Mode: single", "- Mode: parallel");
  const root = makeRepo({ config: { harness: "0.12.0", workflow: "lean" }, tasks: { "T-001-parallel.md": task } });
  const report = lint(root).stderr;
  assert.match(report, /parallel lean task needs - Ownership/);
  assert.match(report, /parallel lean task needs - Integration/);
  assert.match(report, /verifier distinct from the implementers/);
  const complete = task
    .replace(/^(- Ownership:) .*$/m, "$1 agent A owns src/a; agent B owns src/b")
    .replace(/^(- Integration:) .*$/m, "$1 node test integration.test.mjs")
    .replace(/^(- Verifier:) .*$/m, "$1 independent agent C");
  writeFileSync(join(root, "docs/tasks/T-001-parallel.md"), complete);
  mkdirSync(join(root, "docs/evidence"));
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(checkRecords()));
  assert.equal(lint(root).code, 0, lint(root).stderr);
});

test("product and consequential work require different evidence and human acceptance", () => {
  const root = makeRepo({
    config: { harness: "0.12.0", workflow: "lean" },
    tasks: { "T-001-user-view.md": filledTask({ validation: "product" }) },
  });
  mkdirSync(join(root, "docs/evidence"));
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(checkRecords()));
  assert.match(lint(root).stderr, /product or consequential lean closure needs - Human decision/);
  assert.match(lint(root).stderr, /product lean closure needs a usable - Preview/);
  const product = filledTask({ validation: "product" })
    .replace(/^(- Residual risk:) .*$/m,
      "$1 none\n- Preview: http://localhost:3000/dashboard\n- Human decision: accepted by owner after trying preview");
  writeFileSync(join(root, "docs/tasks/T-001-user-view.md"), product);
  assert.equal(lint(root).code, 0, lint(root).stderr);

  const consequential = filledTask({ validation: "consequential" })
    .replace(/^(- Residual risk:) .*$/m, "$1 none\n- Human decision: accepted by owner after cost proposal");
  writeFileSync(join(root, "docs/tasks/T-001-user-view.md"), consequential);
  assert.match(lint(root).stderr, /consequential lean closure needs an independent - Verifier/);
  assert.match(lint(root).stderr, /consequential lean closure needs - Review evidence/);
  writeFileSync(join(root, "docs/tasks/T-001-user-view.md"), consequential
    .replace(/^(- Verifier:) .*$/m, "$1 independent agent B")
    .replace(/^(- Human decision:) .*$/m, "$1 accepted by owner after cost proposal\n- Review evidence: review finding log in issue 42"));
  assert.equal(lint(root).code, 0, lint(root).stderr);
});

test("resource-affecting lean work needs comparable before and after observations", () => {
  const root = makeRepo({
    config: { harness: "0.12.0", workflow: "lean" },
    tasks: { "T-001-query-path.md": filledTask({ impact: "measured — dashboard read" }) },
  });
  mkdirSync(join(root, "docs/evidence"));
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(checkRecords()));
  assert.match(lint(root).stderr, /Resource evidence/);
  assert.match(lint(root).stderr, /resource-before/);
  assert.match(lint(root).stderr, /resource-after/);
  writeFileSync(join(root, "docs/tasks/T-001-query-path.md"),
    filledTask({ impact: "measured — dashboard read" })
      .replace(/^(- Residual risk:) .*$/m, "$1 none\n- Resource evidence: dashboard bench: 12 queries before, 3 after"));
  const records = [
    ...checkRecords(["baseline"]),
    { phase: "resource-before", command: ["node", "bench.mjs"], exitCode: 0, outputTail: "12 queries" },
    ...checkRecords(["task-specific"]),
    { phase: "resource-after", command: ["node", "bench.mjs"], exitCode: 0, outputTail: "3 queries" },
    ...checkRecords(["final"]),
  ];
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(records));
  assert.equal(lint(root).code, 0, lint(root).stderr);
  records[3].command = ["node", "other-bench.mjs"];
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(records));
  assert.match(lint(root).stderr, /must use the same command/);
});

test("the evidence command retains bounded successful resource observations", () => {
  const root = makeRepo({ config: { harness: "0.12.0", workflow: "lean" } });
  const evidence = join(root, "scripts/harness-evidence.mjs");
  const command = [process.execPath, "-e", "process.stdout.write('x'.repeat(1200))"];
  for (const phase of ["baseline", "resource-before", "resource-after"]) {
    const result = spawnSync(process.execPath, [evidence, "T-001", phase, "--", ...command],
      { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  const records = JSON.parse(readFileSync(join(root, "docs/evidence/T-001.json"), "utf8"));
  assert.equal(records[0].outputTail, "");
  assert.equal(records[1].outputTail.length, 1000);
  assert.equal(records[2].outputTail.length, 1000);
});

test("new lean foundation choices need human evidence and a production release policy", () => {
  const decision = "# D-001 — Hosting\n\n- Status: accepted\n- Date: 2026-09-26\n- Supersedes: none\n- Tasks: T-001\n- Foundation: deploy\n\n## Decision\n\nUse the chosen host.\n";
  const root = makeRepo({ config: { harness: "0.12.0", workflow: "lean", foundation: ["deploy"] },
    decisions: { "D-001-hosting.md": decision } });
  assert.match(lint(root).stderr, /Human choice: accepted by <person>/);
  assert.match(lint(root).stderr, /Release policy: manual\|guarded-auto/);
  writeFileSync(join(root, "docs/decisions/D-001-hosting.md"), decision
    .replace("- Foundation: deploy", "- Foundation: deploy\n- Human choice: accepted by owner; evidence: chat approval\n- Release policy: manual — first production release"));
  assert.equal(lint(root).code, 0, lint(root).stderr);
  writeFileSync(join(root, "docs/decisions/D-001-hosting.md"), decision
    .replace("- Foundation: deploy", "- Foundation: deploy\n- Human choice: accepted by owner; evidence: chat approval\n- Release policy: guarded-auto"));
  assert.match(lint(root).stderr, /Release controls: with monitoring and rollback/);
  writeFileSync(join(root, "docs/decisions/D-001-hosting.md"), decision
    .replace("- Foundation: deploy", "- Foundation: deploy\n- Human choice: accepted by owner; evidence: chat approval\n- Release policy: guarded-auto\n- Release controls: protected environment, canary, monitoring, rollback"));
  assert.equal(lint(root).code, 0, lint(root).stderr);
});

test("a task written under lean 0.11 retains its human gate", () => {
  const legacy = filledTask().replace("harness: 0.12.0", "harness: 0.11.0");
  const root = makeRepo({ config: { harness: "0.12.0", workflow: "lean" },
    tasks: { "T-001-legacy.md": legacy } });
  mkdirSync(join(root, "docs/evidence"));
  writeFileSync(join(root, "docs/evidence/T-001.json"), JSON.stringify(checkRecords()));
  assert.match(lint(root).stderr, /lean closure needs - Human decision: accepted by <person>/);
  writeFileSync(join(root, "docs/tasks/T-001-legacy.md"), legacy
    .replace(/^(- Residual risk:) .*$/m, "$1 none\n- Human decision: accepted by owner"));
  assert.equal(lint(root).code, 0, lint(root).stderr);
});
