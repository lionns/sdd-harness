# Quality Gates

## Baseline Checks

Run these before starting new implementation.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | <!-- command --> | yes | <!-- notes --> |
| Type check | <!-- command --> | <!-- yes/no --> | <!-- notes --> |
| Lint | <!-- command --> | <!-- yes/no --> | <!-- notes --> |
| Build | <!-- command --> | <!-- yes/no --> | <!-- notes --> |

## Final Acceptance Checks

Run these before requesting review or human validation.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | <!-- command --> | yes | <!-- notes --> |
| Type check | <!-- command --> | <!-- yes/no --> | <!-- notes --> |
| Lint | <!-- command --> | <!-- yes/no --> | <!-- notes --> |
| Build | <!-- command --> | <!-- yes/no --> | <!-- notes --> |
| Harness records | `node scripts/harness-lint.mjs` | yes | Budgets and record shape (D-009). Not optional. |

`STATUS.md` must be regenerated (`node scripts/harness-status.mjs`) before the final checks;
`harness-lint` fails if it is stale.

## Manual Validation

<!-- Document required manual checks, product owner validation, design validation, or release checks. -->

- 

## Known Exceptions

<!-- Temporary exceptions must include owner, reason, expiration condition, and follow-up task. -->

- 
