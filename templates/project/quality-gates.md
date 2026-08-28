# Quality Gates

Commands run from the repo root. Name the real commands — the harness gates invoke these verbatim.

## Baseline Checks

Run these before starting new implementation. Any required failure blocks the task.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | <!-- e.g. `npm test` --> | yes | |
| Harness records | `node scripts/harness-lint.mjs` | yes | Budgets and record shape (D-009) |
| Type check | <!-- or `—` --> | | |
| Lint | <!-- or `—` --> | | |
| Build | <!-- or `—` --> | | |

## Final Acceptance Checks

Run these before requesting review or human validation.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | <!-- e.g. `npm test` --> | yes | New behavior needs a test with it |
| Harness records | `node scripts/harness-status.mjs && node scripts/harness-lint.mjs` | yes | Regenerate before linting: `harness-lint` fails on a stale `STATUS.md` |
| Type check | <!-- or `—` --> | | |
| Lint | <!-- or `—` --> | | |
| Build | <!-- or `—` --> | | |

## Manual Validation

<!-- solo: accepting the change is the validation. team: name the validator and what they receive. -->

## Known Exceptions

<!-- A skipped check, why, who approved it, and its expiry or follow-up task. Or "None outstanding." -->
