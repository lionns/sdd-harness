---
id: T-010
title: Catch orphan work and unimplemented requirements in the linter
status: done
profile: solo
harness: 0.6.0
role: Planner
goal: Make the linter report requirements that no task implements and tasks that cite no source, so the gap between the specification and the work is visible at zero cost per session.
decisions: [D-019]
---

## Sources

- `docs/project/requirements.json`, `user-stories.json` — ids exist but nothing links them to tasks
- `scripts/harness-lint.mjs` — already links tasks to decisions and to journal lines
- `docs/sdd/TEMPLATES.md` § Task File — `## Sources` is prose, unparsed
- `D-019`

## Scope

- Task front-matter gains an optional `implements: [FR-1, US-2]` list.
- `harness-lint`: an id in `implements` with no matching entry in the project specs fails.
- `harness-lint`: a `done` task with an empty `## Sources` section fails.
- A report line — not a failure — naming requirements no task implements.
- `TEMPLATES.md` documents the field in the front-matter block.

## Out of Scope

- Linking tasks to changed files. Deriving that from git is guesswork and would fail on any
  reorganization; the journal's file count already carries the honest version.
- Making `implements` mandatory. Harness-maintenance tasks implement no product requirement, and
  forcing a value would produce fictional links, which is worse than none.
- Failing the build on unimplemented requirements. A backlog is not a defect.

## Acceptance Criteria

- [x] A task citing `FR-99`, absent from `requirements.json`, fails lint naming the id.
- [x] A `done` task with an empty `## Sources` section fails lint.
- [x] A requirement no task implements appears in the clean-run report and does **not** change the
      exit code.
- [x] Omitting `implements` entirely is valid and produces no output.
- [x] The reader tolerates a project with no `requirements.json` at all, as `harness-init` installs
      an empty one.
- [x] `npm run check` is green, and this repo's own tasks pass without adding fictional links.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: fixtures for each rule, plus one asserting the report line is informational.

## Assumptions

- Assumption: forward traceability (requirement → task) is worth its cost; reverse traceability
  (code → authorized task) is not, at this size, without git archaeology that would misfire.

## Risks

- A report line that never fails is a line people learn to ignore. Accepted: the alternative is
  failing the gate on an ordinary backlog, which would train people to add fake links.

## Outcome

- Changes: tasks may declare `implements:`, linted against the ids `docs/project/*.json` declares; a
  `done` task needs a non-empty `## Sources`; unimplemented ids are reported without failing.
- Files: `scripts/lib/harness.mjs`, `scripts/harness-lint.mjs`, `docs/sdd/TEMPLATES.md`,
  `tests/lint.test.mjs`, `tests/helpers/fixture.mjs`.
- Baseline result: green — 73/73, lint clean.
- Final result: green — 81/81, lint clean. The report names 16 unimplemented ids.
- Decisions recorded: D-019 (accepted).
- Follow-up: all 16 spec ids are reported as unimplemented, because this repo's requirements were
  written after its tasks closed. Backfilling `implements:` into closed records would be inventing
  links; the honest reading is that the report is telling the truth about this repo.

## Trace

- 2026-08-27 — did: added `specIds()`, which walks arbitrary JSON shapes because `requirements.json`
  nests ids while `user-stories.json` is flat, and tolerates a malformed or absent spec rather than
  crashing · checks: baseline 73/73 green.
- 2026-08-27 — did: the `## Sources` rule broke the minimal fixture, fixed in the fixture. Capped
  the report at five ids plus a count, because a long line is a line people learn to skip ·
  checks: 81/81, lint clean.
