import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not URL.pathname: the latter keeps percent-encoding, which is the bug D-011 fixed.
const INIT = fileURLToPath(new URL("../scripts/harness-init.mjs", import.meta.url));
const HARNESS = JSON.parse(readFileSync(new URL("../harness.json", import.meta.url), "utf8"));
const targets = [];

function target() {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "harness-init-")));
  targets.push(dir);
  return join(dir, "app");
}

/** Runs a CLI and returns its exit code and streams instead of throwing. */
function run(script, args, cwd) {
  try {
    return { code: 0, stdout: execFileSync(process.execPath, [script, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], cwd }) };
  } catch (error) {
    return { code: error.status, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

const init = (dir, ...args) => run(INIT, [dir, ...args]);
const inside = (dir, script) => run(join(dir, "scripts", script), [], dir);

after(() => { for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true }); });

test("an installed harness passes its own status and lint gates", () => {
  const dir = target();
  assert.equal(init(dir, "--project=my-app").code, 0);

  const status = inside(dir, "harness-status.mjs");
  assert.equal(status.code, 0);
  assert.match(status.stdout, /up to date/, "init must leave STATUS.md already generated");

  const lint = inside(dir, "harness-lint.mjs");
  assert.equal(lint.code, 0, `installed harness must lint clean\n${lint.stderr}`);
  assert.match(lint.stdout, /harness-lint: clean \(0 tasks, 0 decisions/);
});

test("the installed manifest carries the current version, project, and profile", () => {
  const dir = target();
  init(dir, "--project=my-app", "--profile=team");
  const cfg = JSON.parse(readFileSync(join(dir, "harness.json"), "utf8"));
  assert.deepEqual(
    { harness: cfg.harness, project: cfg.project, profile: cfg.profile },
    { harness: HARNESS.harness, project: "my-app", profile: "team" },
  );
  assert.deepEqual(cfg.budgets, HARNESS.budgets);
});

test("the agent entry point and the specification templates arrive, unfilled", () => {
  const dir = target();
  init(dir, "--project=my-app");
  assert.match(readFileSync(join(dir, "CLAUDE.md"), "utf8"), /STATUS\.md/);

  const brief = readFileSync(join(dir, "docs/project/brief.md"), "utf8");
  assert.doesNotMatch(brief, /sdd-harness|SDD harness/, "an adopter must not inherit this repo's brief");
  assert.match(brief, /<!--/, "the brief arrives as a template to fill in");
});

test("team gets docs/traces, solo does not", () => {
  const team = target();
  init(team, "--project=t", "--profile=team");
  assert.ok(existsSync(join(team, "docs/traces")));

  const solo = target();
  init(solo, "--project=s");
  assert.equal(existsSync(join(solo, "docs/traces")), false);
});

test("harness-init does not copy itself into the target", () => {
  const dir = target();
  init(dir, "--project=my-app");
  assert.equal(existsSync(join(dir, "scripts/harness-init.mjs")), false);
  for (const script of ["harness-status.mjs", "harness-lint.mjs", "lib/harness.mjs"]) {
    assert.ok(existsSync(join(dir, "scripts", script)), `${script} must be installed`);
  }
});

test("a second install refuses to overwrite, and writes nothing, unless forced", () => {
  const dir = target();
  init(dir, "--project=my-app");
  writeFileSync(join(dir, "CLAUDE.md"), "# Mine\n");

  const refused = init(dir, "--project=other");
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /already exist — pass --force/);
  assert.equal(readFileSync(join(dir, "CLAUDE.md"), "utf8"), "# Mine\n", "a refused install must not write");
  assert.equal(JSON.parse(readFileSync(join(dir, "harness.json"), "utf8")).project, "my-app");

  assert.equal(init(dir, "--project=other", "--force").code, 0);
  assert.equal(JSON.parse(readFileSync(join(dir, "harness.json"), "utf8")).project, "other");
});

test("bad arguments fail before anything is written", () => {
  const dir = target();
  const bad = init(dir, "--project=x", "--profile=duo");
  assert.equal(bad.code, 1);
  assert.match(bad.stderr, /profile must be one of solo \| team, got "duo"/);
  assert.equal(existsSync(join(dir, "harness.json")), false);

  assert.equal(run(INIT, []).code, 1, "no target must fail");
  assert.equal(run(INIT, ["/tmp/whatever"]).code, 1, "no --project must fail");
});

test("harness-init installs into a target path containing a space", () => {
  const dir = join(target(), "with space");
  assert.equal(init(dir, "--project=my-app").code, 0, "pre-D-011 shape: ENOENT on a percent-encoded path");
  assert.equal(inside(dir, "harness-lint.mjs").code, 0);
});

// --- Inception modes (D-020) ---

test("a greenfield install declares the foundation, so the gate is armed before the first task", () => {
  const dir = target();
  assert.equal(init(dir, "--project=my-app").code, 0);

  const cfg = JSON.parse(readFileSync(join(dir, "harness.json"), "utf8"));
  assert.deepEqual(cfg.foundation, ["runtime", "data", "boundaries", "identity", "deploy", "tests", "interface"]);
  assert.equal(existsSync(join(dir, "docs/tasks/T-001-record-the-foundation.md")), false, "greenfield decides; it has nothing to record");
  assert.equal(inside(dir, "harness-lint.mjs").code, 0, "an install with no tasks yet is clean");
});

test("a brownfield install declares nothing and ships the task that records what exists", () => {
  const dir = target();
  const out = init(dir, "--project=legacy", "--adopt");
  assert.equal(out.code, 0);
  assert.match(out.stdout, /Next: work T-001/);

  assert.deepEqual(JSON.parse(readFileSync(join(dir, "harness.json"), "utf8")).foundation, [],
    "an existing repo with work in flight must not go red on arrival");

  const seed = readFileSync(join(dir, "docs/tasks/T-001-record-the-foundation.md"), "utf8");
  assert.match(seed, /^status: ready$/m);
  assert.match(seed, new RegExp(`^harness: ${HARNESS.harness}$`, "m"), "the seed must claim a version VERSION.md declares");
  assert.equal(inside(dir, "harness-lint.mjs").code, 0, `the seeded install must lint clean\n${inside(dir, "harness-lint.mjs").stderr}`);
});

test("the greenfield gate actually fires: a task moved to doing is refused until the topics are settled", () => {
  const dir = target();
  init(dir, "--project=my-app");

  writeFileSync(join(dir, "docs/tasks/T-001-first.md"), [
    "---", "id: T-001", "title: First", "status: doing", "profile: solo",
    `harness: ${HARNESS.harness}`, "goal: Build the thing.", "---",
    "", "## Acceptance Criteria", "", "- [ ] Built.", "", "## Trace", "", "- 2026-08-27 — started", "",
  ].join("\n"));
  run(join(dir, "scripts", "harness-status.mjs"), [], dir);

  const blocked = inside(dir, "harness-lint.mjs");
  assert.equal(blocked.code, 1, "the first task must not proceed on an unchosen architecture");
  assert.match(blocked.stderr, /unsettled: runtime, data, boundaries, identity, deploy, tests, interface/);

  for (const topic of ["runtime", "data", "boundaries", "identity", "deploy", "tests", "interface"]) {
    const n = String(["runtime", "data", "boundaries", "identity", "deploy", "tests", "interface"].indexOf(topic) + 1).padStart(3, "0");
    writeFileSync(join(dir, `docs/decisions/D-${n}-${topic}.md`),
      `# D-${n} — ${topic}\n\n- Status: accepted\n- Date: 2026-08-27\n- Supersedes: none\n- Tasks: -\n- Foundation: ${topic}\n\n## Decision\n\nChosen.\n`);
  }
  run(join(dir, "scripts", "harness-status.mjs"), [], dir);

  const cleared = inside(dir, "harness-lint.mjs");
  assert.equal(cleared.code, 0, `the gate must clear once the foundation exists\n${cleared.stderr}`);
});

test("--hooks installs the Stop gate and the skills; without it nothing changes", () => {
  const plain = target();
  init(plain, "--project=my-app");
  assert.equal(existsSync(join(plain, ".claude")), false, "the default install must stay byte-identical to 0.4.0");

  const dir = target();
  assert.equal(init(dir, "--project=my-app", "--hooks").code, 0);
  for (const path of [".claude/settings.json", ".claude/hooks/harness-gate.mjs",
    ".claude/skills/close-task/SKILL.md", ".claude/skills/plan-task/SKILL.md",
    ".claude/skills/propose-governance-change/SKILL.md"]) {
    assert.equal(existsSync(join(dir, path)), true, `missing ${path}`);
  }

  const settings = JSON.parse(readFileSync(join(dir, ".claude/settings.json"), "utf8"));
  assert.equal(settings.hooks.Stop.length, 1);
  assert.match(settings.hooks.Stop[0].command, /harness-gate\.mjs/);
  assert.equal(inside(dir, "harness-lint.mjs").code, 0, "a hooked install must still lint clean");
});

test("--hooks refuses to clobber an existing .claude/", () => {
  const dir = target();
  init(dir, "--project=my-app", "--hooks");
  const refused = init(dir, "--project=my-app", "--hooks");
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /\.claude/, "an adopter's own hooks must never be silently overwritten");
});
