---
id: T-001
title: Record the foundation this project already has
status: ready
profile: solo
harness: __HARNESS__
role: Planner
goal: Write down the decisions this codebase already embodies, one per foundation topic, each citing the file that proves it, then declare those topics in harness.json so the gate protects them from here on.
decisions: []
---

## Sources

- The repository itself. Every claim in a foundation decision cites a path.
- `docs/sdd/HARNESS.md` § Inception
- `docs/sdd/TEMPLATES.md` § Decision File

## Scope

- One decision file per topic in `docs/decisions/`, each carrying `- Foundation: <topic>`:
  `runtime` · `data` · `boundaries` · `identity` · `deploy` · `tests` · `interface`
- Drop any topic this project does not have. A headless service has no `interface` — delete the
  topic rather than recording it as not applicable.
- Fill `docs/project/quality-gates.md` from the `tests` decision, so the baseline gate runs real
  commands instead of passing on an empty set.
- Set `foundation: [...]` in `harness.json` to the topics that ended up with a decision.

## Out of Scope

- Changing anything the decisions describe. This task records; it does not refactor.
- Topics beyond the list. Everything else is decided per task, on evidence.
- Inventing an answer. A topic the code does not settle gets an accepted decision *to defer*, with
  a `- Trigger:` line naming the observation that will force the choice.

## Acceptance Criteria

- [ ] Every declared topic has one accepted decision citing at least one path in this repo.
- [ ] `docs/project/quality-gates.md` names the commands that actually run here.
- [ ] `harness.json` lists exactly the topics that have a decision.
- [ ] The project's own check is green and `harness-lint` reports no unsettled topic.

## Verification

- Baseline: the project's existing check command, whatever it is today
- Final: the same, plus `node scripts/harness-lint.mjs`
- Task-specific: re-read each decision against the path it cites. A decision describing code that is
  not there is worse than no decision, because the next session will trust it.

## Assumptions

- Assumption: what the code does today is the decision, whether or not anyone chose it
  deliberately. Recording it is what makes changing it deliberate.

## Risks

- The temptation is to write what the architecture *should* be. That produces a document the code
  contradicts on day one. Record what is; open a separate task for what should be.

## Outcome

- Changes:
- Files:
- Baseline result:
- Final result:
- Decisions recorded:
- Follow-up:
