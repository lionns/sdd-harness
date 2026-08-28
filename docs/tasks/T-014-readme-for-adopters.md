---
id: T-014
title: Rewrite the README for adopters, and make its facts checkable
status: done
profile: solo
harness: 0.7.0
role: Implementer
goal: Rewrite the README so someone who has never seen the project can install the harness, settle a foundation, and run the daily loop; and pin the facts it states with a test so it cannot drift four versions again.
decisions: [D-028]
---

## Sources

- `README.md` — announces 0.3.0, quotes a 600-line budget, links to a table T-008 deleted
- `harness.json` — the source for version and budgets
- `scripts/harness-init.mjs` — the usage string is the source for which flags exist
- `D-028`

## Scope

- `README.md` rewritten for one reader: someone adopting the harness. Problem it solves, install,
  settle the foundation, the daily loop, the gates, reference.
- Facts that live in `harness.json` or the init usage string are not restated in prose, or are
  pinned by a test where restating them is worth it.
- One worked example: a real task front-matter, so a document about records shows one.
- `tests/readme.test.mjs`: the announced version matches `harness.json`, every `--flag` named exists
  in the init usage string, and every relative link resolves to a file that exists.

## Out of Scope

- Contributor guidance. It stays in `AGENTS.md`, which is what a contributing agent loads (D-028).
- `docs/sdd/README.md`, the routing index. Different reader, different job, already accurate.
- Restating rules the harness documents define. The README points at them.
- Linting an adopter's README. `harness-init` does not install one; this is a test of this repo.

## Acceptance Criteria

- [x] WHEN the README announces a version that `harness.json` does not declare THE SYSTEM SHALL fail
      the test naming both values.
- [x] WHEN the README names a `--flag` absent from the init usage string THE SYSTEM SHALL fail.
- [x] WHEN a relative link in the README points at a missing file THE SYSTEM SHALL fail.
- [x] The README states no budget number; it points at `harness.json` instead.
- [x] The README describes the daily loop and the inception phase, neither of which it does today.
- [x] Composition: the new test runs with the existing suite and every failure is reported in one
      run, not just the first.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: break each of the three checked facts in turn and confirm the test names it, then
  restore. A check never seen failing is not verified.

## Assumptions

- Assumption: a test is the right tool rather than a lint rule, because `harness-init` installs no
  README into an adopting project, so there is nothing for a shipped rule to enforce there.

## Risks

- Three checked facts do not make the README true. Prose that goes stale in meaning rather than in a
  number is still unprotected, and the test may create false confidence that it is not.

## Outcome

- Changes: `README.md` rewritten for adopters — the problem it solves, install, settling the
  foundation, the daily loop, what the linter enforces, reference. Four facts it states are now
  pinned by tests.
- Files: `README.md`, `tests/readme.test.mjs`.
- Baseline result: green — 85/85, lint clean.
- Final result: green — 89/89, lint clean.
- Decisions recorded: D-028 (accepted).
- Follow-up: only four facts are checked. Prose that goes stale in meaning rather than in a number
  is still unprotected, and the passing test may read as more assurance than it is.

## Trace

- 2026-08-27 — read: `README.md` against `harness.json` · did: confirmed three outright errors — it
  announced 0.3.0 against 0.7.0, quoted the 600-line budget D-026 had raised, and linked to a table
  T-008 deleted · checks: baseline 85/85 green.
- 2026-08-27 — did: rewrote for one reader, adding the two things it never had — the inception
  phase as the answer to cold-start, and the daily loop — and cut the numbers that duplicate
  `harness.json` rather than restating them correctly, which would only go stale again.
- 2026-08-27 — did: broke each checked fact in turn and confirmed the test names it: stale version,
  a `--wibble` flag init does not accept, a link to a missing file, a hardcoded 120-line budget.
  Restored between each · checks: 89/89, lint clean.
