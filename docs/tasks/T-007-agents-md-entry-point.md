---
id: T-007
title: One portable entry file, not one per vendor
status: ready
profile: solo
harness: 0.3.0
role: Planner
goal: Ship `AGENTS.md` as the single agent entry point, with `CLAUDE.md` reduced to a one-line pointer, so the harness works with any agent family at no extra context cost.
decisions: [D-016]
---

## Sources

- `templates/CLAUDE.md`, `CLAUDE.md` — the entry file created in T-003
- `docs/project/brief.md` § Users — "multiple agent families" is a stated user, served only by Claude today
- `docs/sdd/README.md` § Start Here, Always
- `D-016`

## Scope

- `templates/AGENTS.md` becomes the entry file; `templates/CLAUDE.md` becomes a pointer to it.
- Same split at this repo's root.
- `harness-init` installs both.
- `README.md` and `docs/sdd/README.md` name `AGENTS.md` as the entry point.

## Out of Scope

- Duplicating instructions across the two files. The pointer holds no rules of its own — two copies
  of the same rules is the failure this task exists to avoid.
- Vendor-specific config beyond the pointer (no `.cursorrules`, no per-tool variants).
- Any change to the content of the rules themselves; this task moves them, it does not rewrite them.

## Acceptance Criteria

- [ ] `templates/AGENTS.md` contains the rules; `templates/CLAUDE.md` is at most three lines and
      contains no rule that is not in `AGENTS.md`.
- [ ] The same holds for this repo's root files.
- [ ] `harness-init` writes both, and a fresh install still lints clean.
- [ ] A test asserts the pointer stays short, so the two files cannot drift into two rule sets.
- [ ] Total entry-file lines do not increase by more than three versus 0.3.0.
- [ ] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: `tests/init.test.mjs` asserts both files land and that `CLAUDE.md` is a pointer.

## Assumptions

- Assumption: agents that read `CLAUDE.md` will follow a one-line pointer to `AGENTS.md`. If that
  proves false in practice, the fallback is a build step that generates `CLAUDE.md` from `AGENTS.md`
  — still one source, and still no duplicated rules.

## Risks

- Low. The only real risk is the two files drifting apart, which the length test prevents.

## Outcome

- Changes:
- Files:
- Baseline result:
- Final result:
- Decisions recorded:
- Follow-up:
