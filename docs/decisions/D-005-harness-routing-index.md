# D-005 — Routing index instead of reading everything

- Status: accepted
- Date: 2026-05-31
- Supersedes: none
- Tasks: -

## Context

Agents were loading every harness document by default, which wasted context and buried the relevant
rules in irrelevant ones.

## Decision

Add `docs/sdd/README.md` as a routing index that names which documents apply by role and phase, and
require agents to start there.

## Consequences

- Smaller, higher-signal context per task.
- The index is the first thing to update when protocols or roles change.
- D-010 goes further: `STATUS.md` now answers most session-start questions before any harness
  document is opened.

## References

- `docs/sdd/README.md`
- D-010
