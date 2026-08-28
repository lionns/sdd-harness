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

Run these before requesting review or human validation. Both tables must be green. Weakening,
skipping, or narrowing any of them to reach green is a defect (`docs/sdd/ROLES.md`).

### Checks the agent iterates against

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Tests | `npm test` | yes | Must be green; a new behavior in `scripts/` needs a test with it |
| Harness records | `npm run check` | yes | Regenerates `STATUS.md`, then lints. Not optional. |
| Type check | — | no | — |
| Build | — | no | — |

### Checks that exercise the change in composition

| Check | Command or Procedure | Required | Notes |
| --- | --- | --- | --- |
| Integration | `npm test` — `tests/init.test.mjs`, `tests/hooks.test.mjs` | yes | Installs the harness into a temp repo and runs the real CLIs and the `Stop` hook against it, rather than importing them |
| Rule composition | `npm test` — the multi-violation case in `tests/lint.test.mjs` | yes | Asserts every rule still reports in one run, not just the first |

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
