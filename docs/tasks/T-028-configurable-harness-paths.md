---
id: T-028
title: Adopters name the docs and scripts directories
status: done
profile: solo
harness: 0.13.0
goal: A project whose documentation and scripts live in differently named directories, such as Docs/ and Scripts/, runs every harness script, hook and lock check on a case-sensitive filesystem.
decisions: [D-038]
implements: [FR-19]
---

## Sources

- `docs/decisions/D-038-configurable-harness-paths.md`
- `scripts/lib/harness.mjs`, `scripts/harness-init.mjs`, `scripts/harness-manifest.mjs`
- Adopter report and approval (analitica-sgp D-008, T-002), 2026-09-30

## Scope

- `paths` in `harness.json`, resolved by `lib/harness.mjs`; lint, status, evidence and manifest use it.
- `templates/githooks/pre-push` and `templates/claude/hooks/harness-gate.mjs` resolve the scripts dir.
- `harness-init`: `--docs-dir`, `--scripts-dir`, installed-path lock keys, case-collision refusal.
- One routing line in `docs/sdd/README.md`; release 0.14.0 (VERSION, CHANGELOG, package.json, lock).

## Out of Scope

- Rewriting `docs/sdd/` prose or skills to spell configured names; an in-place migration command.
- Paths nested deeper than one directory.

## Acceptance Criteria

- [x] WHEN `harness.json` declares `paths` THE SYSTEM SHALL read and write records only there.
- [x] WHEN `paths` is absent THE SYSTEM SHALL behave as 0.13.0 (the existing suite passes unchanged).
- [x] WHEN `harness-init` meets an existing directory differing only in case THE SYSTEM SHALL refuse
      and name it, writing nothing.
- [x] WHEN installed with `--docs-dir=Docs --scripts-dir=Scripts` THE SYSTEM SHALL pass its own
      status, lint, lock and git-hook gates together, as an adopter runs them.
- [x] WHEN `paths` holds anything but a single directory name THE SYSTEM SHALL fail lint naming it.

## Verification

- Baseline: `npm run check` — green before implementation.
- Task-specific: `node --test tests/paths.test.mjs tests/init.test.mjs tests/hooks.test.mjs tests/lock.test.mjs`
- Final: `npm run check`

## Assumptions

- A case-sensitive check is simulated by distinct directory names on macOS; the adopter verifies on
  a case-sensitive volume after reinstalling.

## Risks

- A hook or message missed by the search keeps a hardcoded path; tests cover each entry point.

## Outcome

- Changes: `paths` in `harness.json` (D-038, FR-19); lib, lint, status, evidence and manifest resolve
  it; both hooks read it at run time; init adds `--docs-dir`/`--scripts-dir`, installed-path lock
  keys, renamed prose in AGENTS and the seed task, and refuses case-only collisions even with --force.
- Files: `scripts/lib/harness.mjs`, `scripts/harness-{init,lint,status,evidence,manifest}.mjs`,
  both hook templates and repo copies, `tests/configured-paths.test.mjs`, README, docs/sdd/README,
  VERSION, CHANGELOG, package.json, harness.json, pilot contracts, harness.lock.
- Baseline result: `npm run check` green, 0 failures, lint clean (2026-09-30)
- Final result: `npm run check` 144/144, lint clean, docs/sdd 589 lines; the same suite 144/144
  with TMPDIR on a case-sensitive APFS volume. There, 0.13.0 reproduced the bug (17 false lint
  problems; pre-push exit 0 unchecked); 0.14.0 refused the collision (exit 1), then installed with
  Docs/Scripts and passed lint, pre-push and the Stop gate, and pre-push blocked a bad record (exit 1).
- Decisions recorded: D-038
- Follow-up: analitica-sgp T-002 moves its install by hand; a migration command stays out of scope.

## Trace

- 2026-09-30 — read: AGENTS, STATUS, lib, init, manifest, lint, hooks, tests · did: planned T-028,
  D-038, FR-19 after owner approval · checks: baseline `npm run check` green · assumptions: above
- 2026-09-30 — did: implemented paths, hooks, init flags and collision refusal; 6 tests; released
  0.14.0 (contracts carry the version, as in prior releases) · checks: 142/144 until contracts were
  bumped, then 144/144; case-sensitive volume 144/144 and adopter smoke run · blockers: none
