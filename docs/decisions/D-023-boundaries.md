# D-023 — One reader of records; documents never depend on scripts

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-012
- Foundation: boundaries

## Context

Recorded, not chosen today, and visible in the import graph: `harness-status` and `harness-init`
import only from `scripts/lib/harness.mjs`; `harness-lint` imports that plus the two renderers from
`harness-status`. Nothing in `docs/` or `templates/` references a script by anything but name.

## Decision

`scripts/lib/harness.mjs` is the only module that reads a record from disk and gives it structure.
Every other script consumes that structure and never re-parses. `harness-lint` detects staleness by
importing the real renderers and comparing to disk, rather than owning a second copy of the format.
`docs/` and `templates/` are data to the scripts, never dependencies of them.

## Consequences

- A change to a record's shape has one place to happen, which is why adding `- Foundation:` cost one
  line in the parser (T-011).
- Generated files cannot drift from their generator, because the check *is* the generator.
- `templates/` never contains this repo's own content, so an adopter cannot inherit our decisions
  by accident (D-012).
- The cost: `harness-lint` depends on `harness-status`, so a renderer change can fail the linter.
  That coupling is deliberate — it is the mechanism that makes staleness detectable.

## References

- `scripts/lib/harness.mjs`, `scripts/harness-lint.mjs`, `scripts/harness-status.mjs`
