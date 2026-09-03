# D-030 — Split the task budget: the plan and the record are not one number

- Status: accepted
- Date: 2026-09-03
- Supersedes: partially D-009
- Tasks: T-018

## Context

`taskFileLines: 120` counts the whole task file, so `## Outcome`, `## Review` and `## Validation`
compete with `## Scope` and `## Acceptance Criteria` for one number. An adopting repository hit this
reviewing its first task: four findings fit only after compressing a plan that was already written
and agreed. D-009's stated rationale — exceeding the budget means the task is really several tasks —
is about scope, and scope is settled before a line of the record exists. Findings are as many as
the code earns, and `ROLES.md` calls narrowing a check to reach green a defect. A budget that
rewards fewer findings is that same pressure wearing a different hat.

## Decision

Split the budget in `harness.json` and enforce both halves in `harness-lint.mjs`:

- `taskPlanLines: 120` — front-matter through `## Risks`. Unchanged number, unchanged meaning.
- `taskRecordLines: 60` — `## Outcome` to end of file. The trace block keeps its own 25 inside that.

A file with no `## Outcome` heading counts entirely against the plan. `MINOR` — `0.8.0`.

## Consequences

- Review findings stop competing with scope. Both stay bounded; neither pays for the other.
- This repository's 17 tasks pass unchanged: the largest record is 43 of the 60. The split is
  otherwise a relaxation, so the only repo it can newly fail is one whose record already exceeds 60.
- Adopters must migrate `harness.json`; silence there would disable the check, which is why D-031
  ships in the same release and makes that failure loud.
- Two numbers to hold instead of one, and `## Outcome` stops being merely conventional.
- The implementation and its tests are ported from the repository that proved them in use, rather
  than written here from the proposal.

## References

- `docs/sdd/PROTOCOLS.md` § Budgets · `docs/sdd/TEMPLATES.md` § Task File · `D-009`, `D-031`
