import { test, after } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { makeRepo, cleanup, lint, task } from "./helpers/fixture.mjs";
import { manifest, VENDORED } from "../scripts/harness-manifest.mjs";
import { fileHash, ROOT } from "../scripts/lib/harness.mjs";

after(cleanup);

/** A fixture repo carrying a lock over its own installed scripts, as an adopter would hold one. */
function locked(source = "sdd-harness", extra = {}) {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  const files = {};
  for (const path of ["scripts/harness-lint.mjs", "scripts/lib/harness.mjs"]) {
    files[path] = fileHash(join(root, path));
  }
  writeFileSync(join(root, "harness.lock"),
    `${JSON.stringify({ harness: "0.9.0", source, algorithm: "sha256", files: { ...files, ...extra } }, null, 2)}\n`);
  return root;
}

test("a vendored file that drifted fails, naming the repository the change belongs in", () => {
  const root = locked();
  appendFileSync(join(root, "scripts/lib/harness.mjs"), "\n// a local rule\n");
  const { code, stderr } = lint(root);
  assert.equal(code, 1);
  assert.match(stderr, /scripts\/lib\/harness\.mjs/);
  assert.match(stderr, /propose the change in sdd-harness, then reinstall/);
});

// The same lock in the repository that owns the harness means something else: not "you forked it"
// but "you changed it and did not record it" (D-033).
test("in the source repository the same drift asks for the manifest to be regenerated", () => {
  const root = locked("fixture");
  appendFileSync(join(root, "scripts/lib/harness.mjs"), "\n// a real change\n");
  const { stderr } = lint(root);
  assert.match(stderr, /run `node scripts\/harness-manifest\.mjs` to record the change/);
});

test("a file the lock lists but the repository no longer holds fails too", () => {
  const root = locked("sdd-harness", { "docs/sdd/PROTOCOLS.md": "0".repeat(64) });
  const { code, stderr } = lint(root);
  assert.equal(code, 1);
  assert.match(stderr, /docs\/sdd\/PROTOCOLS\.md\n\s+listed in harness\.lock but missing/);
});

test("no lock, no check: a repository from before 0.9.0 lints exactly as it did", () => {
  const root = locked();
  rmSync(join(root, "harness.lock"));
  appendFileSync(join(root, "scripts/lib/harness.mjs"), "\n// nobody is watching\n");
  assert.equal(lint(root).code, 0);
});

test("the manifest covers every vendored path and nothing a project owns", () => {
  const files = Object.keys(manifest().files);
  assert.ok(files.includes("docs/sdd/HARNESS.md") && files.includes("scripts/lib/harness.mjs"));
  assert.ok(files.includes(".claude/settings.json") && files.includes(".githooks/pre-push"));
  for (const path of files) {
    assert.doesNotMatch(path, /^(docs\/(project|tasks|decisions|traces)|harness\.json|AGENTS\.md|JOURNAL\.md)/,
      `${path} is the project's to own, not the harness's to pin`);
  }
  assert.equal(existsSync(join(ROOT, "harness.lock")), true, "this repository ships the lock it generates");
  assert.deepEqual(JSON.parse(readFileSync(join(ROOT, "harness.lock"), "utf8")).files, manifest().files,
    "harness.lock is stale — run `node scripts/harness-manifest.mjs`");
  assert.ok(VENDORED.length >= 6);
});
