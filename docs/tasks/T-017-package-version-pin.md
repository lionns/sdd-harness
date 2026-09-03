---
id: T-017
title: Pin package.json to the declared harness version
status: done
profile: solo
harness: 0.7.1
role: Implementer
goal: Correct `package.json` to the `0.7.1` the harness declares, and pin the two together with a test so the release version cannot drift out of the package manifest again.
decisions: []
---

## Sources

- `harness.json` — `harness` is the declared version, `0.7.1`
- `package.json` — `version`, left at `0.7.0`
- `docs/tasks/T-016-release-0-7-1.md` § Scope — named `harness.json` and `README.md`, not the manifest
- `tests/readme.test.mjs` § "the version the README announces" — the pin this one is modelled on
- `docs/project/quality-gates.md` § Baseline Checks, § Final Acceptance Checks

## Scope

- `package.json`: `version` becomes `0.7.1`.
- A new test asserting `package.json`'s `version` equals `harness.json`'s `harness`.

## Out of Scope

- Bumping the harness version. Nothing in `docs/sdd/`, `harness.json`, or `scripts/` changes
  behavior here, so this carries no `VERSION.md` entry and no decision file.
- Pinning `docs/sdd/VERSION.md`'s newest changelog heading to `harness.json`. A second drift
  surface, worth its own task; recorded as follow-up rather than smuggled in.
- Backfilling the manifest version onto historical release commits. The tags carry that history.
- `templates/` — adopters ship no manifest of ours (D-012).

## Acceptance Criteria

- [x] WHEN `package.json` states a `version` that is not the `harness` in `harness.json` THE SYSTEM
      SHALL fail `npm test` naming both values.
- [x] WHEN `npm test` runs against the corrected tree THE SYSTEM SHALL report the new test passing
      alongside the existing README version pin, both reading the same `harness.json`.
- [x] `package.json` declares `version` `0.7.1`.
- [x] `npm run check` is green and `package.json` gains no dependency.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: revert `package.json` to `0.7.0` in a scratch copy, run `npm test`, confirm the new
  test fails and names `0.7.0` and `0.7.1`; restore.

## Assumptions

- Assumption: the manifest is meant to track the harness version. Rests on `git log -p package.json`
  — every release from 0.2.0 to 0.7.0 bumped it in the same commit as the version.

## Risks

- None. One field and one test file; no script behavior changes.

## Outcome

- Changes: `package.json` `version` corrected from `0.7.0` to `0.7.1`; a new
  `tests/version.test.mjs` asserts it equals `harness.json`'s `harness`, the pin `tests/readme.test.mjs`
  already gives the README.
- Files: `package.json`, `tests/version.test.mjs`, `docs/tasks/T-017-package-version-pin.md`,
  `JOURNAL.md`, `STATUS.md`
- Baseline result: tests 89/89, lint clean, status up to date
- Final result: tests 90/90, lint clean
- Decisions recorded: none — no governance surface changed, so no `VERSION.md` entry
- Follow-up: `docs/sdd/VERSION.md`'s newest changelog heading is a third copy of the version and is
  still unpinned. Same drift, own task.

## Review

- Low · `tests/version.test.mjs:13` · the test reads the manifest it validates, so a drift is only
  caught here and not at install time · an adopter never sees this file · accepted: the manifest is
  private to this repo (`private: true`) and ships to no one.

## Trace

- 2026-09-03 — read: `harness.json`, `package.json`, `git log -p package.json`,
  `docs/tasks/T-016-release-0-7-1.md` § Scope, `tests/readme.test.mjs` · did: found the manifest at
  `0.7.0` while `harness.json` declared `0.7.1` — T-016 bumped `harness.json` and `README.md` and
  nothing held the manifest to them; corrected the field and added `tests/version.test.mjs` ·
  checks: baseline `npm run check` green (tests 89/89, lint clean) before any edit; final
  `npm run check` green (tests 90/90, lint clean); task-specific — reverted the manifest to `0.7.0`
  in a scratch copy of `HEAD` and ran `node --test tests/version.test.mjs` · result: the scratch run
  failed with `package.json says 0.7.0, harness.json says 0.7.1`, so the pin holds. No assumption
  left open; no blocker; no decision.
