# D-016 — `AGENTS.md` is the entry point; `CLAUDE.md` is a pointer

- Status: proposed
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-007

## Context

T-003 shipped `CLAUDE.md` as the file that makes the harness take effect. `AGENTS.md` is the format
30+ tools read and 60,000+ repositories carry, stewarded by the Linux Foundation's Agentic AI
Foundation. Our own brief names "multiple agent families" as a user of the `team` profile, which one
vendor's filename does not serve. Shipping both files with the same rules would double the cost of
every future edit and guarantee drift.

## Decision

The rules live in `AGENTS.md`. `CLAUDE.md` is at most three lines and points at it. One source, read
by whichever agent is in the room.

## Consequences

- No increase in context cost: an agent reads one file either way.
- Portability without vendor forks, and no second place to update a rule.
- Depends on Claude following a pointer. If it does not, the fallback is generating `CLAUDE.md` from
  `AGENTS.md` — still one source.
- A length test is required, or the pointer will grow rules of its own.

## References

- `templates/AGENTS.md`, `templates/CLAUDE.md`
- `T-007`, `D-012`
