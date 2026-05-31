# Task Template

Use this template to assign work to any agent in the SDD workflow.

```md
# Task: <short title>

## Task ID

<stable-id>

## Harness Version

<version from docs/sdd/HARNESS_VERSION.md>

## Role

<Planner | Frontend Implementer | Backend Implementer | Tester | Reviewer | Release Engineer | UX/Motion Designer>

## Goal

<one or two concrete sentences describing the desired outcome>

## Context

- Context packet:
  - Objective:
  - Primary sources:
  - Relevant decisions:
  - Required constraints:
  - Known exclusions:
  - Open questions:
  - Token budget notes:
- Source documents:
  - <path or reference>
- Prior decisions:
  - <decision log reference or "None">
- Relevant constraints:
  - <constraint>

## Scope

- <included file, feature, behavior, or artifact>

## Out of Scope

- <excluded file, feature, behavior, or artifact>

## Acceptance Criteria

- <testable criterion>

## Verification

- Baseline checks before implementation:
  - <command or check>
- Final checks before acceptance:
  - <command or check>
- Human validation:
  - Required: <yes | no>
  - Validator:
  - Status: <Pending | Approved | Rejected | Exception Approved>
- Additional task-specific verification:
  - <command, manual check, review step, or validation method>

## Deliverables

- <file, artifact, report, or summary>

## Trace

- Trace required: <yes | no>
- Trace path: `docs/traces/<YYYY-MM-DD>_<task-id>_<role>.md`

## Assumptions

- <assumption or "None">

## Risks

- <risk or "None">

## Completion Notes

To be filled by the assigned agent:

- Changes completed:
- Harness version:
- Files changed:
- Verification performed:
- Baseline checks:
- Final checks:
- Human validation:
- Trace path:
- Decisions recorded:
- Follow-up work:
```
