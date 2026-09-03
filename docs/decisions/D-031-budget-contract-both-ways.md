# D-031 — The linter and `harness.json` must agree on which budgets exist

- Status: accepted
- Date: 2026-09-03
- Supersedes: none
- Tasks: T-018

## Context

A budget absent from `harness.json` disables its own check in silence: with `taskPlanLines` deleted,
a 280-line plan reported `harness-lint: clean`, since `n > undefined` is false. The mirror image is
`journalEntryLines: 1`, declared and read by nothing. Under-declaring turns a gate off without a
word; over-declaring names a rule that does not exist. Either way the file stops being a truthful
statement of what is enforced, the only reason to keep the numbers there rather than in code.

## Decision

`harness-lint` validates its budget contract in both directions before checking anything, and fails
naming the offending key:

- A budget the linter reads that `harness.json` does not declare is an error, not a skipped check.
- A budget `harness.json` declares that no check reads is an error too.

`journalEntryLines` is removed rather than given a check: the one-line rule holds by construction,
since the journal is parsed per line and each line must carry seven pipe-separated fields. `PATCH` —
`0.8.1` (D-029), restoring what `PROTOCOLS.md` § Budgets already calls enforced rather than
suggested. Its entry carries the migration `0.8.0` omits.

## Consequences

- A repository that upgrades `scripts/` without its `harness.json` fails loudly on the first run —
  the migration path for every adopter on `0.7.1`. `templates/harness.json` must carry the new keys
  in the same release, or every fresh install fails its first lint.
- `harness.json` becomes readable as the list of what is enforced, both ways, at the price of two
  places to touch when adding one. The set is found by scanning `scripts/` for `budgets.<name>`
  textually, so `budgets.foo` in prose there makes `foo` required — a known limit, its own task.

## References

- `docs/sdd/VERSION.md` § Change Rules · `docs/sdd/PROTOCOLS.md` § Budgets · `D-029`, `D-030`
