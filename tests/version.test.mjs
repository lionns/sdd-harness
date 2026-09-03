import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// `harness.json` is the one declared version. Every other file that states one is a copy, and a
// copy drifts: the README drifted four versions (D-028), the manifest one release (T-017).
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HARNESS = JSON.parse(readFileSync(join(ROOT, "harness.json"), "utf8"));
const PKG = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

test("the version package.json declares is the version harness.json declares", () => {
  assert.equal(PKG.version, HARNESS.harness,
    `package.json says ${PKG.version}, harness.json says ${HARNESS.harness}`);
});
