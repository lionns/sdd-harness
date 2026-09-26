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

Run these before requesting review or human validation. Both tables must be green. Weakening,
skipping, or narrowing any of them to reach green is a defect, not a fix (`ROLES.md`).

### Checks the agent iterates against

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | <!-- e.g. `npm test` --> | yes | New behavior needs a test with it |
| Harness records | `node scripts/harness-status.mjs && node scripts/harness-lint.mjs` | yes | Regenerate before linting: `harness-lint` fails on a stale `STATUS.md` |
| Type check | <!-- or `—` --> | | |
| Lint | <!-- or `—` --> | | |
| Build | <!-- or `—` --> | | |

### Checks that exercise the change in composition

At least one. A change can be made to pass the table above by narrowing it; it cannot be made to
pass a check that runs it together with what already exists.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Integration | <!-- e.g. `npm run test:integration` --> | yes | Exercises this change against existing features, not in isolation |
| End-to-end | <!-- or `—` --> | | |

## Manual Validation

<!-- solo: accepting the change is the validation. team: name the validator and what they receive. -->

## Resource Checks

<!-- Name a repeatable command and budget for each critical runtime journey. Affected lean tasks
run the same measurement before and after; routine tasks with no runtime impact say why. -->

## Production Release Controls

<!-- Point to the human-approved deploy decision, preview, provider-side protection, monitoring,
and rollback. First or high-risk releases pause for live approval before execution. -->

## Known Exceptions

<!-- A skipped check, why, who approved it, and its expiry or follow-up task. Or "None outstanding." -->
