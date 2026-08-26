---
id: T-002
title: Fix path resolution in the harness scripts
status: done
profile: solo
harness: 0.2.0
role: Implementer
goal: Make the two scripts work when the repo path contains a symlink or a space, and stop the docs/sdd line count from disagreeing with the linter's own.
decisions: [D-011]
---

## Sources

- `T-001` § Review — the three findings, with reproductions
- `docs/sdd/AGENTS.md` § Controlled Self-Improvement — approval required, granted 2026-08-26
- `docs/sdd/VERSION.md` § Versioning Rules, § Change Rules

## Scope

- `scripts/lib/harness.mjs` — `ROOT` via `fileURLToPath`; a shared `lineCount`; `isEntrypoint`.
- `scripts/harness-status.mjs` — use `isEntrypoint`.
- `scripts/harness-lint.mjs` — use the shared `lineCount` instead of its private copy.
- `tests/` — regression tests that run both scripts through a symlinked path and a path with a space.
- `D-011`, `VERSION.md` changelog, and the version bump to `0.2.1` in `harness.json`,
  `package.json`, `README.md`.

## Out of Scope

- Any change to the harness rules: budgets, gates, roles, states, record shapes. This is a defect
  fix in the enforcement layer, not a governance change to what is enforced.
- The versioning-rule gap noted in Risks. Recorded, not resolved.

## Acceptance Criteria

- [ ] `node <symlinked-path>/scripts/harness-status.mjs` generates its files instead of exiting 0.
- [ ] Both scripts run correctly from a path containing a space.
- [ ] `sddDocLines` and the linter's line counting agree; `docs/sdd/` reports 529, not 535.
- [ ] Regression tests cover all three, and fail against the pre-fix scripts.
- [ ] `npm run check` green; `D-011` accepted and indexed; `VERSION.md` has a `0.2.1` entry.

## Verification

- Baseline: `npm run check` — green before starting (32/32, lint clean).
- Final: `npm run check`.
- Task-specific: each regression test asserts the pre-fix failure mode is gone, not just that the
  command exits 0.

## Assumptions

- `0.2.1` is a PATCH: no harness rule changes, only the enforcement layer's correctness. See Risks.

## Risks

- **Versioning-rule gap.** `VERSION.md` defines `PATCH` as "clarifications, formatting,
  non-behavioral documentation changes", which does not cover a bug fix in `scripts/`. Calling this
  `0.2.1` stretches the rule. Recorded in `D-011` § Consequences as a follow-up, not resolved here.
- Fixing `sddDocLines` lowers every project's reported `docs/sdd/` total by one line per file. No
  project can newly fail a budget because of it — the number only goes down.

## Outcome

- Changes: canonical path resolution behind `isEntrypoint` and `fileURLToPath`; one shared
  `lineCount` for every budget check; 7 regression tests; version bumped to `0.2.1`.
- Files: `scripts/lib/harness.mjs`, `scripts/harness-status.mjs`, `scripts/harness-lint.mjs`,
  `tests/paths.test.mjs`, `tests/lib.test.mjs`, `tests/lint.test.mjs`, `docs/decisions/D-011-*.md`,
  `docs/sdd/VERSION.md`, `harness.json`, `package.json`, `README.md`.
- Baseline result: green — `npm run check`, 32/32 and lint clean.
- Final result: `npm run check` green, 39/39. `docs/sdd/` reports 539/600 — the count fix removed
  6 phantom lines, the `0.2.1` changelog entry added 10.
- Decisions recorded: `D-011`, accepted.
- Follow-up: the versioning-rule gap in `D-011` § Consequences. Then `npx` init and version-drift
  check, and schemas for `docs/project/*.json`.

## Review

- Each fix was verified in isolation by reverting it alone and confirming the matching test fails:
  the entrypoint guard breaks all three path tests, `ROOT` breaks the space test only. The suite is
  pinned to behavior, not to the implementation.
- Two of T-001's tests asserted the pre-fix line counts (`3` where the answer is `2`). They were
  updated, not deleted — the change is visible in the diff and explained in a comment, which is what
  makes the off-by-one fix auditable.
- One assumption in T-001's test was itself wrong: `node --test` runs each file in a child process
  where `argv[1]` is that file, so `isEntrypoint` returns true there. Corrected into a stronger
  positive assertion rather than worked around.
- No finding requiring further change. Residual gap: nothing tests Windows path handling, and
  nothing can on this platform.

## Trace

- 2026-08-26 — role: Implementer
  - read: `T-001` § Review, `AGENTS.md` § Controlled Self-Improvement, `VERSION.md`, all three scripts
  - did: reproduced both defects outside the suite first, then fixed and pinned them; wrote `D-011`;
    bumped `0.2.0` → `0.2.1` in the manifest, package, `VERSION.md`, and `README.md`
  - files: 3 scripts, 3 test files, `D-011`, 4 manifest/doc files
  - checks: baseline `npm run check` green 32/32 · final `npm run check` green 39/39 ·
    each fix reverted in isolation to confirm its test fails
  - assumptions: `0.2.1` as PATCH under a stretched rule, recorded in `D-011` and as follow-up
  - blockers: none. Governance approval for the `scripts/` change granted 2026-08-26.
  - decisions: `D-011` accepted
