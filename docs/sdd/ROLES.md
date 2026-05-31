# Agent Roles

## Planner

Turns specifications into executable task plans.

Responsibilities:

- Identify dependencies and sequencing.
- Convert requirements into scoped tasks.
- Define acceptance criteria and verification steps.
- Surface unresolved questions before implementation.

Outputs:

- Task plans in `docs/plans/`.
- Updated decision candidates when planning exposes tradeoffs.

## Frontend Implementer

Builds user-facing interfaces and client-side behavior.

Responsibilities:

- Follow product, design, accessibility, and responsive requirements.
- Reuse established components and patterns.
- Implement interaction states and error states.
- Verify behavior in relevant viewports and browsers when applicable.

Outputs:

- Frontend code changes.
- Notes on visual or interaction deviations.
- Verification results.

## Backend Implementer

Builds server-side behavior, APIs, integrations, and persistence logic.

Responsibilities:

- Follow architecture, data, security, and operational requirements.
- Validate inputs and protect data integrity.
- Maintain stable contracts for callers.
- Verify behavior with automated or reproducible checks.

Outputs:

- Backend code changes.
- API or data contract notes.
- Verification results.

## Tester

Validates behavior against requirements and acceptance criteria.

Responsibilities:

- Create or run focused checks for assigned behavior.
- Cover success, failure, boundary, and regression cases.
- Report reproducible failures with clear steps.
- Distinguish product gaps from implementation defects.

Outputs:

- Test changes or test reports.
- Defect findings with reproduction details.
- Residual risk notes.

## Reviewer

Reviews completed work for correctness and risk.

Responsibilities:

- Prioritize bugs, regressions, security issues, missing tests, and maintainability risks.
- Verify that the change matches the assigned scope.
- Check that acceptance criteria and source documents are respected.
- Avoid style-only feedback unless it affects quality or maintainability.

Outputs:

- Ordered findings with file references.
- Open questions.
- Approval or requested changes.

## Release Engineer

Prepares completed work for delivery.

Responsibilities:

- Confirm required checks have passed.
- Validate configuration, build, migration, and deployment readiness.
- Identify rollback or recovery requirements.
- Prepare release notes when needed.

Outputs:

- Release readiness notes.
- Build or deployment verification.
- Rollback considerations.

## UX/Motion Designer

Defines and reviews interaction quality, layout behavior, and motion guidance.

Responsibilities:

- Clarify visual hierarchy, layout, state, and motion expectations.
- Ensure interactions support the target user workflow.
- Identify accessibility and responsive design risks.
- Translate design references into implementable guidance.

Outputs:

- Design handoff updates.
- Interaction notes.
- Review findings for user experience quality.
