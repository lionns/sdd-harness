---
id: T-011
title: Gate the first task on a recorded foundation, in both greenfield and brownfield
status: done
profile: solo
harness: 0.4.0
role: Planner
goal: Give the harness a project-level inception phase that produces decisions instead of prose, enforced by the linter, so a new project cannot start work on an architecture nobody chose and an adopted one records what it already does.
decisions: [D-020]
---

## Sources

- `docs/sdd/HARNESS.md` § Flow step 1 — the whole inception process, in one sentence
- `docs/project/architecture.md` — empty from v0.1.0 to v0.2.1 in this repo's own history
- `scripts/harness-lint.mjs`, `scripts/harness-init.mjs`, `scripts/lib/harness.mjs`
- `D-020`

## Scope

- `harness.json` gains `foundation: [...]`. Absent or empty disables the gate.
- `lib/harness.mjs`: `decisions()` exposes `foundation`, parsed from `- Foundation: <topic>`.
- `harness-lint` fails when any task is past `ready` and a listed topic has no **accepted**
  decision, naming the missing topics.
- `harness-lint` fails a `- Foundation:` topic absent from the list, and two accepted decisions
  claiming the same topic.
- `harness-init` (greenfield) writes the default list: `runtime` · `data` · `boundaries` ·
  `identity` · `deploy` · `tests` · `interface`.
- `harness-init --adopt` (brownfield) writes `foundation: []` and seeds a `ready`
  `T-001-record-the-foundation.md` whose scope is to record what the code already does, cite the
  path that proves each, and then fill the list — the task that switches the gate on.
- `templates/project/architecture.md` gains one line stating the foundation lives in
  `docs/decisions/` and this file only summarizes it.
- `HARNESS.md` § Inception, Flow step 1 rewritten, `TEMPLATES.md` decision block gains the field.
- `VERSION.md` 0.4.0; bump `harness.json` and `package.json`.

## Out of Scope

- Judging the content of a foundation decision. Whether Postgres was the right call is not
  checkable; that it was chosen, written, and accepted is.
- A `deferred` decision state. A deferral is an accepted decision to defer with its trigger stated
  in the Decision line — a wider vocabulary buys nothing and widens the governance surface.
- Restructuring `templates/project/`. The prose documents stay as summaries of what was decided.
- Turning the gate on for existing adopters. An absent list is off, deliberately.
- Any topic beyond the seven. Everything else is decided per task, on evidence.

## Acceptance Criteria

- [x] A repo with `foundation: [runtime]`, no decisions, and a task in `doing` fails lint naming
      `runtime`; the same repo with that task in `ready` is clean.
- [x] A `runtime` decision with `Status: proposed` does not satisfy the gate; `accepted` does.
- [x] `- Foundation: runitme`, absent from the list, fails lint naming the file.
- [x] Two accepted decisions claiming `runtime` fail lint.
- [x] A fixture with `foundation` absent, and one with `[]`, both lint clean with a task in `doing`.
- [x] `harness-init` writes the seven default topics and the installed repo lints clean.
- [x] `harness-init --adopt` writes `foundation: []` plus a `ready` T-001, and lints clean.
- [x] A greenfield install driven to its first `doing` task fails lint on all seven topics, and
      passes once seven accepted decisions exist.
- [x] `docs/sdd/` stays within its 600-line budget, or the budget is raised by its own decision.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: rehearse both install modes into scratch directories, and drive the greenfield one
  until the gate fires and then clears. A gate that has never been seen firing is not verified.

## Assumptions

- Assumption: seven topics is the right cut, derived from which choices are expensive to reverse,
  not from any framework. Projects trim the list in `harness.json`; the default is a starting
  point, not doctrine. A headless project drops `interface` rather than recording it as N/A.
- Assumption: `accepted` is a human act. The harness cannot prove an agent did not accept its own
  proposal. The gate makes the moment visible, not tamper-proof.
- Assumption: brownfield adoption is more common than greenfield, so the mode that records rather
  than decides is the one that must not feel like a downgrade.

## Risks

- `docs/sdd/` is at 565/600 lines. This task needs roughly 27 and T-006…T-010 need more. Either it
  lands with consolidation or the budget is raised by decision. Raising it silently would be the
  exact drift the budget exists to prevent.
- A project can opt out by leaving the list empty. Accepted: the alternative breaks every 0.3.0
  adopter on upgrade.
- Seven decisions written in one sitting by an agent that has seen no code is the failure mode this
  task is trying to cure, reappearing. The `tests` and `boundaries` topics are the ones worth
  reviewing hardest, because they are the ones that are cheap to write and expensive to be wrong.

## Outcome

- Changes: `foundation` in `harness.json`; the inception gate in `harness-lint`; `--adopt` in
  `harness-init` with its seed task; `HARNESS.md` § Inception; harness 0.4.0.
- Files: `scripts/lib/harness.mjs`, `scripts/harness-lint.mjs`, `scripts/harness-init.mjs`,
  `templates/T-001-record-the-foundation.md`, `templates/harness.json`,
  `templates/project/architecture.md`, `docs/sdd/{HARNESS,TEMPLATES,VERSION}.md`, `harness.json`,
  `package.json`, `README.md`, `tests/{lint,init}.test.mjs`, `tests/helpers/fixture.mjs`.
- Baseline result: green — 55/55, lint clean, before any edit.
- Final result: green — 64/64, `harness-lint: clean`, `docs/sdd` 594/600.
- Decisions recorded: D-020 (accepted).
- Follow-up: this repo declares `foundation: []` — it ships a gate it does not yet run on itself.
  T-012 records its own foundation, brownfield-style. `docs/sdd` has 6 lines of headroom, which
  T-006…T-010 will exceed; the budget needs consolidation or its own decision before they land.

## Trace

- 2026-08-27 — read: `HARNESS.md` § Flow, `harness-lint.mjs`, `harness-init.mjs`, `lib/harness.mjs`
  · did: parsed `- Foundation:` in `decisions()`, added the gate, split init into greenfield and
  `--adopt` · checks: baseline 55/55 green.
- 2026-08-27 — did: § Inception cost 23 lines against 35 of headroom, so three principles that each
  restated a whole section of the same file were removed rather than raising the budget · checks:
  594/600.
- 2026-08-27 — did: drove a greenfield install to a `doing` task and watched the gate refuse all
  seven topics, then clear once seven accepted decisions existed · checks: 64/64, lint clean.
