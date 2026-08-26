# D-004 — Harness versioning

- Status: accepted
- Date: 2026-05-31
- Supersedes: none
- Tasks: -

## Context

Agents need to know which version of the harness governed a given task, and governance changes
should be traceable.

## Decision

Keep a version file as the source of truth for the active version, versioning rules, and changelog.
Require tasks and traces to record the harness version they run under.

## Consequences

- Past tasks can be interpreted against the rules that actually applied to them.
- Governance changes require a version review and a changelog entry.
- Projects can stay on an older version instead of being force-migrated.

## References

- `docs/sdd/VERSION.md`
- `harness.json`
