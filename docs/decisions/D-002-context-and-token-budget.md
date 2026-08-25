# D-002 — Context selection and token budget rules

- Status: superseded
- Date: 2026-05-31
- Supersedes: none
- Tasks: -

## Context

Traces and handoffs had to improve future work without consuming excessive context, and agents
needed explicit rules so they would not fill gaps with assumptions.

## Decision

Add a context protocol defining compact context packets, source selection order, token budget
rules, and anti-hallucination rules.

## Consequences

- Better task context at lower overhead.
- High-impact ambiguity is treated as a blocker instead of being guessed.
- Superseded in part by D-009: the budget rules were advisory prose and did not hold. They are now
  numeric and enforced.

## References

- `docs/sdd/PROTOCOLS.md` § Context
- D-009
