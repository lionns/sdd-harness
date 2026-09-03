---
id: T-022
title: The lock fails in sentences, and generates the same on every platform
status: done
profile: solo
harness: 0.9.0
role: Implementer
goal: Close the six review findings the 0.9.0 pull requests drew — a garbled failure message, an
  unverified `algorithm` field, a docstring that misstates the split, hand-rolled entrypoint
  detection, platform-dependent lock keys, and a corrupt lock crashing instead of failing — before
  the release merges rather than after.
decisions: [D-033]
---

## Sources

- `lionns/sdd-harness#3` and `lionns/ritmo#1` — the review comments, six in total
- `docs/decisions/D-033-installed-harness-is-a-copy.md` § Consequences — drift, not tampering
- `scripts/lib/harness.mjs:25` — `isEntrypoint`, which `harness-status.mjs` already uses
- `docs/decisions/D-011-canonical-path-resolution.md` — the bug the hand-rolled check reintroduces

## Scope

- `scripts/harness-lint.mjs` — compose the drift and missing-file messages separately instead of
  rewriting one into the other; verify `lock.algorithm`; report a corrupt lock or an unreadable
  entry as a structured failure rather than an uncaught exception.
- `scripts/lib/harness.mjs` — correct the `taskBudgetSections` docstring: an indented heading is
  never matched, so such a file counts entirely as plan.
- `scripts/harness-manifest.mjs` — use `isEntrypoint`; build lock keys with `/` on every platform.
- `tests/lock.test.mjs` — assert the whole failure sentence, not its first clause.
- `harness.lock` — regenerated, since `scripts/` changes.

## Out of Scope

- **A new decision.** D-033 decided the lock; these are defects in how it was built. The behaviour
  it promised does not change.
- **A version.** `0.9.0` is unmerged and has shipped to no one, so this lands inside it. Nothing
  observable changes for anyone, and `CHANGELOG.md` needs no entry.
- **Sanitising lock paths against a malicious lock.** Whoever can write `harness.lock` can write
  `harness-lint.mjs` — same repo, same commit. D-033 says the lock catches drift, not tampering,
  and a defence that defends nothing is worse than the absence of one. Corrupt is handled; hostile
  is out of the threat model, deliberately.
- **`docs/sdd/`.** No rule changes.

## Acceptance Criteria

- [x] WHEN a file listed in `harness.lock` is missing THE SYSTEM SHALL fail with one grammatical
      sentence naming the file and the remedy, with no fragment of the drift message spliced in.
- [x] WHEN `harness.lock` declares an algorithm this version cannot verify THE SYSTEM SHALL fail
      naming it, and SHALL NOT report every file as drifted.
- [x] WHEN `harness.lock` is not readable JSON, or lists a path that cannot be hashed, THE SYSTEM
      SHALL report a structured problem and exit 1 rather than throw.
- [x] Lock keys are `/`-separated on every platform, and a single-file entry carries no trailing
      separator.
- [x] `harness-manifest.mjs` runs its CLI through `isEntrypoint`, and importing it still runs
      nothing — the composition check: `tests/lock.test.mjs` imports it and the suite stays green.
- [x] `npm run check` is green with the regenerated lock committed.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: delete a vendored file from a scratch install and read the failure as a sentence;
  then corrupt its `harness.lock` to `{` and confirm the linter reports a problem and exits 1
  instead of printing a stack trace.

## Assumptions

- **Both pull requests carry the same code.** Ritmo's copy is vendored, so the two findings raised
  there are findings about this repository, and fixing them here is the only way to fix them at all.

## Risks

- The messages are the only place an adopter learns where a change belongs, so a wording change is
  a documentation change without a document. The tests now assert the whole sentence.

## Outcome

- Changes: the drift and missing-file messages are composed separately instead of one being
  rewritten into the other; `algorithm` is verified and fails as itself; a corrupt lock or an
  unhashable entry is reported rather than thrown; the split docstring says what the code does;
  `harness-manifest` uses `isEntrypoint` and keys the lock with `/` on every platform.
- Files: 6 — `scripts/{harness-lint,harness-manifest}.mjs`, `scripts/lib/harness.mjs`,
  `tests/lock.test.mjs`, `harness.lock`, this task
- Baseline result: tests 107/107, lint clean, `docs/sdd/` 528/650
- Final result: tests 111/111, lint clean, `docs/sdd/` 528/650
- Decisions recorded: none — D-033 decided the lock; these were defects in building it
- Follow-up: none. Hostile locks stay out of the threat model, as scoped.

## Review

- Low · `scripts/harness-lint.mjs:33` · `change` is computed before the algorithm check, so it is
  built even when no file is compared · a string · accepted: hoisting it keeps the two remedies
  side by side, which is what made the spliced message hard to see in the first place.
- Note · the review that found these was automated, on both pull requests. Five findings were real
  and one was half right: the corrupt-lock crash is worth fixing, the malicious-lock threat is not,
  since writing `harness.lock` requires the same access as writing the linter.

## Trace

- 2026-09-03 — read: the six review comments on `sdd-harness#3` and `ritmo#1`, `D-033`
  § Consequences, `scripts/lib/harness.mjs:25` (`isEntrypoint`), `D-011` ·
  did: reproduced each finding before accepting it — the missing-file message really did read
  "missing — the copy the 0.9.0 harness", and an indented `## Outcome` really is left unmatched, so
  the docstring was wrong; then composed the messages separately, verified `algorithm`, wrapped the
  parse and the hash, switched to `isEntrypoint`, normalised the keys, and strengthened the test
  that should have caught the splice ·
  checks: baseline `npm run check` green; final tests 111/111, lint clean; task-specific — on a
  scratch install, a deleted `docs/sdd/PROTOCOLS.md` now reads `is listed in harness.lock but
  missing — reinstall the harness from sdd-harness`, and a `harness.lock` of `{` reports
  `is not readable JSON` and exits 1 with no stack trace ·
  result: all six criteria pass. No blocker.

