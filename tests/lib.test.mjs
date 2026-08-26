import { test, after } from "node:test";
import assert from "node:assert/strict";
import { frontMatter, section, tasks, decisions, journal, sddDocLines } from "../scripts/lib/harness.mjs";
import { makeRepo, cleanup, task, decision } from "./helpers/fixture.mjs";

after(cleanup);

test("frontMatter parses scalars, quoted values, and flat lists", () => {
  const meta = frontMatter(`---\nid: T-007\ntitle: "A quoted title"\ndecisions: [D-001, D-002]\nempty: []\n---\n\nBody`);
  assert.equal(meta.id, "T-007");
  assert.equal(meta.title, "A quoted title");
  assert.deepEqual(meta.decisions, ["D-001", "D-002"]);
  assert.deepEqual(meta.empty, []);
});

test("frontMatter returns null when the block is absent or not at the top", () => {
  assert.equal(frontMatter("# Just a heading\n"), null);
  assert.equal(frontMatter("Preamble\n\n---\nid: T-001\n---\n"), null);
});

test("frontMatter ignores lines that are not key-value pairs", () => {
  assert.deepEqual(frontMatter("---\nid: T-001\n# a comment\n  - a list item\n---\n"), { id: "T-001" });
});

test("section returns a section's lines and stops at the next heading", () => {
  const text = "## Scope\n\n- one\n- two\n\n## Trace\n\n- a trace line\n";
  assert.deepEqual(section(text, "Scope"), ["", "- one", "- two", ""]);
  assert.deepEqual(section(text, "Trace"), ["", "- a trace line", ""]);
});

test("section runs to the end of the file when nothing follows, and is case-insensitive", () => {
  assert.deepEqual(section("## Trace\n\n- last\n", "trace"), ["", "- last", ""]);
  assert.equal(section("## Scope\n\n- one\n", "Review"), null);
});

test("tasks and decisions read every record, sorted, with metadata extracted", () => {
  const root = makeRepo({
    tasks: { "T-002-b.md": task({ id: "T-002" }), "T-001-a.md": task({ id: "T-001" }) },
    decisions: { "D-001-x.md": decision({ id: "D-001", state: "proposed" }) },
  });
  assert.deepEqual(tasks(root).map((t) => t.meta.id), ["T-001", "T-002"]);

  const [d] = decisions(root);
  assert.deepEqual(
    { id: d.id, status: d.status, date: d.date, supersedes: d.supersedes },
    { id: "D-001", status: "proposed", date: "2026-08-26", supersedes: "none" },
  );
});

test("decisions excludes the generated index but keeps malformed names visible", () => {
  const root = makeRepo({ decisions: { "not-a-decision.md": decision({ id: "D-001" }) } });
  assert.deepEqual(decisions(root).map((d) => d.name), ["not-a-decision.md"]);
});

test("journal skips the heading, the blockquote, and blank lines", () => {
  const root = makeRepo({ journal: "> a note\n\n2026-08-26 | T-001 | done | ok | 1 file | tests | -" });
  assert.deepEqual(journal(root).map((e) => e.line), ["2026-08-26 | T-001 | done | ok | 1 file | tests | -"]);
});

test("sddDocLines totals only markdown in docs/sdd, and is zero when empty", () => {
  assert.equal(sddDocLines(makeRepo()), 0);
  assert.equal(sddDocLines(makeRepo({ sdd: { "A.md": "one\ntwo\n", "B.txt": "ignored\n" } })), 3);
});
