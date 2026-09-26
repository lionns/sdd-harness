---
id: T-024
title: Measure the lean workflow on real project tasks
status: ready
profile: solo
harness: 0.10.0
goal: Compare lean and standard on comparable work in adopting projects before proposing a default change.
decisions: [D-034]
---

## Sources

- `pilot/README.md` — procedure and comparison limits
- `pilot/run.example.json` — fields collected per task
- `docs/project/quality-gates.md` — this repository's final gate

## Scope

- Run matched pairs from more than one adopting project, with the same agent and model per pair.
- Inspect delivered behavior independently of the agent's closure note.
- Record elapsed time, documentation time, tokens when available, human review, coordination, acceptance, and later
  rework, escaped defects, and resource regressions. Publish only approved aggregates.
- Decide whether the measured benefit warrants promoting lean beyond opt-in.

## Out of Scope

- Estimating unavailable token or cost data.
- Changing the default workflow before reviewing the measurements.

## Acceptance Criteria

- [ ] WHEN matched runs are collected THE SYSTEM SHALL compare quality and total cost, including
  human attention, rather than document size alone.
- [ ] WHEN a run lacks provider token telemetry THE SYSTEM SHALL report it as missing.
- [ ] WHEN pilot findings are reviewed THE SYSTEM SHALL record whether the workflow should remain
  optional, be revised, or become the default.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: inspect real project behavior and review `pilot/summarize.mjs` output against
  the underlying run records.
