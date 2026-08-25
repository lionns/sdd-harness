#!/usr/bin/env node
/**
 * Enforces the record budgets and shape rules the harness used to only ask for in prose (D-009).
 * Exit 1 on any violation. Wire this into the project's final check gate.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, config, tasks, decisions, journal, section, sddDocLines,
  TASK_STATES, DECISION_STATES,
} from "./lib/harness.mjs";
import { renderStatus, renderDecisionIndex } from "./harness-status.mjs";

const problems = [];
const fail = (where, message) => problems.push({ where, message });

const cfg = config();
const budgets = cfg.budgets ?? {};
const PROFILES = ["solo", "team"];
const REQUIRED_META = ["id", "title", "status", "profile", "harness", "goal"];
const lineCount = (text) => text.replace(/\n$/, "").split(/\r?\n/).length;

if (!PROFILES.includes(cfg.profile)) {
  fail("harness.json", `profile must be one of ${PROFILES.join(" | ")}, got "${cfg.profile}"`);
}

const decisionIds = new Set(decisions().map((d) => d.id));

for (const task of tasks()) {
  const where = `docs/tasks/${task.name}`;
  if (!task.meta) {
    fail(where, "missing YAML front-matter");
    continue;
  }
  for (const key of REQUIRED_META) {
    if (!task.meta[key]) fail(where, `front-matter is missing \`${key}\``);
  }
  if (task.meta.status && !TASK_STATES.includes(task.meta.status)) {
    fail(where, `status "${task.meta.status}" is not one of ${TASK_STATES.join(" | ")}`);
  }
  if (task.meta.profile && !PROFILES.includes(task.meta.profile)) {
    fail(where, `profile "${task.meta.profile}" is not one of ${PROFILES.join(" | ")}`);
  }
  if (task.meta.id && !task.name.startsWith(`${task.meta.id}-`)) {
    fail(where, `filename must start with the task id "${task.meta.id}-"`);
  }
  for (const id of task.meta.decisions ?? []) {
    if (!decisionIds.has(id)) fail(where, `references decision ${id}, which has no file`);
  }

  const lines = lineCount(task.text);
  if (lines > budgets.taskFileLines) {
    fail(where, `${lines} lines exceeds the ${budgets.taskFileLines}-line budget — split the task`);
  }
  const trace = section(task.text, "Trace");
  if (cfg.profile === "solo" && trace === null && task.meta.status !== "ready") {
    fail(where, "solo profile requires an inline `## Trace` block once work has started");
  }
  if (trace && trace.length > budgets.traceBlockLines) {
    fail(where, `trace block is ${trace.length} lines, budget is ${budgets.traceBlockLines} — compress older rounds`);
  }
}

for (const decision of decisions()) {
  const where = `docs/decisions/${decision.name}`;
  if (!/^D-\d{3}-[a-z0-9-]+\.md$/.test(decision.name)) {
    fail(where, "filename must match D-###-kebab-slug.md");
  }
  if (!DECISION_STATES.includes(decision.status)) {
    fail(where, `status "${decision.status}" is not one of ${DECISION_STATES.join(" | ")}`);
  }
  if (!decision.title.startsWith(decision.id)) {
    fail(where, `heading must start with "${decision.id} — "`);
  }
  const lines = lineCount(decision.text);
  if (lines > budgets.decisionFileLines) {
    fail(where, `${lines} lines exceeds the ${budgets.decisionFileLines}-line budget`);
  }
}

const JOURNAL_FIELDS = 7;
for (const entry of journal()) {
  const where = `JOURNAL.md:${entry.number}`;
  const fields = entry.line.split("|").map((f) => f.trim());
  if (fields.length !== JOURNAL_FIELDS) {
    fail(where, `expected ${JOURNAL_FIELDS} pipe-separated fields, found ${fields.length}`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields[0])) fail(where, `"${fields[0]}" is not a YYYY-MM-DD date`);
  if (!/^[A-Z]+-\d+$/.test(fields[1])) fail(where, `"${fields[1]}" is not a task id`);
  if (!TASK_STATES.includes(fields[2])) fail(where, `"${fields[2]}" is not a task state`);
}

const sdd = sddDocLines();
if (sdd > budgets.sddDocsTotalLines) {
  fail("docs/sdd/", `${sdd} lines exceeds the ${budgets.sddDocsTotalLines}-line budget for harness docs`);
}

for (const [path, render] of [["STATUS.md", renderStatus], ["docs/decisions/README.md", renderDecisionIndex]]) {
  const full = join(ROOT, path);
  const current = existsSync(full) ? readFileSync(full, "utf8") : null;
  if (current !== render()) fail(path, "stale — run `node scripts/harness-status.mjs`");
}

if (problems.length === 0) {
  console.log(`harness-lint: clean (${tasks().length} tasks, ${decisionIds.size} decisions, docs/sdd ${sdd}/${budgets.sddDocsTotalLines} lines)`);
  process.exit(0);
}
console.error(`harness-lint: ${problems.length} problem(s)\n`);
for (const p of problems) console.error(`  ${p.where}\n    ${p.message}`);
process.exit(1);
