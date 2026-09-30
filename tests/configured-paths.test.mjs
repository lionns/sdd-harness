import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Distinct names, not a change of case: they prove the scripts read and write only where
// harness.json points on every filesystem, including the case-insensitive ones this suite runs on.
const INIT = fileURLToPath(new URL("../scripts/harness-init.mjs", import.meta.url));
const DOCS = "documentacion";
const BIN = "herramientas";
const dirs = [];

function target() {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "harness-paths-")));
  dirs.push(dir);
  return join(dir, "app");
}

function run(script, args = [], cwd = undefined, input = undefined) {
  try {
    const stdout = execFileSync(process.execPath, [script, ...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], cwd, input });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    return { code: error.status, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

const init = (dir, ...args) => run(INIT, [dir, "--project=app", ...args]);
const inside = (dir, script, args = []) => run(join(dir, BIN, script), args, dir);

function installRenamed(...extra) {
  const dir = target();
  mkdirSync(dir, { recursive: true });
  execFileSync("git", ["init", "-q", dir]);
  const result = init(dir, `--docs-dir=${DOCS}`, `--scripts-dir=${BIN}`, "--workflow=lean", "--adopt", "--hooks", "--claude", ...extra);
  assert.equal(result.code, 0, result.stderr);
  return dir;
}

after(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });

test("WHEN installed with named directories THE SYSTEM SHALL pass status, lint, lock and both hooks together", () => {
  const dir = installRenamed();
  const listing = readdirSync(dir);
  assert.ok(listing.includes(DOCS) && listing.includes(BIN));
  assert.ok(!listing.includes("docs") && !listing.includes("scripts"), "nothing may land under the default names");

  assert.deepEqual(JSON.parse(readFileSync(join(dir, "harness.json"), "utf8")).paths, { docs: DOCS, scripts: BIN });
  const keys = Object.keys(JSON.parse(readFileSync(join(dir, "harness.lock"), "utf8")).files);
  assert.ok(keys.some((k) => k.startsWith(`${DOCS}/sdd/`)) && keys.some((k) => k.startsWith(`${BIN}/lib/`)));
  assert.ok(!keys.some((k) => /^(docs|scripts)\//.test(k)), "the lock is keyed by installed paths");

  assert.match(inside(dir, "harness-status.mjs").stdout, /up to date/);
  const lint = inside(dir, "harness-lint.mjs");
  assert.equal(lint.code, 0, lint.stderr);
  assert.match(lint.stdout, new RegExp(`${DOCS}/sdd \\d+/`));

  // The same gates an adopter runs, from where git and Claude Code run them.
  assert.equal(execFileSync("sh", [join(dir, ".githooks/pre-push")], { cwd: dir, encoding: "utf8" }).includes("clean"), true);
  const gate = run(join(dir, ".claude/hooks/harness-gate.mjs"), [], dir, JSON.stringify({ cwd: dir }));
  assert.equal(gate.code, 0);

  assert.match(readFileSync(join(dir, "AGENTS.md"), "utf8"), new RegExp(`node ${BIN}/harness-evidence\\.mjs`));
  assert.match(readFileSync(join(dir, DOCS, "tasks/T-001-record-the-foundation.md"), "utf8"), new RegExp(`${DOCS}/evidence/T-001\\.json`));
});

test("WHEN harness.json declares paths THE SYSTEM SHALL read and write records only there", () => {
  const dir = installRenamed();
  // A broken task under the configured directory must be found, and named where it lives.
  writeFileSync(join(dir, DOCS, "tasks/T-002-broken.md"), "---\nid: T-002\nstatus: nonsense\n---\n");
  const lint = inside(dir, "harness-lint.mjs");
  assert.equal(lint.code, 1);
  assert.match(lint.stderr, new RegExp(`${DOCS}/tasks/T-002-broken\\.md`));
  rmSync(join(dir, DOCS, "tasks/T-002-broken.md"));

  const evidence = inside(dir, "harness-evidence.mjs", ["T-001", "baseline", "--", process.execPath, "-e", "0"]);
  assert.equal(evidence.code, 0, evidence.stderr);
  assert.equal(existsSync(join(dir, DOCS, "evidence/T-001.json")), true);
  assert.equal(existsSync(join(dir, "docs")), false);
});

test("WHEN paths holds anything but a single directory name THE SYSTEM SHALL fail lint naming it", () => {
  const dir = installRenamed();
  const file = join(dir, "harness.json");
  const cfg = JSON.parse(readFileSync(file, "utf8"));
  for (const bad of [{ ...cfg.paths, docs: "../elsewhere" }, { ...cfg.paths, extra: "x" }]) {
    writeFileSync(file, `${JSON.stringify({ ...cfg, paths: bad }, null, 2)}\n`);
    const lint = inside(dir, "harness-lint.mjs");
    assert.equal(lint.code, 1);
    assert.match(lint.stderr, /harness\.json\n\s+paths\.(docs must be a single directory name|extra is not a harness directory)/);
  }
});

test("WHEN an existing directory differs only in case THE SYSTEM SHALL refuse, name it, and write nothing", () => {
  const dir = target();
  mkdirSync(join(dir, "Docs"), { recursive: true });
  mkdirSync(join(dir, "Scripts"));
  writeFileSync(join(dir, "Docs/owned-by-the-project.txt"), "keep\n");
  const before = readdirSync(dir).sort();

  for (const extra of [[], ["--force"]]) {
    const result = init(dir, ...extra);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /"Docs\/" differs from "docs\/" only in letter case — pass --docs-dir=Docs/);
    assert.match(result.stderr, /"Scripts\/" differs from "scripts\/" only in letter case — pass --scripts-dir=Scripts/);
    assert.deepEqual(readdirSync(dir).sort(), before, "a refused install writes nothing");
    assert.deepEqual(readdirSync(join(dir, "Docs")), ["owned-by-the-project.txt"]);
  }
  assert.equal(init(dir, "--docs-dir=Docs", "--scripts-dir=Scripts").code, 0, "naming them resolves it");
});

test("a directory name that could escape the target is refused before anything is written", () => {
  const dir = target();
  for (const flag of ["--docs-dir=../out", "--scripts-dir=a/b", "--docs-dir"]) {
    const result = init(dir, flag);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /must be a single directory name/);
  }
  assert.equal(existsSync(join(dir, "harness.json")), false);
});

test("WHEN paths is absent THE SYSTEM SHALL install exactly as before, declaring nothing", () => {
  const dir = target();
  assert.equal(init(dir).code, 0);
  assert.equal("paths" in JSON.parse(readFileSync(join(dir, "harness.json"), "utf8")), false);
  assert.equal(existsSync(join(dir, "docs/sdd/HARNESS.md")), true);
  assert.match(readFileSync(join(dir, "AGENTS.md"), "utf8"), /node scripts\/harness-status\.mjs/);
});
