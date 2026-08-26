# D-009 — Record budgets are enforced, not advised

- Status: accepted
- Date: 2026-08-25
- Supersedes: partially D-002
- Tasks: -

## Context

The context protocol already said "keep traces concise" and "do not paste full documents". Under
that rule the harness still produced a 703-line task plan in `clients/boda` and 200–330 line plans
across orbiq and web. Advisory prose was given a fair trial and did not constrain anything.

## Decision

Move the limits into `harness.json` as numbers and enforce them in `scripts/harness-lint.mjs`,
wired into the project's final check gate: task file 120 lines, trace block 25, decision file 40,
journal entry 1, `docs/sdd/` total 600. Raising a limit is a governance change.

## Consequences

- Bloat fails a check instead of accumulating silently.
- Hitting a budget is a signal to split the task, not to widen the limit.
- The linter can be wrong about a legitimately large task; that argument has to be made and recorded
  rather than assumed.

## References

- `docs/sdd/PROTOCOLS.md` § Budgets
- `scripts/harness-lint.mjs`
