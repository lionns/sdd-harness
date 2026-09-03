---
id: T-021
title: harness.lock — the linter tells a copy from a fork
status: done
profile: solo
harness: 0.7.1
role: Implementer
goal: Generate a hash manifest of the vendored governance surface, install it with the harness, and
  verify it from `harness-lint`, so a repository that edits its copy fails on the next run and is
  told where the change belongs instead of authoring a harness version of its own.
decisions: [D-033]
---

## Sources

- `docs/decisions/D-033-installed-harness-is-a-copy.md` — the decision this implements
- `docs/decisions/D-032-changelog-is-history-not-rules.md` — frees the line of prose this needs
- `scripts/harness-init.mjs` § `install` — the trees and scripts that define the vendored surface
- `scripts/harness-lint.mjs:193` — the `STATUS.md` staleness check, the pattern this follows
- `docs/sdd/HARNESS.md` § Governance · `docs/sdd/VERSION.md` § Change Rules

## Scope

- `scripts/harness-manifest.mjs` — new, generates `harness.lock`: a hash per file over `docs/sdd/`,
  `scripts/harness-lint.mjs`, `scripts/harness-status.mjs`, `scripts/lib/`, `.githooks/pre-push`
  and `.claude/`. Never installed into a target, like `harness-init.mjs`.
- `scripts/harness-lint.mjs` — when `harness.lock` exists, verify every entry before the record
  checks; a mismatch or a missing file fails, naming the file and this repository.
- `scripts/harness-init.mjs` — write the lock filtered to the trees the install actually copied.
- `harness.lock` — generated and committed here.
- `docs/sdd/` — one line: an installed harness is a copy; changes to it are proposed upstream.
- `CHANGELOG.md` — the `0.9.0` entry, covering D-032 and D-033.
- `package.json`, `harness.json`, `README.md:5` — the version, in the three places pinned to it.
- `tests/` — drift, a missing file, an absent lock, and an install whose lock verifies on arrival.

## Out of Scope

- **Pinning budget values in `harness.json`.** The numbers are the project's to hold, and D-031
  already checks the key set (D-033 § Consequences).
- **`AGENTS.md`, `CLAUDE.md`, `docs/project/`.** Templates a project fills in and owns afterwards.
- **Upgrading an adopter in place.** `harness-init --force` is the path that exists; a real upgrade
  command is its own task.
- **Signing or verifying provenance.** A hash catches drift, not tampering, and claiming otherwise
  would be worse than not claiming it.

## Acceptance Criteria

- [x] WHEN a file listed in `harness.lock` differs from its recorded hash THE SYSTEM SHALL exit
      non-zero from `harness-lint` naming that file and where the change belongs.
- [x] WHEN a file listed in `harness.lock` is missing THE SYSTEM SHALL exit non-zero naming it.
- [x] WHEN no `harness.lock` exists THE SYSTEM SHALL check nothing and report clean, so a `0.7.1`
      repository and a deliberate fork both keep working.
- [x] WHEN this repository's governance changes without regenerating the lock THE SYSTEM SHALL fail
      telling the reader to run `scripts/harness-manifest.mjs`.
- [x] WHEN `harness-init` installs into a fresh target, with and without `--claude`, THE SYSTEM
      SHALL leave a lock covering exactly what was copied and a clean first lint — the composition
      check: generator, installer and verifier against a real install.
- [x] `npm run check` is green here with the lock committed.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: install into a scratch target, append a line to its `docs/sdd/PROTOCOLS.md`, run
  its `harness-lint` — it must name that file and exit 1; delete the lock and confirm it goes clean.

## Assumptions

- **Hashing normalises the newline.** D-033 names a CRLF checkout as a false positive; the generator
  and the verifier must read bytes the same way, and a test on mixed endings pins it.
- **The vendored set equals the install plan.** Rests on `harness-init.mjs` § `install`, where the
  trees and `SCRIPTS` are already the list; the generator should derive from it, not restate it.

## Risks

- Two lists of what the harness owns — the installer's and the generator's — drift apart silently.
  Deriving one from the other is the mitigation, and a test that installs and verifies is the check.
- Sequenced after T-020: the lock hashes `docs/sdd/`, so generating it before the changelog moves
  records files that are about to change.

## Outcome

- Changes: `scripts/harness-manifest.mjs` generates `harness.lock` from `VENDORED`, the one list of
  what an install copies; `harness-lint` verifies every entry wherever it finds a lock, telling the
  source repository to regenerate and a copy to propose upstream; `harness-init` ships the lock
  filtered to what it wrote; `HARNESS.md` § Change Discipline states the rule the check enforces.
  Released as `0.9.0` with D-032.
- Files: 17 — `scripts/{harness-manifest,harness-lint,harness-init}.mjs`, `scripts/lib/harness.mjs`,
  `harness.lock`, `docs/sdd/{HARNESS,VERSION}.md`, `CHANGELOG.md`, both `harness.json`,
  `package.json`, `README.md`, `tests/{lock,init}.test.mjs`, this task, `JOURNAL.md`, `STATUS.md`
- Baseline result: tests 101/101, lint clean, `docs/sdd/` 526/650
- Final result: tests 107/107, lint clean, `docs/sdd/` 528/650
- Decisions recorded: D-033, accepted before implementation
- Follow-up: none. `harness-init --force` remains the upgrade path, as scoped.

## Review

- Low · `scripts/harness-manifest.mjs:19` · `VENDORED` mirrors the installer's trees by hand rather
  than being imported from it · `harness-init.mjs` parses `process.argv` at module scope, so
  importing it for one constant runs the CLI · accepted: the install-and-verify test in
  `init.test.mjs` fails the moment the two lists disagree, which is the check the risk asked for.
- Low · `scripts/harness-lint.mjs:31` · a repository can delete `harness.lock` and silence the check
  · that is the documented fork, visible in a diff · accepted, and pinned by a test.

## Trace

- 2026-09-03 — read: `D-033`, `scripts/harness-init.mjs` § `install`, `harness-lint.mjs:193`
  (the `STATUS.md` staleness check), `tests/hooks.test.mjs` § vendor layers ·
  did: added `fileHash` with newline normalisation to the library, wrote the generator around a
  single `VENDORED` list, verified the lock from the linter with a message that reads the lock's own
  `source` to tell the owner from an adopter, filtered the lock into every install, added the one
  rule line to `HARNESS.md`, and cut `0.9.0` across the five version surfaces ·
  checks: baseline `npm run check` green; final tests 107/107, lint clean at 528/650;
  task-specific — installed into a scratch target with `--claude --hooks`: clean on arrival, then a
  line appended to its `docs/sdd/PROTOCOLS.md` failed with `does not match the 0.9.0 harness —
  propose the change in sdd-harness, then reinstall`, and deleting the lock returned it to clean ·
  result: all six criteria pass. No blocker.

