---
id: T-004
title: Enforce closure integrity and the team profile in the linter
status: done
profile: solo
harness: 0.3.0
role: Implementer
goal: Make `harness-lint` reject the ways a task can currently claim `done` without the records the Definition of Done requires, and give the `team` profile the enforcement that today exists only in prose.
decisions: [D-013]
---

## Sources

- `scripts/harness-lint.mjs` — the trace check is gated on `profile === "solo"`; nothing covers `team`
- `docs/sdd/HARNESS.md` § Definition of Done, § Profiles
- `docs/sdd/PROTOCOLS.md` § Trace
- `docs/sdd/TEMPLATES.md` § Task File
- `D-013`

## Scope

- `harness-lint`: a `done` task requires a matching `JOURNAL.md` line.
- `harness-lint`: a `done` task has no unchecked acceptance criterion.
- `harness-lint`: `harness:` front-matter must be a version listed in `docs/sdd/VERSION.md`.
- `harness-lint`: under `team`, a task past `ready` requires a trace file in `docs/traces/`, budgeted like the inline block; a `done` task requires a `## Validation` section naming a validator.
- `docs/sdd/TEMPLATES.md`: a `## Validation` section in the task template, marked `team` only.
- `scripts/lib/harness.mjs`: `traces()` and `knownVersions()` readers.
- Tests for every new rule.

## Out of Scope

- Changing any budget value, task state, or role.
- Validating journal fields beyond the task id linkage (fields 4-7 stay free-form).
- Enforcing the human validation gate in `solo`, where it is implicit by design.

## Acceptance Criteria

- [x] A `done` task with no journal line for its id fails lint with a message naming the id.
- [x] A `done` task with an unchecked `- [x]` under `## Acceptance Criteria` fails lint.
- [x] A task whose `harness:` is not in `VERSION.md` fails lint; every current task passes.
- [x] Under `team`, a `doing` task with no `docs/traces/*_<id>_*.md` file fails lint.
- [x] Under `team`, a `done` task with no `## Validation` section fails lint.
- [x] Under `solo`, none of the two `team` rules fire.
- [x] All violations are still reported in one run, not just the first.
- [x] `docs/sdd/` stays within its 600-line budget.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: `npm test` covers each new rule with a fixture that breaks exactly one thing.

## Assumptions

- Assumption: "validation record" in `HARNESS.md` § Profiles is satisfied by a `## Validation` section in the task file naming the validator and the date; no separate file is introduced.

## Risks

- An adopting repo on 0.2.x that upgrades will see its existing `done` tasks fail the new rules. Mitigated: this is a version bump, and `VERSION.md` § Change Rules already lets a project stay on an older version.

## Outcome

- Changes: `harness-lint` gained five rules — journal line for a `done` task, no unchecked
  acceptance criterion, `harness:` declared in `VERSION.md`, and under `team` a trace file plus a
  named validator. Trace filenames and their budget are linted in both profiles. `traces()` and
  `knownVersions()` added to the library; `## Validation` added to the task template.
- Files: 8 — `scripts/harness-lint.mjs`, `scripts/lib/harness.mjs`, `docs/sdd/{TEMPLATES,PROTOCOLS,HARNESS}.md`,
  `tests/lint.test.mjs`, `tests/helpers/fixture.mjs`, and the two closed tasks it caught.
- Baseline result: `npm run check` green (39/39) before starting.
- Final result: `npm run check` green (55/55); `docs/sdd` 565/600.
- Decisions recorded: D-013.
- Follow-up: none.

## Review

- Medium · `docs/tasks/T-001*.md`, `docs/tasks/T-002*.md` · the new rule found both closed tasks
  carrying ten unchecked acceptance criteria between them · `done` had been a self-assessment, which
  is the defect this task exists to fix · each criterion was re-verified against the repo and ticked.
  T-002's third criterion cites `529` lines, a point-in-time total that is now 565; the substance —
  that `sddDocLines` and the linter agree — holds and is covered by a test. Text left unedited
  rather than rewriting a closed record.
- Low · the version rule is skipped when `VERSION.md` declares nothing · a repo that deletes its
  changelog loses the check silently · accepted and documented in the code; failing every task in
  that repo would be worse. Covered by a test that pins the behavior.
- No blocking findings.

## Trace

- 2026-08-27 — role: Implementer
  - read: `scripts/harness-lint.mjs`, `docs/sdd/HARNESS.md` § DoD, `tests/lint.test.mjs`, `D-013`
  - did: five rules + trace-file linting; fixture derives a journal line for `done` tasks
  - files: `scripts/harness-lint.mjs`, `scripts/lib/harness.mjs`, `docs/sdd/*`, `tests/*`
  - checks: `npm test` 47/47 at this point; the new rules caught T-001 and T-002 on first run
  - assumptions: a `## Validation` section satisfies the team "validation record"
  - blockers: none
