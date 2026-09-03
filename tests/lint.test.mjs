import { test, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { makeRepo, cleanup, lint, task, decision, version, trace } from "./helpers/fixture.mjs";

after(cleanup);

/** Asserts a non-zero exit whose report blames `where` for something matching `message`. */
function rejects(root, where, message) {
  const { code, stderr } = lint(root);
  assert.equal(code, 1, `expected a failing exit\n${stderr}`);
  assert.match(stderr, new RegExp(`${where.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+.*${message.source ?? message}`));
}

test("a well-formed repo lints clean and reports its counts", () => {
  const root = makeRepo({
    tasks: { "T-001-a.md": task({ decisions: ["D-001"] }) },
    decisions: { "D-001-a.md": decision() },
    journal: "2026-08-26 | T-001 | done | did the thing | 3 files | tests 9/9 | D-001",
    sdd: { "HARNESS.md": "one\ntwo\n" },
  });
  const { code, stdout } = lint(root);
  assert.equal(code, 0, "clean repo must exit 0");
  assert.match(stdout, /harness-lint: clean \(1 tasks, 1 decisions, docs\/sdd 2\/600 lines\)/);
});

test("an unknown profile in harness.json is rejected", () => {
  rejects(makeRepo({ config: { profile: "duo" } }), "harness.json", /profile must be one of solo \| team, got "duo"/);
});

test("a task missing front-matter or required keys is rejected", () => {
  rejects(makeRepo({ tasks: { "T-001-a.md": "# No front-matter\n" } }), "docs/tasks/T-001-a.md", /missing YAML front-matter/);

  const noGoal = task().replace(/^goal: .*$/m, "");
  rejects(makeRepo({ tasks: { "T-001-a.md": noGoal } }), "docs/tasks/T-001-a.md", /front-matter is missing `goal`/);
});

test("an invalid task state is rejected", () => {
  rejects(makeRepo({ tasks: { "T-001-a.md": task({ status: "in-progress" }) } }),
    "docs/tasks/T-001-a.md", /status "in-progress" is not one of/);
});

test("a filename that disagrees with the task id is rejected", () => {
  rejects(makeRepo({ tasks: { "T-999-a.md": task({ id: "T-001" }) } }),
    "docs/tasks/T-999-a.md", /filename must start with the task id "T-001-"/);
});

test("a task referencing a decision with no file is rejected", () => {
  rejects(makeRepo({ tasks: { "T-001-a.md": task({ decisions: ["D-042"] }) } }),
    "docs/tasks/T-001-a.md", /references decision D-042, which has no file/);
});

test("a task whose plan is over budget is rejected, and the message says to split it", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  appendFileSync(join(root, "docs/tasks/T-001-a.md"), "filler\n".repeat(120));
  rejects(root, "docs/tasks/T-001-a.md", /plan is \d+ lines, plan budget is 120 — split the task/);
});

// The split is what makes these two separate failures: a record long enough to fail on its own sits
// under a plan that never moved (D-030).
test("a task whose record is over budget is rejected without touching the plan", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  appendFileSync(join(root, "docs/tasks/T-001-a.md"), `\n## Outcome\n\n${"- done\n".repeat(61)}`);
  rejects(root, "docs/tasks/T-001-a.md", /record is \d+ lines, record budget is 60 — compress the record/);
});

test("a budget the linter reads but harness.json omits fails, naming the key", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  const cfg = JSON.parse(readFileSync(join(root, "harness.json"), "utf8"));
  delete cfg.budgets.taskPlanLines;
  writeFileSync(join(root, "harness.json"), `${JSON.stringify(cfg, null, 2)}\n`);
  rejects(root, "harness.json", /budget contract missing `taskPlanLines`, which harness-lint enforces/);
});

test("a budget harness.json declares that no check reads fails too", () => {
  rejects(makeRepo({ config: { budgets: { journalEntryLines: 1 } }, tasks: { "T-001-a.md": task() } }),
    "harness.json", /budget contract declares `journalEntryLines`, which harness-lint does not enforce/);
});

test("under solo, a task past `ready` needs an inline trace; a `ready` task does not", () => {
  const noTrace = task({ status: "doing" }).replace(/\n## Trace[\s\S]*$/, "\n");
  rejects(makeRepo({ tasks: { "T-001-a.md": noTrace } }),
    "docs/tasks/T-001-a.md", /solo profile requires an inline `## Trace` block/);

  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": task({ status: "ready" }) } })).code, 0);
});

test("an over-budget trace block is rejected even when the task fits", () => {
  const fat = task({ status: "doing" }).replace("## Trace\n", `## Trace\n${"- a round\n".repeat(30)}`);
  rejects(makeRepo({ tasks: { "T-001-a.md": fat } }),
    "docs/tasks/T-001-a.md", /trace block is \d+ lines, budget is 25 — compress older rounds/);
});

test("decision filename, status, and heading are all checked", () => {
  rejects(makeRepo({ decisions: { "D-1-x.md": decision({ id: "D-1" }) } }),
    "docs/decisions/D-1-x.md", /filename must match D-###-kebab-slug\.md/);

  rejects(makeRepo({ decisions: { "D-001-x.md": decision({ state: "draft" }) } }),
    "docs/decisions/D-001-x.md", /status "draft" is not one of/);

  rejects(makeRepo({ decisions: { "D-001-x.md": decision({ id: "D-002" }) } }),
    "docs/decisions/D-001-x.md", /heading must start with "D-001 — "/);
});

test("a decision over its line budget is rejected", () => {
  const root = makeRepo({ decisions: { "D-001-x.md": decision() } });
  appendFileSync(join(root, "docs/decisions/D-001-x.md"), "filler\n".repeat(40));
  rejects(root, "docs/decisions/D-001-x.md", /lines exceeds the 40-line budget/);
});

test("journal lines are checked for field count, date, and state", () => {
  rejects(makeRepo({ journal: "2026-08-26 | T-001 | done | too few fields" }),
    "JOURNAL.md:3", /expected 7 pipe-separated fields, found 4/);

  rejects(makeRepo({ journal: "26-08-2026 | T-001 | done | ok | 1 file | ok | -" }),
    "JOURNAL.md:3", /"26-08-2026" is not a YYYY-MM-DD date/);

  rejects(makeRepo({ journal: "2026-08-26 | T-001 | finished | ok | 1 file | ok | -" }),
    "JOURNAL.md:3", /"finished" is not a task state/);
});

test("docs/sdd over its total budget is rejected", () => {
  rejects(makeRepo({ config: { budgets: { sddDocsTotalLines: 5 } }, sdd: { "A.md": "x\n".repeat(20) } }),
    "docs/sdd/", /lines exceeds the 5-line budget for harness docs/);
});

test("a stale STATUS.md or decision index is rejected", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  writeFileSync(join(root, "STATUS.md"), "# Hand-edited\n");
  rejects(root, "STATUS.md", /stale — run `node scripts\/harness-status\.mjs`/);

  const other = makeRepo({ decisions: { "D-001-x.md": decision() } });
  writeFileSync(join(other, "docs/decisions/README.md"), "# Hand-edited\n");
  rejects(other, "docs/decisions/README.md", /stale — run `node scripts\/harness-status\.mjs`/);
});

test("every violation is reported in one run, not just the first", () => {
  const { code, stderr } = lint(makeRepo({
    config: { profile: "duo" },
    tasks: { "T-999-a.md": task({ id: "T-001", status: "nope" }) },
  }));
  assert.equal(code, 1);
  assert.match(stderr, /harness-lint: 3 problem\(s\)/);
});

test("a done task with no journal line for its id is rejected", () => {
  rejects(makeRepo({ tasks: { "T-001-a.md": task() }, journal: "2026-08-26 | T-777 | done | other | 1 file | ok | -" }),
    "docs/tasks/T-001-a.md", /status is done but JOURNAL\.md has no line for T-001/);
});

test("a done task with unchecked acceptance criteria is rejected, but an open task is not", () => {
  const unchecked = task().replace("- [x] Done.", "- [ ] Not verified.\n- [ ] Nor this.");
  rejects(makeRepo({ tasks: { "T-001-a.md": unchecked } }),
    "docs/tasks/T-001-a.md", /status is done but 2 acceptance criteria are still unchecked/);

  const open = unchecked.replace("status: done", "status: doing");
  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": open } })).code, 0, "an unchecked box is fine before done");
});

test("a harness version VERSION.md never declared is rejected", () => {
  rejects(makeRepo({ tasks: { "T-001-a.md": task({ harness: "9.9.9" }) }, sdd: { "VERSION.md": version("0.2.0") } }),
    "docs/tasks/T-001-a.md", /harness "9\.9\.9" is not a version in docs\/sdd\/VERSION\.md \(0\.2\.0\)/);

  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": task() }, sdd: { "VERSION.md": version("0.1.0", "0.2.0") } })).code,
    0, "a declared version passes");
});

// D-032 moved the history out of the rules budget. A repository that has not moved keeps working
// through the fallback, and one that has is read — and blamed — at the new path.
test("a repository whose history has moved is read from CHANGELOG.md, and the failure names it", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task({ harness: "9.9.9" }) }, sdd: { "VERSION.md": version("0.2.0") } });
  writeFileSync(join(root, "CHANGELOG.md"), version("0.3.0").replace("# Harness Version", "# Changelog"));
  rejects(root, "docs/tasks/T-001-a.md", /is not a version in CHANGELOG\.md \(0\.3\.0\)/);
});

test("the version rule is skipped when VERSION.md declares nothing", () => {
  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": task({ harness: "9.9.9" }) } })).code,
    0, "a repo with no changelog cannot be held to it");
});

test("under team, a task past `ready` needs a trace file", () => {
  const config = { profile: "team" };
  const doing = task({ status: "doing", profile: "team" });
  rejects(makeRepo({ config, tasks: { "T-001-a.md": doing } }),
    "docs/tasks/T-001-a.md", /team profile requires a trace file at docs\/traces\/<YYYY-MM-DD>_T-001_<role>\.md/);

  assert.equal(lint(makeRepo({ config, tasks: { "T-001-a.md": doing }, traces: { "2026-08-26_T-001_implementer.md": trace() } })).code,
    0, "a matching trace file satisfies the rule");

  assert.equal(lint(makeRepo({ config, tasks: { "T-001-a.md": task({ status: "ready", profile: "team" }) } })).code,
    0, "a `ready` task needs no trace yet");
});

test("under team, a done task needs a `## Validation` section naming a validator", () => {
  const config = { profile: "team" };
  const traces = { "2026-08-26_T-001_implementer.md": trace() };
  const done = task({ profile: "team" });
  rejects(makeRepo({ config, tasks: { "T-001-a.md": done }, traces }),
    "docs/tasks/T-001-a.md", /team profile requires a `## Validation` section with a `- Validated by:` line/);

  const empty = done.replace("## Trace", "## Validation\n\n- Validated by:\n\n## Trace");
  rejects(makeRepo({ config, tasks: { "T-001-a.md": empty }, traces }),
    "docs/tasks/T-001-a.md", /team profile requires a `## Validation` section/);

  const named = done.replace("## Trace", "## Validation\n\n- Validated by: A Human\n- Date: 2026-08-26\n\n## Trace");
  assert.equal(lint(makeRepo({ config, tasks: { "T-001-a.md": named }, traces })).code, 0);
});

test("under solo, the team rules do not fire", () => {
  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": task({ status: "doing" }) } })).code,
    0, "solo needs no trace file and no validator");
});

test("trace files are checked for filename shape and budget", () => {
  rejects(makeRepo({ config: { profile: "team" }, traces: { "implementer-notes.md": trace() } }),
    "docs/traces/implementer-notes.md", /filename must match <YYYY-MM-DD>_<T-###>_<role>\.md/);

  rejects(makeRepo({ config: { profile: "team" }, traces: { "2026-08-26_T-001_implementer.md": "- a round\n".repeat(30) } }),
    "docs/traces/2026-08-26_T-001_implementer.md", /30 lines, budget is 25 — compress older rounds/);
});

// --- Inception gate (D-020) ---

test("a declared foundation topic blocks any task past ready until an accepted decision settles it", () => {
  const config = { foundation: ["runtime"] };
  const doing = { "T-001-a.md": task({ status: "doing" }) };
  rejects(makeRepo({ config, tasks: doing }), "harness.json",
    /1 task\(s\) past ready while the foundation is unsettled: runtime/);

  assert.equal(lint(makeRepo({ config, tasks: { "T-001-a.md": task({ status: "ready" }) } })).code,
    0, "the gate fires on started work, not on a backlog");

  rejects(makeRepo({ config, tasks: doing, decisions: { "D-001-a.md": decision({ state: "proposed", foundation: "runtime" }) } }),
    "harness.json", /unsettled: runtime/);

  assert.equal(lint(makeRepo({ config, tasks: doing, decisions: { "D-001-a.md": decision({ foundation: "runtime" }) } })).code,
    0, "an accepted decision settles the topic");
});

test("the gate names every unsettled topic at once, so one run tells you the whole cost", () => {
  const root = makeRepo({ config: { foundation: ["runtime", "data", "tests"] }, tasks: { "T-001-a.md": task({ status: "doing" }) } });
  const { stderr } = lint(root);
  assert.match(stderr, /unsettled: runtime, data, tests/);
});

test("a foundation topic outside the declared list is a typo, not a new topic", () => {
  rejects(makeRepo({ config: { foundation: ["runtime"] }, decisions: { "D-001-a.md": decision({ foundation: "runitme" }) } }),
    "docs/decisions/D-001-a.md", /foundation topic "runitme" is not one of runtime in harness.json/);
});

test("two accepted decisions claiming one topic are ambiguous", () => {
  rejects(makeRepo({
    config: { foundation: ["runtime"] },
    decisions: {
      "D-001-a.md": decision({ id: "D-001", foundation: "runtime" }),
      "D-002-b.md": decision({ id: "D-002", foundation: "runtime" }),
    },
  }), "docs/decisions/", /foundation topic "runtime" is settled by 2 accepted decisions/);
});

test("no declared foundation means no gate, so a 0.3.0 project survives the upgrade", () => {
  const doing = { "T-001-a.md": task({ status: "doing" }) };
  assert.equal(lint(makeRepo({ tasks: doing })).code, 0, "absent list");
  assert.equal(lint(makeRepo({ config: { foundation: [] }, tasks: doing })).code, 0, "empty list");

  // With the gate off a topic marker is inert, not an error: the brownfield task writes the
  // decisions first and declares the list last.
  assert.equal(lint(makeRepo({ config: { foundation: [] }, decisions: { "D-001-a.md": decision({ foundation: "runtime" }) } })).code, 0);
});

test("a superseded decision stops settling its topic", () => {
  rejects(makeRepo({
    config: { foundation: ["runtime"] },
    tasks: { "T-001-a.md": task({ status: "doing" }) },
    decisions: { "D-001-a.md": decision({ state: "superseded", foundation: "runtime" }) },
  }), "harness.json", /unsettled: runtime/);
});

// --- Forward traceability (D-019) ---

const specs = { "requirements.json": JSON.stringify({ functional: [{ id: "FR-1" }], nonFunctional: [{ id: "NFR-1" }] }) };

test("a task may only claim a requirement the project actually declares", () => {
  rejects(makeRepo({ project: specs, tasks: { "T-001-a.md": task({ implements: ["FR-99"] }) } }),
    "docs/tasks/T-001-a.md", /implements FR-99, which no file in docs\/project\/ declares/);

  assert.equal(lint(makeRepo({ project: specs, tasks: { "T-001-a.md": task({ implements: ["FR-1", "NFR-1"] }) } })).code,
    0, "ids nested under different keys must both resolve");
});

test("omitting implements is valid, and a project with no specs disables the check", () => {
  assert.equal(lint(makeRepo({ project: specs, tasks: { "T-001-a.md": task() } })).code, 0);
  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": task({ implements: ["FR-99"] }) } })).code,
    0, "a project that declares nothing cannot be held to it");
});

test("a malformed spec file does not crash the linter", () => {
  assert.equal(lint(makeRepo({ project: { "requirements.json": "{ not json" }, tasks: { "T-001-a.md": task() } })).code, 0);
});

test("a closed task must record what defined it", () => {
  const empty = task().replace("## Sources\n\n- `docs/project/brief.md`\n", "## Sources\n\n");
  rejects(makeRepo({ tasks: { "T-001-a.md": empty } }), "docs/tasks/T-001-a.md",
    /status is done but `## Sources` is empty/);

  const open = task({ status: "ready" }).replace("## Sources\n\n- `docs/project/brief.md`\n", "## Sources\n\n");
  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": open } })).code, 0, "an open task may still be filling in");
});

test("unimplemented requirements are reported, never failed", () => {
  const root = makeRepo({ project: specs, tasks: { "T-001-a.md": task({ implements: ["FR-1"] }) } });
  const { code, stdout } = lint(root);
  assert.equal(code, 0, "a backlog is not a defect");
  assert.match(stdout, /1 spec id\(s\) no task implements — NFR-1/);
  assert.doesNotMatch(stdout, /FR-1,/, "an implemented requirement must not be reported");
});

// --- Verification that survives (D-015) ---

test("a closed task must name a check that only this change could break", () => {
  const none = task().replace("## Verification\n\n- Task-specific: nothing to check.\n\n", "");
  rejects(makeRepo({ tasks: { "T-001-a.md": none } }), "docs/tasks/T-001-a.md",
    /status is done but `## Verification` names no task-specific check/);

  const gateOnly = task().replace("- Task-specific: nothing to check.", "- Final: `npm run check`");
  rejects(makeRepo({ tasks: { "T-001-a.md": gateOnly } }), "docs/tasks/T-001-a.md",
    /names no task-specific check/);

  const empty = task().replace("- Task-specific: nothing to check.", "- Task-specific:");
  rejects(makeRepo({ tasks: { "T-001-a.md": empty } }), "docs/tasks/T-001-a.md",
    /names no task-specific check/);

  assert.equal(lint(makeRepo({ tasks: { "T-001-a.md": task({ status: "doing" }) } })).code,
    0, "an open task has not made the claim yet");
});

test("WHEN one task breaks the closure rule and the verification rule THE SYSTEM SHALL report both in one run", () => {
  const broken = task()
    .replace("- Task-specific: nothing to check.", "- Final: `npm run check`")
    .replace("- [x] Done.", "- [ ] Not done.");

  const { code, stderr } = lint(makeRepo({ tasks: { "T-001-a.md": broken }, journal: "" }));
  assert.equal(code, 1);
  assert.match(stderr, /JOURNAL\.md has no line for T-001/, "T-004's closure rule");
  assert.match(stderr, /1 acceptance criteria are still unchecked/, "T-004's criteria rule");
  assert.match(stderr, /names no task-specific check/, "T-006's verification rule");
  assert.match(stderr, /3 problem\(s\)/, "one run must report every violation, not the first");
});
