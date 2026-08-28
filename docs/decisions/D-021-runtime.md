# D-021 — Node built-ins only, ESM, no runtime dependencies

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-012
- Foundation: runtime

## Context

Recorded, not chosen today: this is what the code has always done. `package.json` declares
`"type": "module"`, `"engines": { "node": ">=24" }`, and no `dependencies` key at all. Every import
in `scripts/` resolves to `node:fs`, `node:path`, `node:url`, or `node:child_process`.

## Decision

The harness runs on Node >= 24 with built-in modules only, as ESM `.mjs`. Nothing enters
`package.json` as a runtime or development dependency, including test frameworks and linters.

## Consequences

- An adopter installs the harness by copying files. There is no install step and nothing to audit,
  which is what makes `harness-init` viable at all (D-014).
- No supply chain, no lockfile drift, no version conflict with the host project.
- The cost is written by hand: record parsing is regex over text, the test runner is `node --test`,
  and there is no schema validation (D-022, D-025).
- Node 24 is a floor, so an adopter on an older runtime cannot use the enforcement scripts.
- Reversing this is expensive: the first dependency ends the copy-based distribution model.

## References

- `package.json`, `scripts/lib/harness.mjs`, `scripts/harness-lint.mjs`
