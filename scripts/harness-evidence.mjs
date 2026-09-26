#!/usr/bin/env node
// Runs a check and records its actual exit status for a lean task (D-034).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, config } from "./lib/harness.mjs";

const [taskId, phase, marker, command, ...args] = process.argv.slice(2);
const phases = ["baseline", "task-specific", "resource-before", "resource-after", "final"];
if (!/^[A-Z]+-\d+$/.test(taskId ?? "") || !phases.includes(phase)
    || marker !== "--" || !command) {
  console.error(`usage: harness-evidence <T-###> <${phases.join("|")}> -- <command> [args...]`);
  process.exit(2);
}
if (config().workflow !== "lean") {
  console.error("harness-evidence: enable workflow=lean in harness.json first");
  process.exit(2);
}

const path = join(ROOT, "docs/evidence", `${taskId}.json`);
let records = [];
try {
  if (existsSync(path)) records = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(records)) throw new Error("expected an array");
} catch (error) {
  console.error(`harness-evidence: cannot append to ${path}: ${error.message}`);
  process.exit(2);
}

const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
const exitCode = result.status ?? 1;
const outputTail = exitCode === 0 && !phase.startsWith("resource-")
  ? "" : `${result.stdout ?? ""}${result.stderr ?? ""}`.slice(-1000);
records.push({ at: new Date().toISOString(), phase, command: [command, ...args], exitCode, outputTail });
mkdirSync(join(ROOT, "docs/evidence"), { recursive: true });
writeFileSync(path, `${JSON.stringify(records, null, 2)}\n`);
console.log(`harness-evidence: ${taskId} ${phase} exited ${exitCode}; recorded in docs/evidence/${taskId}.json`);
if (result.error) console.error(`harness-evidence: ${result.error.message}`);
process.exit(exitCode);
