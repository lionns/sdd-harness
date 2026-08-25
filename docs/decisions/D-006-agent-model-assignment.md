# D-006 — Role-to-model assignment strategy

- Status: accepted
- Date: 2026-05-31
- Supersedes: none
- Tasks: -

## Context

SDD roles have different reasoning requirements. One model for all roles overspends on mechanical
work and under-serves high-stakes work such as review before the validation gate.

## Decision

Assign the Reviewer role to the strongest available reasoning model in every configuration, and
mechanical roles such as Release Engineer to lighter models. Record the concrete roster per project
in `docs/project/agent-config.md`, and revalidate it at the start of each project phase.

## Consequences

- Review quality is protected where the risk concentrates.
- Cost drops on mechanical roles.
- The roster is volatile; the per-project file, not this decision, is the live answer.

## References

- `docs/project/agent-config.md`
- `docs/sdd/AGENTS.md`
