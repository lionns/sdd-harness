# Harness Version

Version: `0.2.0` · Status: `Operational` · Date: 2026-08-25

The active version and profile for a project live in its `harness.json`. This file is the changelog
and the versioning rules.

## Versioning Rules

- `MAJOR` — incompatible governance, workflow, role, or protocol changes.
- `MINOR` — backward-compatible additions to protocols, templates, roles, gates, or records.
- `PATCH` — clarifications, formatting, non-behavioral documentation changes.

## Change Rules

- Changes to `docs/sdd/`, `harness.json`, or `scripts/` require explicit human approval, in both profiles.
- An accepted governance change gets a decision file in `docs/decisions/`.
- A change that alters harness behavior bumps the version and adds a changelog entry here.
- Tasks record the version they ran under, in their front-matter.
- A project may stay on an older version. `0.1.0` remains valid for projects that have not migrated.

## Changelog

### 0.2.0 — 2026-08-25

Reduces the records a project must produce, and makes what remains diffable. Decisions D-007…D-010.

- **Profiles** (D-007). `harness.json` selects `solo` (3 roles, inline trace, implicit validation) or
  `team` (7 roles, trace files, explicit validation gate). Both keep the baseline and final gates.
- **Decisions as files** (D-008). One `D-###-*.md` per decision with a generated index, replacing the
  monolithic `DECISION_LOG.md` that had reached 794 lines in a live project.
- **Enforced budgets** (D-009). Limits moved from prose into `harness.json` and `scripts/harness-lint.mjs`:
  task 120 lines, trace block 25, decision 40, journal entry 1, `docs/sdd/` total 600.
- **Generated `STATUS.md` + append-only `JOURNAL.md`** (D-010). Session start costs one file, not ten.
- **Consolidation.** The eleven `docs/sdd/` documents became five: `README`, `HARNESS`, `AGENTS`,
  `PROTOCOLS`, `TEMPLATES` (plus `VERSION`). 1,164 lines → 525.
- **`docs/plans/` → `docs/tasks/`.** Task state now lives only in front-matter.

### 0.1.0 — 2026-05-31

Initial reusable SDD harness: routing index, principles and flow, agent protocol and roles, task,
review, trace, context and workflow protocols, human validation gate, baseline and final gates,
decision log, project specification templates.
