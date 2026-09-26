# D-036 — Put human attention on product outcomes and consequential choices

- Status: accepted
- Date: 2026-09-26
- Supersedes: none
- Tasks: T-026

## Context

Lean 0.11 asks for human acceptance on every technical task and has no resource check. The
foundation gate sees `accepted` but cannot establish who chose the stack or deployment. The user
wants to test the product, set business constraints, and decide expensive or risky tradeoffs while
agents verify routine implementation and documentation. The user approved this change on
2026-09-26.

## Decision

For new lean tasks, classify validation as routine, product, or consequential. Routine closure uses
executed checks and agent verification; product and consequential closure needs explicit human
acceptance, and consequential work needs an independent verifier. Present product previews and
plain-language choices to the human. New lean foundation decisions record a human choice; this is
an auditable claim, not proof of identity. Assess resource impact at task start and measure affected
runtime paths before and after. Production releases follow the human-approved deployment policy;
first or high-risk releases require approval before execution. Existing task versions keep their
closure rules and standard remains unchanged.

## Consequences

- Human attention is reserved for product use, irreversible choices, and risky releases.
- Mechanical records cannot authenticate a human reply or block an arbitrary deploy command;
  production systems need provider-side protected environments or equivalent controls.
- Resource measurements add work only to tasks that affect a cost-bearing path.

## References

- `T-026` · `D-034` · `D-035` · `docs/project/brief.md`
