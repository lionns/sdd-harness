# D-018 — A grammar for behavioral criteria, and no linter for it

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-009

## Context

T-004 made `done` require every acceptance criterion ticked, but a tick says nothing about what the
criterion asked. Free-form criteria leave ambiguity that an agent resolves by guessing. EARS — the
`WHEN <trigger> THE SYSTEM SHALL <result>` pattern from Rolls-Royce requirements practice, adopted by
Kiro — turns a criterion into something a check can decide, at the same line count.

## Decision

Behavioral acceptance criteria use the trigger/result grammar. Criteria that are not about behavior
stay plain. The grammar is not linted.

## Consequences

- Costs nothing per session: the same line, written less ambiguously.
- Deliberately unenforced. A regex here would reward wording over meaning and turn the grammar into
  the ceremony it exists to prevent.
- The exemption for non-behavioral criteria is what keeps it from becoming boilerplate.
- Closed tasks are not rewritten; the two styles coexist in the record.

## References

- `docs/sdd/TEMPLATES.md` § Task File
- `T-009`, `T-004`
