import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The README sits in no budget, is not generated, and nothing regenerates it. It drifted four
// versions before anything noticed (D-028). These are the facts a test can hold it to.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const README = readFileSync(join(ROOT, "README.md"), "utf8");
const HARNESS = JSON.parse(readFileSync(join(ROOT, "harness.json"), "utf8"));

test("the version the README announces is the version harness.json declares", () => {
  const announced = README.match(/^Version \*\*(\d+\.\d+\.\d+)\*\*/m)?.[1];
  assert.ok(announced, "the README must announce a version in the form `Version **x.y.z**`");
  assert.equal(announced, HARNESS.harness,
    `README says ${announced}, harness.json says ${HARNESS.harness}`);
});

test("every flag the README documents exists in the init usage string", () => {
  const usage = readFileSync(join(ROOT, "scripts/harness-init.mjs"), "utf8")
    .match(/^\s*console\.error\("usage: harness-init (.+)"\);$/m)?.[1];
  assert.ok(usage, "harness-init must keep a usage string for this to check against");

  const documented = new Set([...README.matchAll(/`--([a-z]+)[^`]*`/g)].map((m) => m[1]));
  assert.ok(documented.size >= 5, "the README should still be documenting the flags");
  for (const flag of documented) {
    assert.match(usage, new RegExp(`--${flag}\\b`), `README documents --${flag}, which init does not accept`);
  }
});

test("every relative link in the README resolves to a file that exists", () => {
  const links = [...README.matchAll(/\]\(([^)#][^)]*)\)/g)].map((m) => m[1]);
  assert.ok(links.length, "the README should still be linking to the documents it names");
  for (const link of links) {
    if (/^[a-z]+:/.test(link)) continue;
    assert.equal(existsSync(join(ROOT, link)), true, `README links to ${link}, which does not exist`);
  }
});

test("the README does not restate a budget number that lives in harness.json", () => {
  for (const [name, value] of Object.entries(HARNESS.budgets)) {
    assert.doesNotMatch(README, new RegExp(`\\b${value}[- ]line`),
      `README hardcodes the ${name} budget (${value}); point at harness.json instead`);
  }
});
