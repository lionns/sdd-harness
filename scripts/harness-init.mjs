#!/usr/bin/env node
/**
 * Installs the harness into a target repository (D-014).
 *
 *   node scripts/harness-init.mjs <target> --project=<name> [--profile=solo|team] [--force]
 *     [--docs-dir=<name>] [--scripts-dir=<name>]
 *
 * Copies the harness documents, the specification templates, and the two enforcement scripts, then
 * generates STATUS.md so the result is lint-clean on arrival. Never overwrites without --force, and
 * never copies itself: this script is useless inside an installed project.
 */
import { cpSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { ROOT, config, FOUNDATION_TOPICS, DEFAULT_PATHS, PATH_NAME } from "./lib/harness.mjs";
import { manifest } from "./harness-manifest.mjs";

const PROFILES = ["solo", "team"];
const SCRIPTS = ["harness-status.mjs", "harness-lint.mjs"];
const WORKFLOWS = ["standard", "lean"];


function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (const arg of argv) {
    const match = arg.match(/^--([a-z][a-z-]*)(?:=(.*))?$/);
    if (match) flags[match[1]] = match[2] ?? true;
    else positional.push(arg);
  }
  return { target: positional[0], ...flags };
}

/**
 * Rewrites `docs/` and `scripts/` where they begin a path in generated prose, for a target that names
 * those directories differently (D-038). Only for files the lock does not pin: vendored files are
 * copied verbatim and resolve the names from `harness.json` at run time instead.
 */
export function renamePaths(text, target = DEFAULT_PATHS) {
  return text
    .replace(/(?<=[`\s(])docs\//g, `${target.docs}/`)
    .replace(/(?<=[`\s(])scripts\//g, `${target.scripts}/`);
}

/**
 * An existing entry that differs from `name` only in letter case, or null.
 *
 * `existsSync` cannot see this on a case-insensitive filesystem: it reports `docs` present when the
 * disk holds `Docs`, and the install then writes into a directory whose name a case-sensitive clone
 * will not find. Reading the directory listing sees the spelling that is actually there.
 */
export function caseCollision(target, name) {
  if (!existsSync(target)) return null;
  return readdirSync(target).find((entry) => entry !== name && entry.toLowerCase() === name.toLowerCase()) ?? null;
}

/**
 * The full install plan as `[relative path, contents]`, so collisions are known before any write.
 *
 * Greenfield declares the foundation topics, which turns the inception gate on from the first task
 * (D-020). Brownfield declares none — an existing repo with work in flight would go red on arrival —
 * and instead ships the task that records what the code already does and then declares them.
 */
export function plan({ project, profile, workflow = "standard", adopt = false, root = ROOT, paths = DEFAULT_PATHS }) {
  const version = config(root).harness;
  const harness = { ...JSON.parse(readFileSync(join(root, "templates/harness.json"), "utf8")), project, profile, workflow };
  harness.harness = version;
  harness.foundation = adopt ? [] : FOUNDATION_TOPICS;
  // Declared only when it differs, so a default install writes the same harness.json as before.
  if (paths.docs !== DEFAULT_PATHS.docs || paths.scripts !== DEFAULT_PATHS.scripts) harness.paths = { ...paths };
  const files = [
    ["harness.json", `${JSON.stringify(harness, null, 2)}\n`],
    ["AGENTS.md", renamePaths(readFileSync(join(root, workflow === "lean" ? "templates/AGENTS-lean.md" : "templates/AGENTS.md"), "utf8"), paths)],
    ["CLAUDE.md", readFileSync(join(root, "templates/CLAUDE.md"), "utf8")],
    ...(workflow === "lean" ? [] : [["JOURNAL.md", readFileSync(join(root, "templates/JOURNAL.md"), "utf8")]]),
    ["CHANGELOG.md", workflow === "lean"
      ? `# Installed harness\n\n### ${version} — lean pilot\n\nRelease history: source repository.\n`
      : readFileSync(join(root, "CHANGELOG.md"), "utf8")],
  ];
  if (adopt) {
    const source = workflow === "lean" ? "pilot/foundation.md" : "templates/T-001-record-the-foundation.md";
    const seed = renamePaths(readFileSync(join(root, source), "utf8"), paths)
      .replace("__HARNESS__", version).replace("__PROFILE__", profile);
    files.push([`${paths.docs}/tasks/T-001-record-the-foundation.md`, seed]);
  }
  return files;
}

function install({ target, project, profile, workflow = "standard", adopt = false, hooks = false, claude = false, force = false, paths = DEFAULT_PATHS }) {
  // Before anything else, and even with --force: overwriting cannot fix a name the disk spells
  // differently, it only hides the problem until a case-sensitive clone (D-038).
  const clashes = Object.entries(paths)
    .map(([key, name]) => [key, name, caseCollision(target, name)])
    .filter(([, , existing]) => existing)
    .map(([key, name, existing]) => `"${existing}/" differs from "${name}/" only in letter case — pass --${key}-dir=${existing}`);
  if (clashes.length) throw new Error(`${clashes.length} directory name(s) collide:\n  ${clashes.join("\n  ")}`);
  const files = plan({ project, profile, workflow, adopt, paths });
  const scripts = workflow === "lean" ? [...SCRIPTS, "harness-evidence.mjs"] : SCRIPTS;
  const docs = (sub) => `${paths.docs}/${sub}`;
  const bin = (sub) => `${paths.scripts}/${sub}`;
  const trees = [
    ["docs/sdd", docs("sdd")],
    ["templates/project", docs("project")],
    ["scripts/lib", bin("lib")],
    ...(workflow === "lean" ? [["pilot", "pilot"]] : []),
    // The neutral gate: git runs it for every agent, and for a human using none (D-027).
    ...(hooks ? [["templates/githooks", ".githooks"]] : []),
    // Standalone `.claude/`, not a plugin: checked into the adopting repo, so every teammate gets it
    // with no install step (D-017). An accelerator on top of the git hook, never a replacement.
    ...(claude ? [["templates/claude", ".claude"]] : []),
  ];

  const collisions = force ? [] : [
    ...files.map(([path]) => path),
    ...trees.map(([, to]) => to),
    ...scripts.map((s) => bin(s)),
    "harness.lock",
  ].filter((path) => existsSync(join(target, path)));
  if (collisions.length) {
    throw new Error(`${collisions.length} path(s) already exist — pass --force to overwrite:\n  ${collisions.join("\n  ")}`);
  }

  for (const [from, to] of trees) cpSync(join(ROOT, from), join(target, to), { recursive: true });
  for (const script of scripts) cpSync(join(ROOT, "scripts", script), join(target, bin(script)));

  // Before the files: the brownfield seed task lands inside `docs/tasks/`, which does not exist yet.
  const empty = [docs("tasks"), docs("decisions"), ...(profile === "team" && workflow !== "lean" ? [docs("traces")] : [])];
  for (const dir of empty) {
    mkdirSync(join(target, dir), { recursive: true });
    writeFileSync(join(target, dir, ".gitkeep"), "");
  }
  for (const [path, contents] of files) writeFileSync(join(target, path), contents);

  // cpSync does not reliably carry the executable bit, and git silently ignores a hook it cannot run.
  if (hooks) chmodSync(join(target, ".githooks/pre-push"), 0o755);

  // The lock ships with the copy, filtered to what this install actually wrote: a target without
  // `--claude` must not be told it is missing a vendor layer it never asked for (D-033).
  const lock = manifest(ROOT, paths);
  lock.files = Object.fromEntries(Object.entries(lock.files).filter(([path]) => existsSync(join(target, path))));
  writeFileSync(join(target, "harness.lock"), `${JSON.stringify(lock, null, 2)}\n`);

  execFileSync(process.execPath, [join(target, bin("harness-status.mjs"))], { stdio: "pipe" });
  return [
    ...files.map(([p]) => p),
    ...trees.map(([, t]) => `${t}/`),
    ...scripts.map((s) => bin(s)),
    ...empty.map((d) => `${d}/`),
    "harness.lock",
    "STATUS.md",
  ];
}

const args = parseArgs(process.argv.slice(2));
if (!args.target || !args.project) {
  console.error("usage: harness-init <target> --project=<name> [--profile=solo|team] [--workflow=standard|lean] [--adopt] [--hooks] [--claude] [--force] [--docs-dir=<name>] [--scripts-dir=<name>]");
  process.exit(1);
}
const paths = {};
for (const key of ["docs", "scripts"]) {
  const value = args[`${key}-dir`];
  if (value === undefined) { paths[key] = DEFAULT_PATHS[key]; continue; }
  if (value === true || !PATH_NAME.test(value)) {
    console.error(`harness-init: --${key}-dir must be a single directory name, got ${JSON.stringify(value)}`);
    process.exit(1);
  }
  paths[key] = value;
}
const profile = args.profile === true || args.profile === undefined ? "solo" : args.profile;
if (!PROFILES.includes(profile)) {
  console.error(`harness-init: profile must be one of ${PROFILES.join(" | ")}, got "${profile}"`);
  process.exit(1);
}
const workflow = args.workflow === true || args.workflow === undefined ? "standard" : args.workflow;
if (!WORKFLOWS.includes(workflow)) {
  console.error(`harness-init: workflow must be one of ${WORKFLOWS.join(" | ")}, got "${workflow}"`);
  process.exit(1);
}

const target = resolve(args.target);
mkdirSync(target, { recursive: true });
try {
  const adopt = Boolean(args.adopt);
  const hooks = Boolean(args.hooks);
  const written = install({ target, project: args.project, profile, workflow, adopt, hooks, claude: Boolean(args.claude), force: Boolean(args.force), paths });
  const flags = [profile, workflow, adopt && "adopt", hooks && "hooks", args.claude && "claude"].filter(Boolean).join(", ");
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
  if (workflow === "lean") console.log("  Ask the human about operating constraints and consequential choices; read pilot/README.md, then copy pilot/contract.md for the next task.");
} catch (error) {
  console.error(`harness-init: ${error.message}`);
  process.exit(1);
}
