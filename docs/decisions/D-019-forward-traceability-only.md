# D-019 — Forward traceability is linted; reverse traceability is not

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-010

## Context

Practitioner reports name spec drift the first practical problem of spec-driven work: specs and
implementation diverge with nothing detecting it. We already link tasks to decisions and to journal
lines, but `requirements.json` ids connect to nothing. The symmetric idea — proving every code change
traces to an authorized task — needs git archaeology that misfires on any reorganization.

## Decision

Tasks may declare `implements: [FR-1, US-2]`. The linter fails on an id with no matching entry, and
reports requirements no task implements without failing. Reverse traceability is not attempted.

## Consequences

- Zero cost per session; it is a check, not a rule the agent must hold.
- `implements` stays optional, because harness-maintenance tasks implement no product requirement and
  a mandatory field would produce fictional links.
- An unimplemented requirement is a backlog, not a defect, so it never fails the gate — at the price
  of a report line people may learn to ignore.
- Drift between a requirement's wording and the code it describes remains undetected. Only the
  existence of a link is checked, never its truth.

## References

- `scripts/harness-lint.mjs`, `docs/project/requirements.json`
- `T-010`
