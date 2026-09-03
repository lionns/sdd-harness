#!/usr/bin/env node
/**
 * Generates `harness.lock`, the hash manifest of the vendored governance surface (D-033).
 *
 * Run it in the repository that owns the harness, in the same commit that changes governance: the
 * linter reads the lock wherever it finds one, so a stale lock fails here and a drifted copy fails
 * in the repository that installed it. Never copied into a target, like `harness-init.mjs`.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, config, fileHash } from "./lib/harness.mjs";

/**
 * The governance surface an install vendors into a target, as `[source, installed]`. It mirrors the
 * trees and scripts `harness-init` copies, minus `templates/project`, which a project fills in and
 * owns afterwards. The install-and-verify test is what holds the two lists together.
 */
export const VENDORED = [
  ["docs/sdd", "docs/sdd"],
  ["scripts/lib", "scripts/lib"],
  ["scripts/harness-status.mjs", "scripts/harness-status.mjs"],
  ["scripts/harness-lint.mjs", "scripts/harness-lint.mjs"],
  ["templates/githooks", ".githooks"],
  ["templates/claude", ".claude"],
];

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);

/** Every installed path, keyed as the target sees it rather than as this repository stores it. */
export function manifest(root = ROOT) {
  const files = {};
  for (const [from, to] of VENDORED) {
    const source = join(root, from);
    const paths = from.endsWith(".mjs") ? [source] : walk(source);
    for (const path of paths) files[join(to, relative(source, path))] = fileHash(path);
  }
  return { harness: config(root).harness, source: config(root).project, algorithm: "sha256", files };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const lock = manifest();
  writeFileSync(join(ROOT, "harness.lock"), `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`harness-manifest: ${Object.keys(lock.files).length} file(s) pinned at ${lock.harness}`);
}
