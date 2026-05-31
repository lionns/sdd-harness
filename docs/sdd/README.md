# SDD Harness Index

Use this index to load only the context needed for a task. Do not read every harness document by default.

## Always Read First

- `docs/sdd/README.md`: this routing index.
- `docs/sdd/HARNESS_VERSION.md`: active harness version.
- The assigned task plan in `docs/plans/`.

If no task plan exists yet, read only the documents needed to create one.

## Universal Rules

Read these when executing any planned task:

- `docs/sdd/SDD_HARNESS.md`: core principles, flow, Definition of Ready, Definition of Done.
- `docs/sdd/WORKFLOW_PROTOCOL.md`: task states, baseline gate, final acceptance gate, human validation.
- `docs/sdd/CONTEXT_PROTOCOL.md`: context packet, source selection, token budget, anti-hallucination rules.

## Read by Role

### Planner

- `docs/sdd/TASK_TEMPLATE.md`
- `docs/sdd/WORKFLOW_PROTOCOL.md`
- `docs/sdd/CONTEXT_PROTOCOL.md`
- Relevant files in `docs/project/`
- Recent related traces in `docs/traces/` only when needed

### Frontend Implementer

- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/WORKFLOW_PROTOCOL.md`
- `docs/sdd/TRACE_PROTOCOL.md`
- Assigned task plan
- Relevant project specs, design handoff, quality gates, and affected source files

### Backend Implementer

- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/WORKFLOW_PROTOCOL.md`
- `docs/sdd/TRACE_PROTOCOL.md`
- Assigned task plan
- Relevant architecture, data model, quality gates, and affected source files

### Tester

- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/WORKFLOW_PROTOCOL.md`
- `docs/sdd/TRACE_PROTOCOL.md`
- Assigned task plan
- Relevant acceptance criteria, quality gates, and affected test files

### Reviewer

- `docs/sdd/REVIEW_PROTOCOL.md`
- `docs/sdd/WORKFLOW_PROTOCOL.md`
- Assigned task plan
- Implementer trace
- Changed files and verification results

### Release Engineer

- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/WORKFLOW_PROTOCOL.md`
- `docs/sdd/TRACE_PROTOCOL.md`
- Assigned release task
- Quality gates, deployment notes, and release-relevant decisions

### UX/Motion Designer

- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/CONTEXT_PROTOCOL.md`
- Assigned task plan
- Design handoff and relevant project specs

## Governance Changes

For proposed changes to the harness, roles, templates, protocols, gates, or versioning, read:

- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/DECISION_LOG.md`
- `docs/sdd/HARNESS_VERSION.md`
- The specific document being changed

Governance changes require explicit human validation before they are applied.

## Project Sources

Read only the project files relevant to the task:

- `docs/project/brief.md`
- `docs/project/requirements.json`
- `docs/project/user-stories.json`
- `docs/project/acceptance-criteria.json`
- `docs/project/architecture.md`
- `docs/project/design-handoff.md`
- `docs/project/data-model.md`
- `docs/project/quality-gates.md`

## Context Budget Rule

Start with the index, the task plan, and the smallest applicable protocol set. Add more sources only when the task requires them or when verification exposes a gap.
