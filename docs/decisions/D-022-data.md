# D-022 — The records are the data; git is the store

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-012
- Foundation: data

## Context

Recorded, not chosen today. There is no database and no server. Every fact the harness knows lives
in a file the repository already tracks: tasks and decisions as Markdown with YAML front-matter in
`docs/tasks/` and `docs/decisions/`, machine-read specifications as JSON in `docs/project/`,
`JOURNAL.md` as an append-only log, and `STATUS.md` derived from all of it.

## Decision

Plain files in the repository are the store. Human-authored records are Markdown with front-matter;
machine-read specifications are JSON. `STATUS.md` and `docs/decisions/README.md` are derived views,
never authoritative, and are regenerated rather than edited. History is `git log --follow`, which is
why a task file is filled in place and never accumulates its own changelog.

## Consequences

- The state a session needs is readable without running anything, which is what keeps context cost
  low: `STATUS.md` is one file instead of a query.
- Parsing is regex over text, so shape is enforced by lint rules rather than a schema, and a
  malformed record is caught at check time rather than at write time.
- Concurrent edits are merge conflicts, resolved by git. There is no locking and none is wanted.
- Records outlive the tool. A repository that drops the scripts keeps every decision it made.

## References

- `scripts/lib/harness.mjs`, `docs/tasks/`, `docs/project/requirements.json`, `JOURNAL.md`
