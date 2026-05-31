# Review Protocol

## Purpose

This protocol defines how agents review work in the SDD workflow. Reviews should focus on concrete risks and evidence.

## Review Priorities

Review findings should be ordered by severity:

1. Correctness bugs or broken acceptance criteria.
2. Security, privacy, data integrity, or compliance risks.
3. Regressions in existing behavior.
4. Missing or weak verification for changed behavior.
5. Maintainability issues that increase future delivery risk.
6. Documentation or decision gaps that could mislead future agents.

## Required Review Inputs

- Assigned task.
- Relevant project specifications.
- Changed files or artifacts.
- Verification results from the implementer.
- Baseline and final check results.
- Prior decisions that constrain the work.

## Required Review Output

Use this structure:

```md
# Review: <task id or title>

## Findings

- Severity: <Critical | High | Medium | Low>
  File: <path:line when available>
  Issue: <specific problem>
  Impact: <why it matters>
  Recommendation: <concrete fix>

## Open Questions

- <question or "None">

## Verification Notes

- <checks reviewed or run>

## Human Validation

- Required: <yes | no>
- Status: <Pending | Approved | Rejected | Exception Approved>
- Validator:
- Notes:

## Summary

<brief overall assessment>
```

## Severity Guide

- Critical: The change cannot ship because it causes major failure, data loss, security exposure, or blocks core functionality.
- High: The change likely breaks important behavior or creates significant operational, security, or user impact.
- Medium: The change has a real defect, test gap, or maintainability risk that should be addressed before completion.
- Low: The issue is minor but worth fixing for clarity, consistency, or future maintenance.

## Review Rules

- Findings must be actionable and grounded in evidence.
- Do not include broad preference feedback without a concrete risk.
- Do not approve work that fails stated acceptance criteria.
- Do not approve work when configured final checks are failing, unless a human-approved exception is recorded.
- Do not mark review as complete human validation; human validation is a separate gate.
- If no issues are found, state that clearly and list any residual verification gaps.
- Separate follow-up suggestions from required fixes.
