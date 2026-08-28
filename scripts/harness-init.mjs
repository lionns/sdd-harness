#!/usr/bin/env node
/**
 * Installs the harness into a target repository (D-014).
 *
 *   node scripts/harness-init.mjs <target> --project=<name> [--profile=solo|team] [--force]
 *
 * Copies the harness documents, the specification templates, and the two enforcement scripts, then
 * generates STATUS.md so the result is lint-clean on arrival. Never overwrites without --force, and
 * never copies itself: this script is useless inside an installed project.
 */
import { cpSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { ROOT, config, FOUNDATION_TOPICS } from "./lib/harness.mjs";

const PROFILES = ["solo", "team"];
const SCRIPTS = ["harness-status.mjs", "harness-lint.mjs"];

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (const arg of argv) {
    const match = arg.match(/^--([a-z]+)(?:=(.*))?$/);
    if (match) flags[match[1]] = match[2] ?? true;
    else positional.push(arg);
  }
  return { target: positional[0], ...flags };
}

/**
 * The full install plan as `[relative path, contents]`, so collisions are known before any write.
 *
 * Greenfield declares the foundation topics, which turns the inception gate on from the first task
 * (D-020). Brownfield declares none — an existing repo with work in flight would go red on arrival —
 * and instead ships the task that records what the code already does and then declares them.
 */
export function plan({ project, profile, adopt = false, root = ROOT }) {
  const version = config(root).harness;
  const harness = { ...JSON.parse(readFileSync(join(root, "templates/harness.json"), "utf8")), project, profile };
  harness.harness = version;
  harness.foundation = adopt ? [] : FOUNDATION_TOPICS;
  const files = [
    ["harness.json", `${JSON.stringify(harness, null, 2)}\n`],
    ["AGENTS.md", readFileSync(join(root, "templates/AGENTS.md"), "utf8")],
    ["CLAUDE.md", readFileSync(join(root, "templates/CLAUDE.md"), "utf8")],
    ["JOURNAL.md", readFileSync(join(root, "templates/JOURNAL.md"), "utf8")],
  ];
  if (adopt) {
    const seed = readFileSync(join(root, "templates/T-001-record-the-foundation.md"), "utf8");
    files.push(["docs/tasks/T-001-record-the-foundation.md", seed.replace("__HARNESS__", version)]);
  }
  return files;
}

function install({ target, project, profile, adopt = false, hooks = false, claude = false, force = false }) {
  const files = plan({ project, profile, adopt });
  const trees = [
    ["docs/sdd", "docs/sdd"],
    ["templates/project", "docs/project"],
    ["scripts/lib", "scripts/lib"],
    // The neutral gate: git runs it for every agent, and for a human using none (D-027).
    ...(hooks ? [["templates/githooks", ".githooks"]] : []),
    // Standalone `.claude/`, not a plugin: checked into the adopting repo, so every teammate gets it
    // with no install step (D-017). An accelerator on top of the git hook, never a replacement.
    ...(claude ? [["templates/claude", ".claude"]] : []),
  ];

  const collisions = force ? [] : [
    ...files.map(([path]) => path),
    ...trees.map(([, to]) => to),
    ...SCRIPTS.map((s) => `scripts/${s}`),
  ].filter((path) => existsSync(join(target, path)));
  if (collisions.length) {
    throw new Error(`${collisions.length} path(s) already exist — pass --force to overwrite:\n  ${collisions.join("\n  ")}`);
  }

  for (const [from, to] of trees) cpSync(join(ROOT, from), join(target, to), { recursive: true });
  for (const script of SCRIPTS) cpSync(join(ROOT, "scripts", script), join(target, "scripts", script));

  // Before the files: the brownfield seed task lands inside `docs/tasks/`, which does not exist yet.
  const empty = ["docs/tasks", "docs/decisions", ...(profile === "team" ? ["docs/traces"] : [])];
  for (const dir of empty) {
    mkdirSync(join(target, dir), { recursive: true });
    writeFileSync(join(target, dir, ".gitkeep"), "");
  }
  for (const [path, contents] of files) writeFileSync(join(target, path), contents);

  // cpSync does not reliably carry the executable bit, and git silently ignores a hook it cannot run.
  if (hooks) chmodSync(join(target, ".githooks/pre-push"), 0o755);

  execFileSync(process.execPath, [join(target, "scripts/harness-status.mjs")], { stdio: "pipe" });
  return [
    ...files.map(([p]) => p),
    ...trees.map(([, t]) => `${t}/`),
    ...SCRIPTS.map((s) => `scripts/${s}`),
    ...empty.map((d) => `${d}/`),
    "STATUS.md",
  ];
}

const args = parseArgs(process.argv.slice(2));
if (!args.target || !args.project) {
  console.error("usage: harness-init <target> --project=<name> [--profile=solo|team] [--adopt] [--hooks] [--claude] [--force]");
  process.exit(1);
}
const profile = args.profile === true || args.profile === undefined ? "solo" : args.profile;
if (!PROFILES.includes(profile)) {
  console.error(`harness-init: profile must be one of ${PROFILES.join(" | ")}, got "${profile}"`);
  process.exit(1);
}

const target = resolve(args.target);
mkdirSync(target, { recursive: true });
try {
  const adopt = Boolean(args.adopt);
  const hooks = Boolean(args.hooks);
  const written = install({ target, project: args.project, profile, adopt, hooks, claude: Boolean(args.claude), force: Boolean(args.force) });
  const flags = [profile, adopt && "adopt", hooks && "hooks", args.claude && "claude"].filter(Boolean).join(", ");
  console.log(`harness-init: installed ${config().harness} (${flags}) into ${target}`);
  for (const path of written) console.log(`  ${path}`);

  // Per clone, not per repo: git keeps `core.hooksPath` in .git/config, which is not checked in.
  if (hooks) {
    try {
      execFileSync("git", ["-C", target, "rev-parse", "--git-dir"], { stdio: "pipe" });
      execFileSync("git", ["-C", target, "config", "core.hooksPath", ".githooks"], { stdio: "pipe" });
      console.log("\n  git config core.hooksPath .githooks   (set)");
    } catch {
      console.log("\n  Not a git repository yet. After `git init`, run:  git config core.hooksPath .githooks");
    }
  }
  console.log(adopt
    ? "\nNext: work T-001. Record what this codebase already decides, one accepted decision per topic, then declare them in harness.json."
    : `\nNext: fill docs/project/brief.md, then settle the foundation — one accepted decision per topic in ${FOUNDATION_TOPICS.join(", ")}. No task leaves \`ready\` until they exist.`);
} catch (error) {
  console.error(`harness-init: ${error.message}`);
  process.exit(1);
}
