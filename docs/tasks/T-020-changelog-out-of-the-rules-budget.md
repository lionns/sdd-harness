---
id: T-020
title: Move the changelog out of the rules budget
status: done
profile: solo
harness: 0.7.1
role: Implementer
goal: Move the release history from `docs/sdd/VERSION.md` to `CHANGELOG.md` at the root, move the
  four pins that read it, and leave `docs/sdd/` holding rules only — so a release can be written
  again and T-021 has the line of prose it needs.
decisions: [D-032]
---

## Sources

- `docs/decisions/D-032-changelog-is-history-not-rules.md` — the decision this implements
- `docs/sdd/VERSION.md` — 143 lines, of which the changelog is about 110
- `scripts/lib/harness.mjs:112` — `knownVersions`, which parses `### x.y.z` from that file
- `D-029` § Consequences — recorded this pressure and named the next release as worse
- `docs/project/quality-gates.md` § Baseline Checks, § Final Acceptance Checks

## Scope

- `CHANGELOG.md` at the root — every `### x.y.z` entry, moved verbatim, newest first as today.
- `docs/sdd/VERSION.md` — keeps the current version line, § Versioning Rules and § Change Rules,
  and points at `CHANGELOG.md`.
- `scripts/lib/harness.mjs` — `knownVersions` reads `CHANGELOG.md`, falling back to `VERSION.md` so
  a repository on an older layout keeps its version check.
- `scripts/harness-lint.mjs` — the failure message names the file it actually read.
- `scripts/harness-init.mjs` — installs `CHANGELOG.md`, or an adopter cannot read why its version
  changed.
- `README.md:5` — the changelog link.
- `tests/` — `lint.test.mjs`, `init.test.mjs` and `helpers/fixture.mjs` build fixtures whose
  versions live in `docs/sdd/VERSION.md`.

## Out of Scope

- **Editing any historical entry.** They move verbatim; a shipped changelog records what was
  released (D-029).
- **The `0.9.0` entry itself.** Written once T-021 lands, since the release carries both decisions.
- **Raising `sddDocsTotalLines`.** The point is to stop the directory growing per release, not to
  buy room for more of the same.
- **`docs/decisions/`.** Decision files are already one per file with a generated index.

## Acceptance Criteria

- [x] WHEN a task declares a `harness` version that no released entry declares THE SYSTEM SHALL
      still exit non-zero naming the file it read, with the changelog at its new path.
- [x] WHEN `knownVersions` runs against a repository that still holds its changelog in
      `docs/sdd/VERSION.md` THE SYSTEM SHALL return the same versions as before.
- [x] WHEN `harness-init` installs into a fresh target THE SYSTEM SHALL place `CHANGELOG.md` in it
      and leave the first `harness-lint` clean — the composition check.
- [x] `docs/sdd/` holds no release history, and its total drops below 550 lines.
- [x] `npm run check` is green, and no historical entry differs by a character from `git show`.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: `git show HEAD:docs/sdd/VERSION.md` piped through a diff against the new
  `CHANGELOG.md` — the only differences may be the heading and the removed rules sections.

## Assumptions

- **The version pins stay where they are.** `README.md` and `package.json` are pinned to
  `harness.json`, not to the changelog, so moving the file does not touch them.

## Risks

- `knownVersions` reading two possible files is a fallback that will outlive its reason. It is the
  price of not breaking a repository mid-upgrade; note it for removal at the next `MAJOR`.
- A verbatim move is easy to claim and easy to get wrong. The task-specific check is a diff against
  `HEAD`, not a reading.

## Outcome

- Changes: the release history moved to `CHANGELOG.md` at the root, verbatim; `VERSION.md` keeps the
  versioning and change rules and points at it; `knownVersions` reads the new path and falls back to
  the old one; the linter names the file it read; `harness-init` installs the changelog.
- Files: 9 — `CHANGELOG.md`, `docs/sdd/VERSION.md`, `scripts/lib/harness.mjs`,
  `scripts/harness-lint.mjs`, `scripts/harness-init.mjs`, `README.md`,
  `tests/{lint,init}.test.mjs`, this task
- Baseline result: tests 99/99, lint clean, `docs/sdd/` 649/650
- Final result: tests 101/101, lint clean, `docs/sdd/` 526/650
- Decisions recorded: D-032, accepted before implementation
- Follow-up: the fallback in `knownVersions` outlives its reason at the next `MAJOR`; recorded in
  the risk it was written under.

## Review

- Low · `scripts/lib/harness.mjs:112` · `changelogName` compares paths to decide what to print, so a
  repository holding both files reports only the new one · that is the correct precedence and the
  fallback is documented · accepted.

## Trace

- 2026-09-03 — read: `D-032`, `docs/sdd/VERSION.md`, `scripts/lib/harness.mjs:112`,
  `scripts/harness-init.mjs` § `plan`, `tests/{lint,init,readme}.test.mjs` ·
  did: split the file at `## Changelog`, moved 107 lines of history out untouched, rewrote the two
  sentences in `VERSION.md` that called it the changelog, added `changelogPath`/`changelogName` with
  the old location as fallback, pointed the linter's message at whichever file it read, added the
  changelog to the install plan, and fixed the README link · checks: baseline `npm run check` green;
  final tests 101/101, lint clean, `docs/sdd/` down 123 lines to 526; task-specific — diffed
  `git show HEAD:docs/sdd/VERSION.md` from `### 0.7.1` against the same region of `CHANGELOG.md`:
  identical, so the move changed no character of any shipped entry ·
  result: all five criteria pass. No blocker.

