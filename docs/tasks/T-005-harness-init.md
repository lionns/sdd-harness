---
id: T-005
title: Bootstrap script for adopting the harness
status: done
profile: solo
harness: 0.3.0
role: Implementer
goal: Replace the five manual copy steps in `README.md` with one command that installs the harness into a target repository and leaves it lint-clean.
decisions: [D-014]
---

## Sources

- `README.md` § Using it in a project — the steps being automated
- `templates/` — the tree T-003 creates
- `scripts/lib/harness.mjs` — `ROOT`, `isEntrypoint`, canonical path handling (D-011)
- `D-014`

## Scope

- `scripts/harness-init.mjs`: copies `docs/sdd/`, `templates/project/` → `docs/project/`, the two enforcement scripts plus `scripts/lib/`, and the three root templates into a target directory.
- Flags: `--project=<name>`, `--profile=solo|team`, `--force`.
- Refuses to overwrite an existing file unless `--force`; reports what it wrote.
- Creates empty `docs/tasks/` and `docs/decisions/`, and `docs/traces/` under `team`.
- `README.md` § Using it in a project documents the command.
- `tests/init.test.mjs`.

## Out of Scope

- Publishing to npm, a `bin` entry, or any dependency.
- Copying `harness-init.mjs` itself into the target — it is useless there.
- Upgrading an already-installed harness in place; that is a follow-up.

## Acceptance Criteria

- [x] `node scripts/harness-init.mjs <dir> --project=x` into an empty directory produces a tree where `harness-status` then `harness-lint` both exit 0.
- [x] The written `harness.json` carries the current version, the requested project name, and the requested profile.
- [x] Re-running without `--force` exits non-zero and names the conflicting files, writing nothing.
- [x] Re-running with `--force` succeeds.
- [x] An invalid `--profile` exits non-zero before writing anything.
- [x] `--profile=team` creates `docs/traces/`; `solo` does not.
- [x] `scripts/harness-init.mjs` is absent from the target tree.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: `tests/init.test.mjs` runs the real CLI against a temp directory and then runs both enforcement scripts inside the result.

## Assumptions

- Assumption: the target directory may exist and be non-empty; only file-level collisions are refused.

## Risks

- A copy tool that overwrites an adopter's `CLAUDE.md` or `harness.json` would be destructive. Mitigated by the collision check being the default and `--force` being explicit.

## Outcome

- Changes: `scripts/harness-init.mjs` installs the harness into a target repo and generates
  `STATUS.md` so the result is lint-clean on arrival; `README.md` § Using it in a project replaced
  with the command; `npm run init` added.
- Files: 4 — `scripts/harness-init.mjs`, `tests/init.test.mjs`, `README.md`, `package.json`.
- Baseline result: `npm run check` green (39/39) before starting.
- Final result: `npm run check` green (55/55).
- Decisions recorded: D-014.
- Follow-up: upgrading an installed harness in place is unsolved — `--force` overwrites rather than
  merges. Worth a task once a second project is actually running an older version.

## Review

- High · `scripts/harness-init.mjs` · `--force` was parsed and passed but never read, so the
  collision check fired unconditionally and no reinstall was possible · caught by the first manual
  run, fixed before the tests were written, now pinned by a test asserting both directions.
- Medium · `tests/init.test.mjs` · the first draft resolved the CLI path with `URL.pathname`, the
  exact percent-encoding bug D-011 fixed in the scripts · would have failed on a repo path
  containing a space · replaced with `fileURLToPath`, and a test now installs into a spaced path.
- Low · the install report omitted the two enforcement scripts it had copied · fixed.
- No blocking findings.

## Trace

- 2026-08-27 — role: Implementer
  - read: `README.md`, `templates/`, `scripts/lib/harness.mjs`, `D-014`
  - did: wrote the installer, rehearsed both profiles into temp dirs, then wrote the suite
  - files: `scripts/harness-init.mjs`, `tests/init.test.mjs`, `README.md`, `package.json`
  - checks: solo and team installs both lint clean; `npm test` 55/55
  - assumptions: a non-empty target is fine; only file-level collisions are refused
  - blockers: none
