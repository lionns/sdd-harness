import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const ROOT = new URL("../../", import.meta.url).pathname;
export const TASK_STATES = ["ready", "doing", "review", "blocked", "done", "superseded"];
export const DECISION_STATES = ["proposed", "accepted", "superseded"];
export const OPEN_STATES = ["ready", "doing", "review", "blocked"];

export function config(root = ROOT) {
  return JSON.parse(readFileSync(join(root, "harness.json"), "utf8"));
}

function listMarkdown(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && filter(f))
    .sort()
    .map((f) => ({ name: f, path: join(dir, f), text: readFileSync(join(dir, f), "utf8") }));
}

/** Parses the YAML subset we allow in task front-matter: scalars and flat [a, b] lists. */
export function frontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    const value = raw.trim().replace(/^["']|["']$/g, "");
    out[key] = value.startsWith("[")
      ? value.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean)
      : value;
  }
  return out;
}

/** Returns the lines of a `## <name>` section, excluding its heading. */
export function section(text, name) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim().toLowerCase() === `## ${name.toLowerCase()}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^## /.test(l));
  return end === -1 ? rest : rest.slice(0, end);
}

export function tasks(root = ROOT) {
  return listMarkdown(join(root, "docs/tasks")).map((f) => ({ ...f, meta: frontMatter(f.text) }));
}

export function decisions(root = ROOT) {
  // Collect every non-index file so a malformed name is reported, not silently skipped.
  return listMarkdown(join(root, "docs/decisions"), (f) => f !== "README.md").map((f) => {
    const title = f.text.match(/^#\s*(.+)$/m)?.[1]?.trim() ?? f.name;
    const status = f.text.match(/^-\s*Status:\s*(\S+)/m)?.[1]?.trim().toLowerCase() ?? "";
    const date = f.text.match(/^-\s*Date:\s*(\S+)/m)?.[1]?.trim() ?? "-";
    const supersedes = f.text.match(/^-\s*Supersedes:\s*(.+)$/m)?.[1]?.trim() ?? "none";
    return { ...f, id: f.name.slice(0, 5), title, status, date, supersedes };
  });
}

export function journal(root = ROOT) {
  const path = join(root, "JOURNAL.md");
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line, i) => ({ line: line.trim(), number: i + 1 }))
    .filter((e) => e.line && !/^(#|>|<!--)/.test(e.line));
}

export function sddDocLines(root = ROOT) {
  return listMarkdown(join(root, "docs/sdd")).reduce(
    (total, f) => total + f.text.split(/\r?\n/).length,
    0,
  );
}
