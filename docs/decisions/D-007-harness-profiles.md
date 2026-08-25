# D-007 — Harness profiles: `solo` and `team`

- Status: accepted
- Date: 2026-08-25
- Supersedes: partially D-001, D-003
- Tasks: -

## Context

The harness was priced for a team: seven roles, one trace file per role per task, and an explicit
human validation gate. Applied to a one-person project it produced more records than could be
followed — 18 trace files for 7 tasks in `products/orbiq`, ~30 loose traces in `clients/boda` —
without adding any safety a single operator did not already have.

## Decision

Add a `profile` field to `harness.json`. `solo` collapses to Planner · Implementer · Reviewer, moves
the trace inline into the task file, and makes human validation implicit in accepting the change.
`team` keeps the current behavior unchanged. Both profiles keep the baseline and final check gates.

## Consequences

- A solo project produces two records per task instead of five or more.
- The check gates survive, because they cost no documentation and prevent real damage.
- Two behaviors to keep coherent; the profile table in `docs/sdd/README.md` is the single statement
  of the difference.

## References

- `docs/sdd/HARNESS.md` § Profiles
- `harness.json`
