import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, appendFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { makeRepo, cleanup, task } from "./helpers/fixture.mjs";

after(cleanup);

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HOOK = join(ROOT, "templates/claude/hooks/harness-gate.mjs");
const STOP = JSON.stringify({ hook_event_name: "Stop", stop_hook_active: false });

/** Runs the Stop hook the way Claude Code does: JSON on stdin, project root in the environment. */
function fire(projectDir, input = STOP) {
  try {
    const stdout = execFileSync(process.execPath, [HOOK], {
      input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    return { code: error.status, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

test("the gate is silent on a repo whose records are valid", () => {
  const result = fire(makeRepo({ tasks: { "T-001-a.md": task() } }));
  assert.equal(result.code, 0);
  assert.equal(result.stderr, "", "a clean turn must cost the session nothing");
});

test("the gate blocks the stop and hands the violation back to the session", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  appendFileSync(join(root, "JOURNAL.md"), "not a journal line\n");

  const result = fire(root);
  assert.equal(result.code, 2, "exit 2 is what continues the conversation instead of ending it");
  assert.match(result.stderr, /expected 7 pipe-separated fields/);
  assert.match(result.stderr, /Fix them before finishing/);
});

test("a second pass never blocks, so a record the agent cannot fix does not loop the session", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  appendFileSync(join(root, "JOURNAL.md"), "not a journal line\n");

  const again = JSON.stringify({ hook_event_name: "Stop", stop_hook_active: true });
  assert.equal(fire(root, again).code, 0);
});

test("the gate stays out of the way in a repo that does not run the harness", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  rmSync(join(root, "scripts"), { recursive: true });
  assert.equal(fire(root).code, 0, "the hook may be installed user-wide; a foreign repo is not its business");
});

test("the gate survives an empty or malformed stdin", () => {
  const root = makeRepo({ tasks: { "T-001-a.md": task() } });
  assert.equal(fire(root, "").code, 0);
  assert.equal(fire(root, "{ not json").code, 0);
});

test("each skill body stays inside its budget and adds no rule of its own", () => {
  const skills = join(ROOT, "templates/claude/skills");
  for (const name of readdirSync(skills)) {
    const text = readFileSync(join(skills, name, "SKILL.md"), "utf8");
    const lines = text.split("\n").filter((l, i, a) => i < a.length - 1 || l !== "").length;
    assert.ok(lines <= 40, `${name} is ${lines} lines, budget is 40 — reference docs/sdd/, do not restate it`);
    assert.match(text, /^description:\s*\S/m, `${name} needs a description or Claude cannot decide to load it`);
    assert.match(text, /docs\/sdd\//, `${name} must point at the normative source`);
  }
});

test("this repo's .claude/ is the template, byte for byte", () => {
  const walk = (dir, base = dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name), base) : [relative(base, join(dir, e.name))]);

  const source = join(ROOT, "templates/claude");
  const installed = join(ROOT, ".claude");
  assert.deepEqual(walk(installed).sort(), walk(source).sort(), "the dogfooded copy must not drift");
  for (const file of walk(source)) {
    assert.equal(readFileSync(join(installed, file), "utf8"), readFileSync(join(source, file), "utf8"), file);
  }
});
