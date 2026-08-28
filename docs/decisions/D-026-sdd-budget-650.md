# D-026 — The `docs/sdd/` budget rises to 650, after the duplication is spent

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-006, T-009

## Context

600 was set at 0.2.0, when `docs/sdd/` was five documents describing two gates. Since then the
harness gained an inception phase and its gate, a `Stop` hook, forward traceability, and a criteria
grammar. Three duplications were deleted first, returning 26 lines: the budget table in
`PROTOCOLS.md`, the profile table in the routing index, and the task-input and agent-output sections
in `ROLES.md` — each restating content that another document defines normatively. The remaining
overage is new content, not repetition.

## Decision

`sddDocsTotalLines` becomes 650. It stays a hard cap enforced by `harness-lint`; raising it again
requires the same thing this needed — spending the duplication first, then a decision.

## Consequences

- ~55 lines of headroom, which is roughly four releases at the current changelog rate.
- The pressure is now structural, not editorial: `VERSION.md` grows by ~12 lines every release and
  never shrinks, so the budget is increasingly consumed by history rather than by rules.
- That changelog cannot simply be trimmed. D-013 requires every version a task claims in its
  front-matter to be declared here, so deleting old entries would invalidate closed task records.
  Resolving that tension is a follow-up, not something to improvise under budget pressure.
- Raising a limit is the outcome the budget is designed to make expensive. Doing it twice in a row
  without deleting anything would be the signal that the rules, not the number, are wrong.

## References

- `harness.json`, `scripts/harness-lint.mjs`, `docs/sdd/PROTOCOLS.md` § Budgets
- `D-009`, `D-013`, `D-022`
