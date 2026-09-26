---
id: T-023
title: Make the lean agent workflow installable for testing
status: done
profile: solo
harness: 0.10.0
role: Planner
goal: Make the four lean-workflow changes installable and verifiable in test projects while preserving the standard workflow.
decisions: [D-034]
implements: [FR-7, FR-8, FR-9, FR-10]
---

## Sources

- `docs/project/brief.md` — records must cost less than the value they return
- `docs/sdd/HARNESS.md` — current lifecycle and gates
- `docs/sdd/TEMPLATES.md` — current task, decision, and trace shapes
- `docs/project/quality-gates.md` — existing verification baseline
- User direction, 2026-09-26 — trial the identified changes in a branch

## Scope

- Make the smaller task contract installable as `workflow: lean`, with `standard` as the control.
- Keep scope, authority, observable acceptance, and a green baseline/final gate.
- Record executed baseline, task-specific, and final checks, including failures; close with
  observable behavior evidence, residual risk, and explicit human acceptance.
- Provide a paired-run format for wall time, available token usage, agent cost, human review,
  coordination, observable behavior, and later rework.
- Require independent ownership, integration, and verification records for parallel tasks.
- Correct observed documentation drift and classify historical traceability warnings.

## Out of Scope

- Running the real-project comparison or claiming a productivity gain before its results exist.
- Changing the default `standard` workflow before the experiment is measured.
- Adding a vendor-specific agent runner or runtime dependency.
- Treating a hash lock as a permission or provenance guarantee.

## Acceptance Criteria

- [x] WHEN the pilot starts a task THE SYSTEM SHALL present a short contract with goal, source of truth, scope boundary, observable acceptance, and unresolved choices.
- [x] WHEN a pilot task closes THE SYSTEM SHALL retain check results and direct evidence for consequential claims, including failures and residual risk.
- [x] WHEN a lean task declares parallel agents THE SYSTEM SHALL require ownership, an integration
  check, and a separate verifier before closure.
- [x] WHEN paired pilot runs are supplied THE SYSTEM SHALL compare quality, human attention,
  elapsed time, and available token/cost measures without filling in missing data.
- [x] The current installed workflow remains usable throughout the pilot.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: `tests/init.test.mjs` installs and closes solo and team lean tasks with the real
  CLI; `tests/lean-experiment.test.mjs` checks evidence and paired comparisons.

## Assumptions

- **Assumption:** usage and token telemetry varies by agent, so missing measurements must remain missing rather than estimated.
- **Assumption:** real adopting-project work is required to measure productivity (T-024).

## Risks

- A shorter contract can omit a constraint; compare escaped defects and review effort, not only document size.
- Parallel agents can increase coordination cost; begin with tasks whose work can be separated.

## Findings so far

- The 16 reported spec IDs without an `implements:` link are historical traceability gaps,
  not evidence that the behavior is absent. T-010 records why backfilling closed tasks would
  invent provenance; verify each link against implementation and tests before adding one.
- The 600-line figure in `AGENTS.md` and `docs/project/brief.md` had drifted from the active
  `harness.json` budget of 650; both now refer to the active configuration.
- The opt-in 0.10 `lean` install passes solo and team closure tests; `standard` remains the default.
  No adopter run has yet shown a token, time, or quality gain.

## Outcome

- Delivered: installable `lean` mode, compact solo/team contracts, executed-check evidence,
  human acceptance and parallel coordination gates, plus a paired cost-and-quality comparator.
- Evidence: solo and team installation tests execute the CLI and close real fixture tasks;
  measurement tests reject unmatched models and missing multi-agent integration evidence.
- Checks: baseline 114/114; final 118/118 and lint clean. A failed task-specific command is
  preserved in the evidence log before a later passing command.
- Residual risk: no real adopter comparison yet; command exit codes and record shape do not prove
  the cited behavior is correct. In-place upgrades of 0.9 installs are not supported.
- Follow-up: T-024 runs the measured pilot in real projects.

## Trace

- 2026-09-26 — read: baseline `npm run check`, current templates, T-010 and active budget
  · did: created opt-in contract, paired-run guide, summary tool, tests, and drift correction
  · checks: baseline 111/111; compact contract closure test 3/3
  · assumption: real adopter runs are needed to measure benefit.
- 2026-09-26 — read: user approval to apply all four changes · did: added installable lean mode,
  executed-check evidence, human closure gate, parallel ownership gate, measurement fields, team
  contract, version 0.10.0 and D-034 acceptance · checks: 118/118, lint clean
  · blocker: automatic review rejected an in-place 0.9 upgrade because it would overwrite existing
  files and the draft rollback was unsafe; test in a fresh directory until a safe migration is approved.
