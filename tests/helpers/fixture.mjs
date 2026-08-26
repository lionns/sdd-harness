import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE_SCRIPTS = new URL("../../scripts", import.meta.url);

const DEFAULT_CONFIG = {
  harness: "0.2.0",
  profile: "solo",
  project: "fixture",
  budgets: {
    taskFileLines: 120,
    traceBlockLines: 25,
    decisionFileLines: 40,
    journalEntryLines: 1,
    sddDocsTotalLines: 600,
  },
};

const created = [];

/**
 * Builds a throwaway repo that the real scripts can run against.
 *
 * `scripts/` is copied in rather than imported with a root argument because `harness-lint.mjs`
 * derives its root from `import.meta.url` and exits the process. Copying keeps the governance
 * surface untouched and tests the CLI contract the quality gate actually invokes.
 */
export function makeRepo({ config = {}, tasks = {}, decisions = {}, journal = "", sdd = {}, generate = true } = {}) {
  // realpath: the scripts detect their own entrypoint by comparing `import.meta.url` against
  // `process.argv[1]`, which only agrees on a canonical path. See T-001 § Review.
  const root = realpathSync(mkdtempSync(join(tmpdir(), "harness-fixture-")));
  created.push(root);

  cpSync(SOURCE_SCRIPTS, join(root, "scripts"), { recursive: true });
  writeFileSync(join(root, "harness.json"), `${JSON.stringify({ ...DEFAULT_CONFIG, ...config }, null, 2)}\n`);
  writeFileSync(join(root, "JOURNAL.md"), journal ? `# Journal\n\n${journal}\n` : "# Journal\n");

  for (const [dir, files] of [["docs/tasks", tasks], ["docs/decisions", decisions], ["docs/sdd", sdd]]) {
    mkdirSync(join(root, dir), { recursive: true });
    for (const [name, contents] of Object.entries(files)) writeFileSync(join(root, dir, name), contents);
  }

  if (generate) status(root);
  return root;
}

/** Runs a harness script and returns its exit code and streams instead of throwing. */
function run(script, root) {
  try {
    const stdout = execFileSync(process.execPath, [join(root, "scripts", script)], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    return { code: error.status, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

export const status = (root) => run("harness-status.mjs", root);
export const lint = (root) => run("harness-lint.mjs", root);

export function cleanup() {
  for (const root of created.splice(0)) rmSync(root, { recursive: true, force: true });
}

/** A minimal task that satisfies every lint rule, so a test can break exactly one thing. */
export function task({ id = "T-001", status: state = "done", ...rest } = {}) {
  const meta = { id, title: `Task ${id}`, status: state, profile: "solo", harness: "0.2.0", goal: "Do the thing.", ...rest };
  const front = Object.entries(meta)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`)
    .join("\n");
  const trace = state === "ready" ? "" : "\n## Trace\n\n- 2026-08-26 — read: none · did: nothing · checks: none\n";
  return `---\n${front}\n---\n\n## Scope\n\n- Nothing.\n${trace}`;
}

/** A minimal decision file that satisfies every lint rule. */
export function decision({ id = "D-001", state = "accepted", supersedes = "none" } = {}) {
  return `# ${id} — Fixture decision\n\n- Status: ${state}\n- Date: 2026-08-26\n- Supersedes: ${supersedes}\n- Tasks: -\n\n## Decision\n\nSomething.\n`;
}
