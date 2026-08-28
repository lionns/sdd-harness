---
id: T-003
title: Separate adoption templates from this repo's own specifications
status: done
profile: solo
harness: 0.3.0
role: Implementer
goal: Give adopters a pristine `templates/` tree to copy — including the `CLAUDE.md` entry point the harness needs to take effect — and let `docs/project/` hold this repo's real specifications instead of a mix of both.
decisions: [D-012]
---

## Sources

- `README.md` § Using it in a project — the five-step adoption path
- `docs/project/brief.md`, `docs/project/quality-gates.md` — this repo's own specs, currently in the path adopters copy
- `docs/sdd/README.md` § Project Sources
- `D-012`

## Scope

- New `templates/` tree: `CLAUDE.md`, `harness.json`, `JOURNAL.md`, and `templates/project/` with the eight specification templates.
- `docs/project/` becomes this repo's own filled specifications.
- New root `CLAUDE.md` for this repo, from the same template.
- `README.md` adoption steps point at `templates/`.
- `docs/sdd/README.md` § Project Sources lists `agent-config.md`.

## Out of Scope

- The bootstrap script that automates the copy (T-005).
- Linter rules (T-004).
- Any change to budgets, gates, roles, or record shapes.

## Acceptance Criteria

- [x] `templates/project/brief.md` and `templates/project/quality-gates.md` are empty templates naming no specific project.
- [x] `templates/CLAUDE.md` points a coding agent at `STATUS.md`, `harness.json`, and `docs/sdd/README.md` before anything else.
- [x] Copying `docs/sdd/`, `templates/project/` → `docs/project/`, `scripts/`, `templates/harness.json`, `templates/JOURNAL.md`, `templates/CLAUDE.md` into an empty repo yields a green `harness-status` + `harness-lint`.
- [x] `docs/project/` contains no unfilled `<!-- ... -->` placeholder-only file.
- [x] This repo has a root `CLAUDE.md`.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: adoption rehearsal from `templates/` into an empty directory, asserted by `tests/init.test.mjs` in T-005 and by hand here.

## Assumptions

- Assumption: `design-handoff.md` does not apply to a repo with no UI, so this repo's `docs/project/` omits it while `templates/project/` keeps it.

## Risks

- None. Additive; nothing that exists today is deleted from the governance surface.

## Outcome

- Changes: new `templates/` tree (`CLAUDE.md`, `harness.json`, `JOURNAL.md`, nine project specs);
  `docs/project/` filled with this repo's own specification; root `CLAUDE.md` added; `README.md` and
  `docs/sdd/README.md` updated.
- Files: 21 — `templates/*` (12), `docs/project/*` (7 filled, `design-handoff.md` removed),
  `CLAUDE.md`, `README.md`, `docs/sdd/README.md`.
- Baseline result: `npm run check` green (39/39) before starting.
- Final result: `npm run check` green (55/55).
- Decisions recorded: D-012.
- Follow-up: none.

## Review

- Low · `templates/JOURNAL.md` · the explanatory prose was parsed as a journal entry, because
  `journal()` skips only `#`, `>` and `<!--` lines · every fresh install failed lint on arrival ·
  rewrote the prose as a `>` blockquote. Caught by the T-005 install rehearsal, fixed there.
- Note · `docs/project/design-handoff.md` removed here but kept in `templates/project/` — this repo
  has no UI. Recorded as an assumption above, and as a consequence in D-012.
- No blocking findings.

## Trace

- 2026-08-27 — role: Implementer
  - read: `README.md`, `docs/project/*`, `docs/sdd/README.md`, `D-012`
  - did: split adoption material from this repo's own specs; wrote both `CLAUDE.md` files
  - files: `templates/*`, `docs/project/*`, `CLAUDE.md`, `README.md`, `docs/sdd/README.md`
  - checks: rehearsed a copy into an empty dir — `harness-status` + `harness-lint` clean
  - assumptions: `design-handoff.md` does not apply to this repo
  - blockers: none
