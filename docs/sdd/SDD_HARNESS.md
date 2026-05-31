# SDD Harness

## Purpose

This harness defines a reusable Specification-Driven Development workflow for multi-agent delivery. It keeps planning, implementation, review, and release work grounded in explicit specifications before code is changed.

The harness is project-agnostic. Product, design, architecture, and domain details belong in `docs/project/`.

Current harness version is recorded in `docs/sdd/HARNESS_VERSION.md`.

Agents should use `docs/sdd/README.md` as the routing index before loading additional harness documents.

## Principles

- Specifications are the primary source of truth for scope and behavior.
- Agents operate from written tasks with clear inputs, outputs, and acceptance criteria.
- Changes stay small enough to review and verify independently.
- Decisions that affect future work are recorded when they are made.
- Reviews prioritize correctness, regressions, security, maintainability, and test coverage.
- New implementation starts only from a green configured baseline unless the task is explicitly to repair that baseline.
- Changes are accepted only when final configured checks are green and human validation is explicit.
- Implementation does not silently expand scope beyond the assigned task.
- Agents may propose improvements to this harness, but governance changes require explicit human validation before they are applied.
- Context should be selected deliberately to minimize token use while preserving enough evidence to avoid unsupported assumptions.

## Sources of Truth

- `docs/project/brief.md`: product objective, users, scope, and constraints.
- `docs/project/requirements.json`: functional and non-functional requirements.
- `docs/project/user-stories.json`: user stories and priority.
- `docs/project/acceptance-criteria.json`: global and cross-cutting acceptance criteria.
- `docs/project/architecture.md`: system structure, stack, interfaces, deployment, and operational constraints.
- `docs/project/design-handoff.md`: visual, interaction, responsive, and motion guidance.
- `docs/project/data-model.md`: entities, relationships, validation, and lifecycle rules.
- `docs/project/quality-gates.md`: configured baseline checks, final acceptance checks, and known exceptions.
- `docs/sdd/README.md`: routing index for selecting only the needed harness documents.
- `docs/sdd/HARNESS_VERSION.md`: active harness version, versioning rules, and changelog.
- `docs/sdd/DECISION_LOG.md`: decisions that shape or constrain implementation.
- `docs/sdd/CONTEXT_PROTOCOL.md`: context selection and token budget rules for agent work.
- `docs/sdd/TRACE_PROTOCOL.md`: operational trace rules for agent work.
- `docs/sdd/WORKFLOW_PROTOCOL.md`: task states, baseline gate, final acceptance gate, and human validation gate.
- `docs/plans/`: executable task plans created after project specifications are ready.
- `docs/traces/`: task-level traces created by agents during execution.

## SDD Flow

1. Define or update project specifications.
2. Identify gaps, conflicts, and unresolved decisions.
3. Create a task plan from the task template with a compact context packet.
4. Confirm Definition of Ready and assign the task to the appropriate role.
5. Run baseline checks and proceed only if they are green.
6. Implement only the approved task scope.
7. Verify behavior against the task acceptance criteria.
8. Review the change using the review protocol.
9. Record the agent trace using the trace protocol.
10. Record meaningful decisions and follow-up work.
11. Request explicit human validation before marking the task done.

## Definition of Ready

A task is ready when:

- The goal is stated in one or two concrete sentences.
- The relevant source documents are linked or named.
- The context packet identifies primary sources, constraints, exclusions, and open questions.
- Acceptance criteria are explicit and testable.
- Inputs, outputs, and affected areas are identified.
- Dependencies, constraints, and known risks are listed.
- The expected verification method is defined.
- Required baseline and final checks are defined.
- The human validation requirement is explicit.
- The harness version used by the task is recorded.
- Open questions are resolved or deliberately marked as assumptions.

## Definition of Done

A task is done when:

- The requested behavior or document change is complete.
- Acceptance criteria pass.
- Baseline checks passed before implementation, or an approved exception is recorded.
- Final configured tests, checks, or validations pass after the change, or an approved exception is recorded.
- Human validation is explicitly granted.
- No unrelated changes were introduced.
- New decisions are recorded in the decision log.
- Accepted governance changes update `docs/sdd/HARNESS_VERSION.md` when they change harness behavior.
- The agent trace is created or updated when the task involved planning, implementation, testing, review, release, or process improvement.
- Follow-up work is listed separately instead of being hidden in the implementation.
- The final response summarizes what changed and how it was verified.

## Change Discipline

- Prefer additive and localized changes.
- Preserve existing user or teammate work.
- Do not rewrite project specifications unless the task asks for it.
- Do not invent product requirements inside implementation tasks.
- Escalate when sources of truth conflict or acceptance criteria are ambiguous.
- Do not apply changes to `docs/sdd/` governance documents without explicit human approval.
