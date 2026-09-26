---
id: T-023
title: Trial a lean, evidence-first agent workflow
status: doing
profile: solo
harness: 0.9.0
role: Planner
goal: Test whether a smaller task contract and evidence-led closure reduce agent cost and human review time without lowering delivered quality.
decisions: [D-034]
---

## Sources

- `docs/project/brief.md` — records must cost less than the value they return
- `docs/sdd/HARNESS.md` — current lifecycle and gates
- `docs/sdd/TEMPLATES.md` — current task, decision, and trace shapes
- `docs/project/quality-gates.md` — existing verification baseline
- User direction, 2026-09-26 — trial the identified changes in a branch

## Scope

- Run a controlled pilot of the current workflow and a smaller task contract.
- Keep scope, authority, observable acceptance, and a green baseline/final gate.
- Replace repeated prose with compact references to direct evidence, including failed checks.
- Record wall time, available token usage, agent cost, human review time, and later rework.
- Test independent agent work only where tasks have separable inputs and integration checks.
- Correct observed documentation drift and classify historical traceability warnings.

## Out of Scope

- Claiming a productivity or quality improvement before pilot results exist.
- Changing the default installed harness before the experiment is reviewed.
- Adding a vendor-specific agent runner or runtime dependency.
- Treating a hash lock as a permission or provenance guarantee.

## Acceptance Criteria

- [ ] WHEN the pilot starts a task THE SYSTEM SHALL present a short contract with goal, source of truth, scope boundary, observable acceptance, and unresolved choices.
- [ ] WHEN a pilot task closes THE SYSTEM SHALL retain check results and direct evidence for consequential claims, including failures and residual risk.
- [ ] WHEN two agents work concurrently THE SYSTEM SHALL assign separable ownership and run a common integration check before closure.
- [ ] WHEN pilot runs finish THE SYSTEM SHALL compare quality, human attention, elapsed time, and available token/cost measures against the current workflow.
- [ ] The current installed workflow remains usable throughout the pilot.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: use pilot tasks from more than one adopting project and review their artifacts and delivered behavior independently of the agent's closure note.

## Assumptions

- **Assumption:** usage and token telemetry varies by agent, so missing measurements must remain missing rather than estimated.
- **Assumption:** a meaningful pilot needs real work in adopting projects; this repository alone tests mechanics, not productivity.

## Risks

- A shorter contract can omit a constraint; compare escaped defects and review effort, not only document size.
- Parallel agents can increase coordination cost; begin with tasks whose work can be separated.

## Findings so far

- The 16 reported spec IDs without an `implements:` link are historical traceability gaps,
  not evidence that the behavior is absent. T-010 records why backfilling closed tasks would
  invent provenance; verify each link against implementation and tests before adding one.
- The 600-line figure in `AGENTS.md` and `docs/project/brief.md` had drifted from the active
  `harness.json` budget of 650; both now refer to the active configuration.
- The pilot contract passes the existing 0.9 solo linter when populated and closed. No adopter
  run has yet shown a token, time, or quality gain.

## Trace

- 2026-09-26 — read: baseline `npm run check`, current templates, T-010 and active budget
  · did: created opt-in contract, paired-run guide, summary tool, tests, and drift correction
  · checks: baseline 111/111; compact contract closure test 3/3; full final gate pending
  · assumption: real adopter runs are needed to measure benefit.
