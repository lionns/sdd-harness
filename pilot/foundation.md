---
id: T-001
title: Record the existing foundation
status: ready
profile: __PROFILE__
harness: __HARNESS__
workflow: lean
goal: Record the architecture this codebase already implements and configure real quality gates.
decisions: []
---

## Sources

- Existing code and configuration; cite exact paths in each foundation decision.
- `docs/sdd/HARNESS.md` § Inception

## Scope

- Record each applicable foundation topic in one accepted decision with a source path.
- Configure `docs/project/quality-gates.md` from the existing test strategy.
- Set `harness.json` foundation to exactly the settled topics.
- Preserve existing behavior; defer an unknown topic with an accepted decision and trigger.

## Acceptance Criteria

- [ ] Every declared foundation topic has one accepted decision supported by code.
- [ ] Quality gates run real project checks and the harness linter is green.

## Verification

- Baseline: existing project check
- Final: existing project check
- Task-specific: inspect each decision against the cited implementation path

## Agents

- Mode: single
- Verifier: self

## Outcome

- Behavior evidence: pending; cite decisions and paths inspected
- Checks: `docs/evidence/T-001.json`
- Residual risk: pending
- Human decision: pending; only the human writes `accepted by <name>`
