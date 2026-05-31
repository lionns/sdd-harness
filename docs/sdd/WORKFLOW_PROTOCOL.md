# Workflow Protocol

## Purpose

This protocol defines the required development flow for SDD tasks. It prevents agents from starting new implementation on an unstable baseline and prevents changes from being accepted without verification and human validation.

## Task States

- `Draft`: The task is being shaped and is not ready for execution.
- `Ready`: The task has scope, context, acceptance criteria, verification, and required gates.
- `Blocked`: The task cannot proceed without a decision, dependency, permission, or green baseline.
- `In Progress`: An agent is actively executing the task.
- `Review`: The change is complete enough for review and verification.
- `Human Validation`: The change passed agent review and awaits explicit human validation.
- `Done`: The change is accepted and all required records are complete.
- `Superseded`: The task was replaced by another task or decision.

## Required Workflow

1. Define or update project specifications.
2. Create a task plan using `docs/sdd/TASK_TEMPLATE.md`.
3. Build a compact context packet using `docs/sdd/CONTEXT_PROTOCOL.md`.
4. Confirm the task meets Definition of Ready.
5. Run the project baseline checks before implementation.
6. Start implementation only if baseline checks are green.
7. Implement only the approved task scope.
8. Run required checks after implementation.
9. Review the change using `docs/sdd/REVIEW_PROTOCOL.md`.
10. Record the agent trace using `docs/sdd/TRACE_PROTOCOL.md`.
11. Record decisions when needed.
12. Request explicit human validation.
13. Mark the task `Done` only after human validation and green final checks.

## Baseline Gate

Before starting new implementation, the assigned agent must run the configured project checks.

Baseline rules:

- If all configured checks pass, implementation may start.
- If any configured check fails, new implementation must not start.
- If checks fail before the agent changes files, the task moves to `Blocked` unless the assigned task is specifically to fix the failing baseline.
- The failure must be recorded in the task completion notes or trace.
- A human may reprioritize the work, but should not approve unrelated implementation on a failing baseline.

Configured checks should be defined in `docs/project/quality-gates.md` and may include tests, type checks, linting, build checks, migrations, or smoke checks.

## Final Acceptance Gate

A change cannot be accepted unless:

- All configured project checks pass after the change.
- Task-specific verification passes.
- Review findings marked as blocking are resolved.
- The trace is complete.
- Required decisions are recorded.
- Human validation is explicitly granted.

If final checks fail, the task remains `In Progress`, `Review`, or `Blocked`; it must not be marked `Done`.

## Human Validation Gate

Human validation is required before a task can be marked `Done`.

The human validator should receive:

- Task ID and title.
- Summary of completed changes.
- Files changed.
- Baseline check result.
- Final check result.
- Review result.
- Trace path.
- Decisions recorded.
- Known risks or follow-up work.

Human validation must be explicit. Silence, lack of objection, or an agent review is not approval.

## Exceptions

Exceptions are allowed only when explicitly approved by a human and recorded in the decision log or task trace.

Examples:

- No automated tests exist yet.
- A known unrelated failing test is accepted temporarily.
- A dependency or environment issue prevents checks from running.
- The task is specifically to establish or repair the test baseline.

Exception records must include:

- The failed or skipped check.
- Why the exception is needed.
- Who approved it.
- Expiration condition or follow-up task.

Known standing exceptions should also be listed in `docs/project/quality-gates.md`.
