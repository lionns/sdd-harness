# D-025 — A check is `npm run check`: tests, regenerate, lint, in that order

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-012
- Foundation: tests

## Context

Recorded, not chosen today. `npm run check` is `npm test && harness-status && harness-lint`, and
`docs/project/quality-gates.md` already names it as both the baseline and the final gate. The suite
is `node --test` with no framework, and its fixtures build throwaway repositories.

## Decision

`npm run check` is what "green" means here, in that order: tests first because they exercise the
scripts the rest relies on, then regeneration, then the linter that fails on a stale generated file.
Tests invoke the real CLIs as subprocesses rather than importing them, because the scripts derive
their root from `import.meta.url` and call `process.exit` — so the test asserts the contract the
gate actually runs.

## Consequences

- The baseline gate is not vacuous in this repository: there is always something real to run, which
  is exactly what the `tests` topic exists to guarantee for an adopter (D-020).
- New behavior in `scripts/` ships with a test, enforced socially by `CLAUDE.md` rather than by a
  coverage threshold. Nothing measures coverage and nothing is meant to.
- Subprocess tests are slower and give worse stack traces than in-process ones. Accepted: they catch
  the entrypoint and path bugs that in-process tests structurally cannot (T-002, D-011).
- A fixture builds a whole repository per test, so the suite's cost grows with the number of tests,
  not with the size of the code.

## References

- `package.json`, `docs/project/quality-gates.md`, `tests/helpers/fixture.mjs`
