# D-020 — The foundation is settled before task one, as decisions

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-011

## Context

`HARNESS.md` § Flow step 1 is a single sentence and every gate is per task, so nothing governs
project inception. This repo proves the cost: `docs/project/architecture.md` was created in v0.1.0
and never filled through v0.2.1 — six HTML comments across three releases. An empty prose template
does not stay empty. An agent fills it with plausible text nobody decided, and the next session
reads that text as authority.

## Decision

`harness.json` lists the `foundation` topics a project settles before work starts. Each is settled
by one accepted decision carrying `- Foundation: <topic>`. `harness-lint` fails while any task is
past `ready` and a listed topic has no accepted decision. Deferring is a legitimate decision when it
names the trigger that will force the choice; silence is not.

## Consequences

- The one-way doors cost ~200 lines once. Everything else is still decided per task, on evidence,
  so this is not a specification phase and does not scale with feature count.
- `accepted` requires a human, which puts an approval moment exactly where reversal is expensive.
- The baseline gate stops being vacuous on day zero: the `tests` topic is what defines a check.
- An absent or empty list disables the gate, so 0.3.0 adopters survive the upgrade — at the price
  that a project can silently opt out.
- A recorded foundation can still be wrong. The gate proves a choice was made and reviewed, never
  that it was correct.

## References

- `docs/sdd/HARNESS.md` § Flow, `scripts/harness-lint.mjs`, `scripts/harness-init.mjs`
- `T-011`
