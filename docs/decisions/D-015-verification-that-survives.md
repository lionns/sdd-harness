# D-015 — The checks are part of the contract, not a dial

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-006

## Context

The final gate says "all configured checks pass", and nothing stops an agent from reaching that by
deleting a test, loosening an assertion, or narrowing a case. SpecBench (2026) measured the gap
between visible and held-out pass rates growing ~27 points per tenfold increase in lines of code,
and found the dominant failure is not deliberate cheating but features that pass in isolation and do
not compose. Our 120-line task budget pushes work toward exactly that shape.

## Decision

Weakening a check to reach green is a defect. A check believed wrong is a decision, not an edit.
Every project names one integration check alongside the checks the agent iterates against, and every
task carries one acceptance criterion about the change working with existing behavior.

## Consequences

- Costs under 15 lines of prose and one lint rule; no extra tokens per session, no second test suite.
- Makes the composition failure visible at the point the task is written, not at integration time.
- A pure library with no integration surface must record an exception rather than a `—`.
- The rule is prose, so it binds only agents that read it. T-008 is what would make it bite.

## References

- `docs/sdd/AGENTS.md` § Universal Rules, `templates/project/quality-gates.md`
- `T-006`
