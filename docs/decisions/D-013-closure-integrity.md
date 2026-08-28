# D-013 — Closure integrity is linted, and `team` is enforced

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-004

## Context

`harness-lint` checked the shape of records but not whether closing a task produced them. A task
could carry `status: done` with no journal line, unchecked acceptance criteria, and an invented
`harness:` version and still lint clean. The `team` profile was worse: its trace files and validation
record existed only in prose, because the trace rule was gated on `profile === "solo"`.

## Decision

The linter enforces the Definition of Done it already documents: a `done` task needs a journal line
for its id and no unchecked acceptance criterion, and every task's `harness:` must appear in
`VERSION.md`. Under `team`, a task past `ready` needs a trace file in `docs/traces/`, and a `done`
task needs a `## Validation` section naming the validator.

## Consequences

- `done` becomes a claim the tooling can check, not a self-assessment.
- `VERSION.md` becomes machine-read: its `### x.y.z` headings are the set of valid versions.
- A repo upgrading from 0.2.x may fail on tasks it had already closed. Staying on an older version
  remains valid (`VERSION.md` § Change Rules).
- The "validation record" of `HARNESS.md` § Profiles is now a section, not a separate file.

## References

- `scripts/harness-lint.mjs`, `docs/sdd/TEMPLATES.md` § Task File
- `T-004`
