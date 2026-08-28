# D-024 — Distribution is by copy, not by package

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-012
- Foundation: deploy

## Context

Recorded, not chosen today. `package.json` is `"private": true` and nothing publishes it. The
harness reaches a project through `harness-init`, which copies `docs/sdd/`, `templates/project/` as
`docs/project/`, `scripts/lib/`, and the two enforcement scripts into the target.

## Decision

The harness ships as files copied into the adopting repository, not as a package it depends on.
Every adopter owns a full copy, pinned by the `harness` version in its own `harness.json` and by the
version each task records in its front-matter.

## Consequences

- Follows directly from having no dependencies (D-021): with nothing to install, copying is the
  simplest thing that works, and the adopter can read every rule that binds them.
- A project may stay on an older version indefinitely, which `VERSION.md` already permits.
- The cost, unsolved: **there is no in-place upgrade.** `harness-init --force` overwrites rather
  than merges, so a project on 0.3.0 cannot move to 0.4.0 without losing local edits. This is the
  known follow-up from T-005 and it grows more expensive with every release.
- Fixing a bug in the enforcement scripts does not reach existing adopters at all.

## References

- `package.json`, `scripts/harness-init.mjs`, `docs/sdd/VERSION.md`, `T-005`
