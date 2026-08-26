import { test, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { makeRepo, cleanup, lint, task, decision } from "./helpers/fixture.mjs";

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
  assert.match(stdout, /harness-lint: clean \(1 tasks, 1 decisions, docs\/sdd 3\/600 lines\)/);
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

test("a task over its line budget is rejected, and the message says to split it", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  appendFileSync(join(root, "docs/tasks/T-001-a.md"), "filler\n".repeat(120));
  rejects(root, "docs/tasks/T-001-a.md", /lines exceeds the 120-line budget — split the task/);
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
