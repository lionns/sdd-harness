# Quality Gates

Commands run from the repo root. No dependencies to install — Node >= 24 only.

## Baseline Checks

Run these before starting new implementation.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | `npm test` | yes | `node --test "tests/**/*.test.mjs"` — covers `scripts/lib`, both renderers, and the `harness-lint` CLI contract |
| Harness records | `npm run lint` | yes | Budgets and record shape (D-009) |
| Type check | — | no | No TypeScript in this repo |
| Build | — | no | Nothing to build |

## Final Acceptance Checks

Run these before requesting review or human validation.

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | `npm test` | yes | Must be green; a new behavior in `scripts/` needs a test with it |
| Harness records | `npm run check` | yes | Regenerates `STATUS.md`, then lints. Not optional. |
| Type check | — | no | — |
| Build | — | no | — |

`npm run check` regenerates `STATUS.md` before linting, because `harness-lint` fails if it is stale.
Run `npm test` first: it exercises the scripts that `check` then relies on.

## Manual Validation

Under the `solo` profile, accepting the change is the validation (`HARNESS.md` § Human Validation
Gate). Before accepting a change to the governance surface — `docs/sdd/`, `harness.json`, `scripts/` —
confirm it carries a decision file and, if behavior changed, a `VERSION.md` entry.

## Known Exceptions

None outstanding.

- T-001 waived the baseline gate because it was the task that created the baseline
  (`HARNESS.md` § Exceptions, case four). Closed — no follow-up.
