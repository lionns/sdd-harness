# D-012 — Adoption templates live in `templates/`, not `docs/project/`

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-003, T-005

## Context

`README.md` told adopters to copy `docs/project/` into their repo, but two of its eight files —
`brief.md` and `quality-gates.md` — held this repo's own specifications. An adopter inherited a brief
that said "build and maintain the SDD harness itself". The harness also never shipped the one file
that makes it take effect with a coding agent: the `CLAUDE.md` that points at `STATUS.md` first.

## Decision

Pristine adoption material lives in `templates/`: `CLAUDE.md`, `harness.json`, `JOURNAL.md`, and
`templates/project/`. `docs/project/` holds this repo's real, filled specifications, like any other
project running the harness.

## Consequences

- The copy path is unambiguous and cannot leak this repo's content into an adopter's specs.
- Two places now describe a project spec: the template and this repo's filled copy. They drift
  independently; the template is the normative shape.
- `docs/project/design-handoff.md` is dropped here — this repo has no UI — while the template keeps it.
- Enables a bootstrap script with an obvious source tree (T-005, D-014).

## References

- `templates/`, `README.md` § Using it in a project
- `T-003`
