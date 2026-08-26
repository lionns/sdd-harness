---
id: T-001
title: Establish the harness repo's own baseline
status: done
profile: solo
harness: 0.2.0
role: Implementer
goal: Give this repo the green baseline it demands of every project it is copied into — real quality gates and an automated test suite for the two scripts that enforce the harness.
decisions: []
---

## Sources

- `docs/sdd/HARNESS.md` § Baseline Gate, § Exceptions
- `docs/project/quality-gates.md` — currently an unfilled template
- `scripts/harness-status.mjs`, `scripts/harness-lint.mjs`, `scripts/lib/harness.mjs`
- `D-009` (enforced budgets), `D-010` (generated STATUS, append-only JOURNAL)

## Scope

- `tests/` — automated coverage for `scripts/lib/harness.mjs`, the two renderers, and the
  `harness-lint` CLI contract (exit code + messages) against fixture repos.
- `docs/project/quality-gates.md` — real baseline and final check commands.
- `docs/project/brief.md` — this repo's actual brief, replacing the template comments.
- `package.json` — a `test` script, wired into `check`.

## Out of Scope

- Any change to `docs/sdd/`, `harness.json`, or `scripts/` — the governance surface. Tests exercise
  the scripts as they are; a testability refactor would need approval, a decision, and a version bump.
- Packaging or distribution (`npx` init), `docs/project/*.json` schemas, `ROOT` portability.
  Recorded as follow-ups, not done here.

## Acceptance Criteria

- [ ] `npm test` runs and passes with zero dependencies beyond Node's built-in test runner.
- [ ] Tests cover: front-matter parsing, section extraction, both renderers, renderer determinism,
      and at least six distinct `harness-lint` failure modes plus the clean case.
- [ ] `docs/project/quality-gates.md` names executable commands, no `<!-- command -->` placeholders.
- [ ] `npm run check` is green end to end.
- [ ] The task closes the full cycle: Outcome, Review, Trace, journal line, regenerated `STATUS.md`.

## Verification

- Baseline: none exists — see Assumptions. This task establishes it.
- Final: `npm run check` (`harness-status` then `harness-lint`) and `npm test`.
- Task-specific: each lint test asserts the exit code *and* that the message names the right file.

## Assumptions

- **Exception, self-approved under `solo`:** the baseline gate is waived because this task is to
  establish that baseline (`HARNESS.md` § Exceptions, case four). No follow-up needed — the gate
  becomes real when this task closes.
- Node's built-in `node:test` and `node:assert` are sufficient; the repo stays dependency-free.

## Risks

- Testing the lint CLI by copying `scripts/` into a fixture couples the tests to that layout. If the
  script layout changes, the fixture helper changes with it. Accepted: the alternative is modifying
  the governance surface.

## Outcome

- Changes: added a 32-test suite over `scripts/`, filled the two empty project specs, wired `npm test`
  into `check`. No change to the governance surface.
- Files: `tests/helpers/fixture.mjs`, `tests/lib.test.mjs`, `tests/status.test.mjs`,
  `tests/lint.test.mjs`, `docs/project/quality-gates.md`, `docs/project/brief.md`, `package.json`.
- Baseline result: waived — this task created it. See Assumptions.
- Final result: `npm test` 32/32, `npm run check` clean.
- Decisions recorded: none. The defect below needs one; it belongs to T-002, not here.
- Follow-up: **T-002** — the three script defects in Review. Then: `npx` init and version-drift
  check, schemas for `docs/project/*.json`.

## Review

- **High** · `scripts/harness-status.mjs:88` · Entrypoint detection compares `import.meta.url` to
  `file://${process.argv[1]}`; Node canonicalizes the module path, `argv[1]` keeps the caller's, so
  they disagree through a symlink. · **Impact:** `harness-status` exits 0 without generating.
  `harness-lint` is *not* affected — it has no such guard — so it runs and correctly reports the
  generated files as stale, telling the user to run the script that just silently did nothing.
  `npm run check` deadlocks permanently in that checkout. · **Recommendation:** compare canonical
  paths. Assigned to T-002.
- **High** · `scripts/lib/harness.mjs:4` · `ROOT` uses `new URL(...).pathname`, which leaves
  percent-encoding in place. · **Impact:** both scripts crash with `ENOENT` on
  `.../has%20space/harness.json` in any path containing a space. · **Recommendation:**
  `fileURLToPath`. Assigned to T-002.
- **Low** · `scripts/lib/harness.mjs:73` · `sddDocLines` counts a trailing newline as a line while
  the linter's own `lineCount` strips it. · **Impact:** the `docs/sdd/` total reads 6 high; the
  600-line budget is really 594. · **Recommendation:** one shared helper. Assigned to T-002.
- No finding against the harness's rules themselves. The budgets, the staleness check, and the solo
  trace requirement all behave as `PROTOCOLS.md` specifies.

## Trace

- 2026-08-26 — role: Implementer
  - read: `HARNESS.md` § Baseline/Exceptions, `PROTOCOLS.md` § Budgets, all three scripts, `D-009`
  - did: built fixture-repo helper, then tests for the lib, both renderers, and the lint CLI;
    filled `quality-gates.md` and `brief.md`; wired `npm test` into `check`
  - files: 4 added under `tests/`, 3 modified
  - checks: baseline waived (task creates it) · `npm test` 32/32 · `npm run check` clean
  - assumptions: exception recorded above; Node built-ins only, no new dependencies
  - blockers: none. Lint CLI is tested as a subprocess against copied fixtures to avoid a
    testability refactor of the governance surface.
  - decisions: none recorded; the entrypoint defect needs one under T-002
