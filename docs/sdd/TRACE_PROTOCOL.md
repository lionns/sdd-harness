# Trace Protocol

## Purpose

This protocol defines how agents record execution traces during SDD work. Traces make agent behavior auditable and provide evidence for improving the harness over time.

Traces are operational records. They do not replace task plans, reviews, project specifications, or decision log entries.

Traces should be compact. They should preserve enough evidence for future improvement without copying full documents, long command output, or source code.

## Trace Location

Store traces in `docs/traces/`.

Recommended filename:

```txt
<YYYY-MM-DD>_<task-id>_<role>.md
```

Example:

```txt
2026-05-31_task-001_planner.md
```

## When to Create a Trace

Create or update a trace when an agent:

- Plans a task.
- Implements a task.
- Reviews a task.
- Tests or verifies a task.
- Releases or prepares a release.
- Proposes an improvement to the harness, role definitions, templates, or protocols.

## Required Trace Content

Each trace should include:

- Harness version.
- Task ID and role.
- Start and end status.
- Source documents read.
- Key actions taken.
- Files changed or reviewed.
- Commands, tests, or checks run.
- Results of verification.
- Assumptions made.
- Blockers or escalations.
- Decisions proposed or recorded.
- Follow-up recommendations.

## Trace Template

```md
# Agent Trace: <task id>

## Metadata

- Date:
- Harness version:
- Agent role:
- Task ID:
- Task title:
- Status: <Completed | Blocked | Partial | Proposed>

## Inputs Read

- <document, file, task, or decision>

## Actions Taken

- <action>

## Files Changed

- <path or "None">

## Files Reviewed

- <path or "None">

## Verification

- Command or check:
- Result:
- Notes:

## Assumptions

- <assumption or "None">

## Blockers and Escalations

- <blocker, escalation, or "None">

## Decisions

- Proposed:
- Recorded:

## Follow-Up Recommendations

- <recommendation or "None">
```

## Trace Rules

- Keep traces factual and concise.
- Prefer references, paths, and short summaries over pasted content.
- Record only the command output needed to explain the result.
- Do not include secrets, credentials, private user data, or unnecessary personal data.
- Record failed checks as well as successful checks.
- Distinguish observed facts from assumptions.
- Link to decision log entries when a decision is accepted.
- Use traces to inform future harness improvements, but do not treat traces as approval for governance changes.
