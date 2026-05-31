# Agent Protocol

## Purpose

This protocol defines universal operating rules for agents participating in the SDD workflow. It applies to planning, implementation, testing, review, design, and release tasks.

## Universal Rules

- Read the assigned task and relevant source documents before changing files.
- Follow `docs/sdd/CONTEXT_PROTOCOL.md` when selecting context for the task.
- Follow `docs/sdd/WORKFLOW_PROTOCOL.md` for task states, baseline checks, final checks, and human validation.
- Treat project specifications as the authority for behavior and scope.
- Keep changes limited to the task.
- Preserve existing work unless explicitly asked to replace it.
- Prefer existing project patterns over new conventions.
- State assumptions clearly when information is missing.
- Verify results with the strongest practical check available.
- Do not start new implementation when configured baseline checks are failing unless the task is to fix that baseline.
- Do not present a change as accepted or done when final configured checks are failing.
- Report blockers early with concrete evidence.
- Create or update the required trace for the assigned work.

## Standard Task Input

Each assignment should provide:

- `taskId`: stable identifier for the work.
- `role`: expected agent role.
- `goal`: concise statement of the desired outcome.
- `context`: relevant source documents and prior decisions.
- `contextPacket`: compact summary of objective, primary sources, constraints, exclusions, open questions, and token budget notes.
- `scope`: files, features, or behaviors included.
- `outOfScope`: items that must not be changed.
- `acceptanceCriteria`: measurable completion criteria.
- `verification`: required tests, checks, or review steps.
- `baselineChecks`: required checks before implementation.
- `finalChecks`: required checks before acceptance.
- `humanValidation`: required approval before marking done.
- `constraints`: technical, product, design, security, or operational limits.
- `deliverables`: expected files, notes, or artifacts.

## Standard Agent Output

Each agent should report:

- Completed changes.
- Files or artifacts modified.
- Verification performed and results.
- Baseline and final check results.
- Human validation status.
- Decisions made or decisions still needed.
- Risks, tradeoffs, and follow-up work.
- Any deviations from the task and why they were necessary.
- Trace file created or updated, when required by `docs/sdd/TRACE_PROTOCOL.md`.

## Escalation

Escalate when:

- Acceptance criteria conflict with source documents.
- Required context is missing and a safe assumption is not possible.
- The task would require broad or destructive changes.
- A dependency, permission, credential, or environment issue blocks verification.
- The implementation exposes a security, privacy, data integrity, or compliance concern.

Escalation should include:

- The blocking issue.
- Evidence or file references.
- Options considered.
- Recommended next action.

## Change Discipline

- Make the smallest coherent change that satisfies the task.
- Avoid opportunistic refactors.
- Do not create new architecture without an explicit decision.
- Keep generated artifacts separate from source specifications when practical.
- Update documentation only when the task changes documented behavior or decisions.

## Controlled Self-Improvement

Agents may propose improvements to the SDD harness, roles, templates, or protocols, but they may not approve or apply governance changes without explicit human validation.

Governance changes include updates to:

- `docs/sdd/SDD_HARNESS.md`
- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/ROLES.md`
- `docs/sdd/TASK_TEMPLATE.md`
- `docs/sdd/REVIEW_PROTOCOL.md`
- `docs/sdd/DECISION_LOG.md`

Self-improvement proposals must:

- Identify the affected document and section.
- Explain the current limitation.
- Describe the proposed change.
- State the expected benefit.
- State the risk or tradeoff.
- Remain unmerged and unapplied until a human approves the change.
- Be recorded in `docs/sdd/DECISION_LOG.md` after approval.

Proposal format:

```md
## Process Improvement Proposal

Affected role or protocol:

Current limitation:

Proposed change:

Expected benefit:

Risk or tradeoff:

Human validation required:

Decision log entry required:
```

## Communication

- Be concise, specific, and factual.
- Reference files and checks directly.
- Distinguish facts from assumptions.
- Avoid hiding incomplete work behind vague status.
