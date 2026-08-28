---
id: T-012
title: Record this repo's own foundation and run the gate it ships
status: done
profile: solo
harness: 0.4.0
role: Implementer
goal: Write the decisions this codebase already embodies, one per applicable foundation topic, each citing the path that proves it, and declare them in harness.json so the harness stops shipping a gate it does not run on itself.
decisions: [D-020]
---

## Sources

- The repository itself. Every claim below cites a path.
- `docs/sdd/HARNESS.md` § Inception, `templates/T-001-record-the-foundation.md`
- `D-020`

## Scope

- One accepted decision per applicable topic, each carrying `- Foundation: <topic>`:
  `runtime` · `data` · `boundaries` · `deploy` · `tests`.
- `identity` and `interface` are deleted from the list. This repo has no users to authenticate and
  no rendered surface — recording them as not applicable is the clutter the rule forbids.
- `foundation` in `harness.json` set to exactly the five that got a decision.
- Confirm `docs/project/quality-gates.md` already matches the `tests` decision, or record the gap.

## Out of Scope

- Changing anything the decisions describe. This task records; it does not refactor.
- The in-place upgrade problem the `deploy` decision names. It is a consequence worth writing down,
  not work to do here.
- Revising `FOUNDATION_TOPICS`. Whether the default seven skew toward product apps is a real
  question this task produces evidence for; answering it is a separate decision.

## Acceptance Criteria

- [x] Each of the five topics has exactly one accepted decision citing at least one path in this
      repository.
- [x] `identity` and `interface` appear nowhere — not in `harness.json`, not as a decision.
- [x] `harness.json` declares the five, and `harness-lint` reports no unsettled topic while seven
      tasks sit past `ready`.
- [x] Removing any one decision makes `harness-lint` fail naming that topic.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: re-read each decision against the path it cites, and delete one decision to watch
  the gate fail before restoring it. A gate that has not been seen failing here is not verified.

## Assumptions

- Assumption: what the code does today is the decision, whether or not anyone chose it
  deliberately. Recording it is what makes changing it deliberate.

## Risks

- The temptation is to write what this architecture should be. That produces a document the code
  contradicts on day one, which is worse than no document because the next session trusts it.

## Outcome

- Changes: five foundation decisions recorded from what the code already does; `harness.json`
  declares them. The harness now runs its own inception gate.
- Files: `docs/decisions/D-021..D-025`, `harness.json`, this task.
- Baseline result: green — 64/64, lint clean.
- Final result: green — 64/64, lint clean, gate satisfied with seven tasks past `ready`.
- Decisions recorded: D-021 runtime, D-022 data, D-023 boundaries, D-024 deploy, D-025 tests.
- Follow-up: two of the default seven topics did not apply to a developer tool, which is evidence
  that `FOUNDATION_TOPICS` skews toward product applications — worth a decision, not a silent edit.
  D-024 restates the unsolved in-place upgrade from T-005, now more expensive with 0.4.0 shipped.

## Trace

- 2026-08-27 — read: `package.json`, `quality-gates.md`, the import graph of `scripts/` · did:
  recorded five topics against paths that prove them; deleted `identity` and `interface` rather
  than recording them as not applicable · checks: baseline 64/64 green.
- 2026-08-27 — did: removed `D-023` to watch the gate fail naming `boundaries`, then restored it —
  the gate has now been seen failing on this repo, not only in a fixture · checks: exit 1 as
  expected, then clean.
