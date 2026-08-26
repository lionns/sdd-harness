import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, symlinkSync, renameSync, readFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { isEntrypoint, lineCount } from "../scripts/lib/harness.mjs";
import { makeRepo, cleanup, status, lint, task } from "./helpers/fixture.mjs";

after(cleanup);

/** Re-points a fixture at itself through a symlink, the shape that broke `harness-status` (T-002). */
function viaSymlink(root) {
  const linked = join(dirname(root), `${basename(root)}-link`);
  symlinkSync(root, linked);
  return linked;
}

test("harness-status generates through a symlinked path", () => {
  const root = makeRepo({ generate: false });
  assert.equal(existsSync(join(root, "STATUS.md")), false, "fixture must start ungenerated");

  const { code, stdout } = status(viaSymlink(root));
  assert.equal(code, 0);
  assert.match(stdout, /regenerated 2 file\(s\)/, "the pre-fix bug was a silent exit 0 with no output");
  assert.equal(existsSync(join(root, "STATUS.md")), true);
});

test("npm run check does not deadlock through a symlink", () => {
  // Pre-fix: status silently did nothing, then lint reported the generated files stale and told the
  // user to run the script that had just done nothing. Unresolvable in that checkout.
  const linked = viaSymlink(makeRepo({ generate: false, tasks: { "T-001-a.md": task() } }));
  assert.equal(status(linked).code, 0);

  const { code, stdout } = lint(linked);
  assert.equal(code, 0, "lint must be clean right after status ran");
  assert.match(stdout, /harness-lint: clean/);
});

test("both scripts run from a path containing a space", () => {
  const root = makeRepo({ generate: false });
  const spaced = join(dirname(root), `${basename(root)} with space`);
  renameSync(root, spaced);

  assert.equal(status(spaced).code, 0, "pre-fix: ENOENT on a percent-encoded path");
  assert.equal(lint(spaced).code, 0);
  assert.match(readFileSync(join(spaced, "STATUS.md"), "utf8"), /# Status —/);
});

test("isEntrypoint accepts the running file and rejects any other module", () => {
  // `node --test` runs each file in a child process where argv[1] is that file, so this module is
  // the entrypoint — the positive case, asserted through a real symlink-free invocation.
  assert.equal(isEntrypoint(import.meta.url), true);
  assert.equal(isEntrypoint(new URL("../scripts/harness-lint.mjs", import.meta.url).href), false);
  assert.equal(isEntrypoint("file:///definitely/not/here.mjs"), false);
});

test("isEntrypoint is false rather than throwing when argv[1] does not exist", () => {
  const argv = process.argv[1];
  process.argv[1] = "/no/such/file.mjs";
  try {
    assert.equal(isEntrypoint(import.meta.url), false);
  } finally {
    process.argv[1] = argv;
  }
});

test("lineCount ignores one trailing newline and counts an empty file as zero", () => {
  assert.equal(lineCount(""), 0);
  assert.equal(lineCount("one\n"), 1);
  assert.equal(lineCount("one"), 1);
  assert.equal(lineCount("one\ntwo\n"), 2);
  assert.equal(lineCount("one\ntwo\n\n"), 3, "a blank final line is still a line");
  assert.equal(lineCount("one\r\ntwo\r\n"), 2);
});

test("the docs/sdd total agrees with the linter's own line counting", () => {
  // Pre-fix these disagreed: sddDocLines counted a phantom line per file, so the 600-line budget
  // was really 594 in a six-file harness.
  const { stdout } = lint(makeRepo({ sdd: { "A.md": "one\ntwo\n", "B.md": "three\n" } }));
  assert.match(stdout, /docs\/sdd 3\/600 lines/);
});
