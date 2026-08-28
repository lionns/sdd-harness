---
id: T-015
title: Fix the Stop hook's settings shape so the gate actually runs
status: done
profile: solo
harness: 0.7.0
role: Implementer
goal: Correct `.claude/settings.json` and the shipped `templates/claude/settings.json` to Claude Code's two-level hook schema, so the Stop gate that D-017 installed is actually executed rather than silently discarded, and pin the shape with the existing install test.
decisions: [D-017, D-027]
---

## Sources

- `.claude/settings.json` — this repo's own Stop handler, rejected by Claude Code's settings validator
- `templates/claude/settings.json` — the copy `harness-init --claude` installs into an adopting repo
- `tests/init.test.mjs` § "--claude installs the Stop gate and the skills" — asserts the flat shape
- `docs/tasks/T-008-enforcement-without-the-agent.md` § Acceptance Criteria — "exactly one `Stop` handler with no `matcher`"
- `D-017`, `D-027`

## Scope

- `.claude/settings.json`: wrap the command object in a matcher group, `{"hooks": [ ... ]}`.
- `templates/claude/settings.json`: the same correction, so adopters stop receiving a dead gate.
- `tests/init.test.mjs`: assert the nested shape, so the schema error cannot return unnoticed.

## Out of Scope

- `harness-gate.mjs` itself. The script is correct; only its registration was malformed, and
  `tests/hooks.test.mjs` already covers its behavior by invoking it directly.
- Adding a `matcher`. `Stop` has no tool to match, and T-008 pins its absence.
- The `.githooks` pre-push gate (D-027). It is the vendor-neutral path and was never affected —
  which is why the harness stayed enforced while this hook was dead.
- Notifying adopters who already installed the broken template. That is a release note, not a task.

## Acceptance Criteria

- [x] `.claude/settings.json` and `templates/claude/settings.json` both parse, and each declares
      exactly one `Stop` matcher group holding exactly one command hook, with no `matcher` key.
- [x] WHEN a `Stop` handler is written with the command object placed directly in the event array
      THE SYSTEM SHALL fail `tests/init.test.mjs` naming the missing `hooks` array.
- [x] The registered command still resolves to `harness-gate.mjs` under `${CLAUDE_PROJECT_DIR}`.
- [x] Composition: the corrected install still lints clean under `harness-lint`, and the full suite
      runs in one pass rather than stopping at the first failure.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: re-flatten the template to the pre-fix shape and confirm `tests/init.test.mjs`
  fails naming the shape, then restore. A check never seen failing is not verified.

## Assumptions

- Assumption: Claude Code silently discards a malformed hook entry rather than erroring at load,
  which is why a gate broken since 0.5.0 produced no visible failure. Rests on the settings
  validator reporting `hooks.Stop.0.hooks: Expected array, but received undefined` while sessions
  continued to run normally.

## Risks

- The gate has not run in this repo since it was introduced. Records written while it was dead were
  covered only by the pre-push hook, so anything the Stop gate would have caught a turn earlier was
  caught later or not at all.

## Outcome

- Changes: both `Stop` handlers now use Claude Code's two-level hook schema — a matcher group
  holding a `hooks` array — so the gate D-017 installed is registered instead of discarded. The
  install test asserts the nested shape, the absence of a `matcher`, and the command `type`.
- Files: `.claude/settings.json`, `templates/claude/settings.json`, `tests/init.test.mjs`.
- Baseline result: green — 89/89, lint clean.
- Final result: green — 89/89, lint clean.
- Decisions recorded: none. D-017 and D-027 stand; this corrected their implementation, not them.
- Follow-up: adopters who ran `harness-init --claude` before this fix hold the flattened shape in
  their own `.claude/settings.json`, which this repo cannot reach. It belongs in the release note
  for the next version, not in a task.

## Trace

- 2026-08-28 — read: `.claude/settings.json` against Claude Code's hook schema · did: confirmed the
  command object sits directly in the `Stop` array with no enclosing matcher group, and found the
  same shape in `templates/claude/settings.json` and asserted by `tests/init.test.mjs` ·
  checks: baseline 89/89 green, lint clean.
- 2026-08-28 — did: wrapped the command object in a matcher group in both the repo's own settings
  and the shipped template, and widened the install test from a bare `command` match to the full
  shape · checks: 89/89, lint clean.
- 2026-08-28 — did: re-flattened the template to the pre-fix shape and confirmed the test fails
  naming it — "a Stop handler is a matcher group holding a hooks array, not a bare command" — then
  restored · result: the regression check is verified, not merely present.
