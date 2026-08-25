# D-008 — One file per decision, not one log

- Status: accepted
- Date: 2026-08-25
- Supersedes: none
- Tasks: -

## Context

`DECISION_LOG.md` grew to 794 lines in `products/orbiq`, 650 in `clients/boda`, 645 in
`products/web`, with new entries appended at the top. Every decision touched the same file, so
diffs were unreadable, individual decisions could not be linked or superseded cleanly, and reading
one decision meant loading all of them.

## Decision

Each decision is its own file, `docs/decisions/D-###-<slug>.md`, capped at 40 lines, immutable once
accepted — superseded by a new file rather than edited. `docs/decisions/README.md` is a generated
index table.

## Consequences

- Decisions become linkable by ID, greppable, and individually diffable.
- Supersession is explicit instead of implied by position in a list.
- More files; the index is what keeps them navigable, so it must stay generated, never hand-edited.

## References

- `docs/sdd/TEMPLATES.md` § Decision File
- `scripts/harness-status.mjs`
