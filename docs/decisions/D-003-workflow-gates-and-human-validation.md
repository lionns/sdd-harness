# D-003 — Baseline, final, and human validation gates

- Status: accepted
- Date: 2026-05-31
- Supersedes: none
- Tasks: -

## Context

Implementation should not begin from a failing baseline, changes should not be accepted with red
final checks, and a human step was needed before marking work done.

## Decision

Define task states, the baseline gate, the final acceptance gate, the human validation gate, and
exception rules. Make `docs/project/quality-gates.md` the project-level source of configured checks.

## Consequences

- Agents block or escalate when the baseline is red before new implementation.
- Agent review alone cannot mark work done.
- Every exception to green checks is human-approved and recorded.
- D-007 keeps both check gates in all profiles but makes human validation implicit in `solo`.

## References

- `docs/sdd/HARNESS.md` § Gates
- D-007
