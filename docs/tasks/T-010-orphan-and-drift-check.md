---
id: T-010
title: Catch orphan work and unimplemented requirements in the linter
status: ready
profile: solo
harness: 0.3.0
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

- [ ] A task citing `FR-99`, absent from `requirements.json`, fails lint naming the id.
- [ ] A `done` task with an empty `## Sources` section fails lint.
- [ ] A requirement no task implements appears in the clean-run report and does **not** change the
      exit code.
- [ ] Omitting `implements` entirely is valid and produces no output.
- [ ] The reader tolerates a project with no `requirements.json` at all, as `harness-init` installs
      an empty one.
- [ ] `npm run check` is green, and this repo's own tasks pass without adding fictional links.

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

- Changes:
- Files:
- Baseline result:
- Final result:
- Decisions recorded:
- Follow-up:
