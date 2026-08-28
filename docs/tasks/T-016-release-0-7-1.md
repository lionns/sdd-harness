---
id: T-016
title: Release 0.7.1 — the Stop gate correction and its adopter note
status: done
profile: solo
harness: 0.7.0
role: Implementer
goal: Publish the T-015 schema fix as 0.7.1, widening the PATCH definition to admit fixes that restore documented behavior, and tell adopters who ran `--claude` before it that the gate they installed never fired.
decisions: [D-029]
---

## Sources

- `docs/sdd/VERSION.md` § Versioning Rules, § Change Rules — the taxonomy D-029 widens
- `harness.json` — `harness` is the declared version; `README.md:5` announces it
- `tests/readme.test.mjs` § "the version the README announces" — pins the two together
- `docs/tasks/T-015-stop-hook-schema-shape.md` § Outcome — the follow-up this discharges
- `D-029`

## Scope

- `VERSION.md` § Versioning Rules: `PATCH` reworded per D-029.
- `VERSION.md` § Changelog: a `0.7.1` entry naming the malformed shape, that the gate never fired
  from 0.5.0 to 0.7.0, that `--hooks` was unaffected, and what an adopter must do.
- `harness.json`: `harness` becomes `0.7.1`. `README.md:5` follows.
- `D-029` set to `accepted`, index regenerated.

## Out of Scope

- Editing the 0.5.0 or 0.7.0 entries. D-029 keeps a shipped changelog as-shipped.
- Raising `sddDocsTotalLines`. This must fit the 29 lines D-026 left; if it does not, the entry is
  too long, and raising the cap twice running is what D-026 says would signal the rules are wrong.
- Migrating adopters automatically. `harness-init` does not reach an installed repo; the note is
  the whole remedy.
- Re-dating T-015's `harness: 0.7.0`. It ran under 0.7.0 and D-013 requires only that the version
  it claims is declared.

## Acceptance Criteria

- [x] WHEN `README.md` announces a version `harness.json` does not declare THE SYSTEM SHALL fail
      `tests/readme.test.mjs` naming both values — checked by bumping one and not the other.
- [x] `VERSION.md` declares `0.7.1`, and its `PATCH` rule admits fixes restoring documented behavior.
- [x] The 0.7.1 entry states that `--claude` installs before it produced a gate that never ran, and
      that `--hooks` / `.githooks/pre-push` was unaffected.
- [x] `D-029` is `accepted` and appears in the regenerated `docs/decisions/README.md`.
- [x] Composition: `docs/sdd/` stays inside `sddDocsTotalLines`, and `harness-lint` still accepts
      every task's `harness` value against the versions VERSION.md declares (D-013).
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: bump `harness.json` without `README.md` and confirm the README test names both
  values, then restore. Confirm the sdd line count after the entry, and report the headroom left.

## Assumptions

- Assumption: no adopter has to be reached directly, because the harness is copied into a repo
  rather than installed from a registry, so there is no channel to push a fix through. Rests on
  D-024 and on `harness-init` refusing to overwrite an existing `.claude/` (`tests/init.test.mjs`).

## Risks

- The release note is the only remedy for an adopter running a dead gate, and it reaches only
  someone who reads the changelog. Anyone who installed `--claude` and moved on stays unprotected,
  believing otherwise — which is worse than having installed nothing.
- Spending 8 of 29 remaining budget lines on a patch entry brings the D-026 tension forward, and
  the next release must either resolve it or breach the cap.

## Outcome

- Changes: 0.7.1 released. `PATCH` now admits fixes that restore already-documented behavior, and
  the changelog records that the `Stop` gate announced in 0.5.0 never fired, what an adopter must do
  about it, and that `.githooks/pre-push` was unaffected.
- Files: `docs/sdd/VERSION.md`, `harness.json`, `README.md`,
  `docs/decisions/D-029-patch-admits-restored-behavior.md`, `STATUS.md`, `docs/decisions/README.md`.
- Baseline result: green — 89/89, lint clean, `docs/sdd` 621/650.
- Final result: green — 89/89, lint clean, `docs/sdd` 633/650.
- Decisions recorded: D-029 (accepted).
- Follow-up: 17 lines of `docs/sdd/` headroom remain, about one release. D-026 named the cause —
  `VERSION.md` grows every release and never shrinks — and D-013 blocks the obvious remedy, since
  deleting old entries would invalidate the `harness` value closed tasks claim. The next release
  must resolve that rather than raise the cap; D-026 says raising it twice running is the signal
  the rules are wrong.

## Trace

- 2026-08-28 — read: `VERSION.md` § Versioning Rules against T-015's outcome · did: found the fix
  fits neither `PATCH` nor `MINOR` as written, and raised D-029 rather than stretching one silently
  · checks: baseline 89/89 green, lint clean, `docs/sdd` 621/650.

- 2026-08-28 — did: reworded `PATCH`, added the 0.7.1 entry, moved `harness.json` and `README.md:5`
  together, and accepted D-029 · checks: 89/89, lint clean, `docs/sdd` 633/650.
- 2026-08-28 — did: desynced `harness.json` to 0.7.2 against a 0.7.1 README and confirmed the test
  names both values — "README says 0.7.1, harness.json says 0.7.2" — then restored. Confirmed every
  `harness:` value in `docs/tasks/` is still a version `VERSION.md` declares (D-013) ·
  result: the pin is verified, and no closed record was invalidated by the bump.
