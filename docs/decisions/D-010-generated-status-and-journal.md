# D-010 — `STATUS.md` generated, `JOURNAL.md` append-only

- Status: accepted
- Date: 2026-08-25
- Supersedes: partially D-005
- Tasks: -

## Context

Nothing in the harness answered "where does everything stand?". Reconstructing it meant opening the
plans directory, the traces directory, and the decision log — around ten files — at the start of
every session, for both the human and the agent.

## Decision

Generate `STATUS.md` from task front-matter with `scripts/harness-status.mjs`: tasks by state, open
decisions, recent journal lines, what is next. Keep `JOURNAL.md` append-only with exactly one
pipe-separated line per closed task. `STATUS.md` is the first file read at session start.

## Consequences

- Session start costs one file instead of ten.
- Task state has a single home — the front-matter — so it cannot drift between documents.
- `STATUS.md` is derived: never hand-edit it, and regenerate it before committing.

## References

- `scripts/harness-status.mjs`
- `docs/sdd/README.md`
