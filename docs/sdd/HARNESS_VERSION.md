# Harness Version

## Current Version

Version: `0.1.0`

Status: `Draft Operational`

Date: `2026-05-31`

## Purpose

This file identifies the active SDD harness version and records version changes. Agents should reference this version when creating task plans, traces, reviews, and governance proposals.

## Versioning Rules

Use semantic versioning for the harness:

- `MAJOR`: incompatible governance, workflow, role, or protocol changes.
- `MINOR`: backward-compatible additions to protocols, templates, roles, gates, or required records.
- `PATCH`: clarifications, typo fixes, formatting updates, or non-behavioral documentation changes.

## Version Change Rules

- Any change to `docs/sdd/` governance documents must be human-validated before it is accepted.
- Accepted governance changes must be recorded in `docs/sdd/DECISION_LOG.md`.
- Version bumps must update this file and summarize the change in the changelog.
- Task plans should record the harness version they were created under.
- If a task spans a harness version change, the trace should state whether the task continues under the original version or adopts the new version.

## Changelog

### 0.1.0 - 2026-05-31

Status: Draft Operational

Initial reusable SDD harness with:

- Routing index for low-token harness navigation.
- Core harness principles and SDD flow.
- Agent protocol and role definitions.
- Task, review, trace, context, and workflow protocols.
- Human validation gate.
- Baseline and final acceptance gates.
- Decision log.
- Project specification templates.
