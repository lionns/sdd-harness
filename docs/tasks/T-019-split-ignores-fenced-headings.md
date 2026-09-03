---
id: T-019
title: The task split ignores headings inside fenced code
status: done
profile: solo
harness: 0.7.1
role: Implementer
goal: Correct `taskBudgetSections` so a `## Outcome` inside a fenced code block does not split a
  task, and mark the budget scanner as a textual match, closing the two findings the adopting
  repository's review left open — before this release ships rather than after.
decisions: [D-030]
---

## Sources

- `docs/decisions/D-030-task-budget-plan-and-record.md` § Decision — the split this corrects to
- `docs/tasks/T-018-adopt-plan-and-record-budgets.md` § Out of Scope — the findings deferred here
- The adopting repository `cosmiq/personal/ritmo`: `docs/tasks/T-004-harness-loose-ends.md`, and
  `docs/traces/2026-08-31_T-002_reviewer.md` § round 3, probe 4 — both findings, each with its probe
- `docs/sdd/TEMPLATES.md:51` — the fenced `## Outcome` that makes this reachable

## Scope

- `scripts/lib/harness.mjs` — `taskBudgetSections` tracks fence state while scanning and splits at
  the first `## Outcome` outside a fenced block.
- `scripts/lib/harness.mjs` — one comment beside the budget scanner recording that the match is
  textual, so `budgets.<name>` must not be written in prose under `scripts/`.
- `tests/` — the two fenced cases, alongside the four this release already ports.
- `docs/sdd/VERSION.md` — one clause in the `0.8.0` entry, since the fence rule is part of what the
  split means, not a later correction to it.

## Out of Scope

- **A new decision file.** D-030 already decided where a task splits; a heading quoted inside a code
  block was never an `## Outcome`. This makes the implementation match the accepted decision.
- **A version of its own.** `0.8.0` and `0.8.1` are `proposed` here and have shipped to no one, so
  there is nothing to patch — this lands inside the same release, before the version commit.
- **Replacing the textual scan with a parser.** Disproportionate for a lint script, and it fails
  toward more enforcement rather than less. The adopter's review recommended against it; the
  comment is the whole mitigation.
- **Indented code blocks.** A task using four-space indentation instead of fences still mis-splits.
  It fails loudly on the record budget, so it is noise, not a hole.
- **The third finding** — harness tests living in the directory that mirrors the product core. It is
  the adopter's layout problem: here the harness *is* the product, and `tests/` already has its own
  runner. Nothing to port.

## Acceptance Criteria

- [x] WHEN a task file contains `## Outcome` only inside a fenced code block THE SYSTEM SHALL
      measure the whole file against `taskPlanLines`.
- [x] WHEN a task file contains a fenced `## Outcome` before its real one THE SYSTEM SHALL split at
      the real heading.
- [x] `plan + record` equals the file total for every task in `docs/tasks/`, fences or not.
- [x] WHEN `harness-lint` runs over this repository after the fix THE SYSTEM SHALL stay clean with
      no task file edited — the composition check: the corrected split against the real 19 tasks.
- [x] `docs/sdd/` stays within its 650-line total.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: add a scratch task quoting `TEMPLATES.md` § Task File inside a fence, with a plan
  over 120 lines and no real `## Outcome`; confirm `harness-lint` fails on the plan budget rather
  than reporting a 9-line plan and a long record. Remove it.

## Assumptions

- **Fence state is enough.** Rests on the finding itself: the only real occurrence is a task quoting
  the template, which fences it. Nothing in `docs/sdd/` asks tasks to indent code instead.
- **The scan needs no other guard.** `enforcedBudgetKeys` reads every script; this repository has
  one more than the adopter (`harness-init.mjs`), and it references no `budgets.<name>` — verified
  by grep, and by the test that pins the returned set to the real keys.

## Risks

- Tracking fences means the split now depends on a second piece of state. The test pins both
  directions, and `plan + record == total` stays checkable on every real task.
- `docs/sdd/` is at 648 of 650 once T-018 lands. One clause fits; a sentence does not.
- Sequencing: if this lands after the release commit rather than before it, the release note is
  wrong and the fix needs a `0.8.2` the budget cannot pay for.

## Outcome

- Changes: `taskBudgetSections` walks the file tracking fence state and splits at the first
  `## Outcome` outside a fenced block; a comment beside the budget scanner records that the match is
  textual and that prose under `scripts/` must not spell the pattern out; the `0.8.0` entry says the
  fenced heading is not one.
- Files: 6 — `scripts/lib/harness.mjs`, `tests/budget.test.mjs`, `docs/sdd/VERSION.md`, this task,
  `JOURNAL.md`, `STATUS.md`
- Baseline result: tests 97/97, lint clean, `docs/sdd/` 648/650
- Final result: tests 99/99, lint clean, `docs/sdd/` 649/650
- Decisions recorded: none — this makes the implementation match D-030, which decided the split
- Follow-up: none. The indented-code case stays out of scope and fails loudly, as recorded.

## Review

- Low · `scripts/lib/harness.mjs:41` · a fence closed by a longer marker of the other character
  (`~~~~` after ```` ``` ````) leaves the fence open, and the rest of the file counts as plan · a
  task would have to mix both fence characters to reach it · accepted: it fails toward the plan
  budget, which is the safe direction, and CommonMark says a fence closes only on its own character.

## Trace

- 2026-09-03 — read: `D-030`, `T-018` § Outcome, `scripts/lib/harness.mjs`,
  `docs/sdd/TEMPLATES.md` § Task File, the adopting repo's `T-004` and reviewer trace ·
  did: replaced the single-regex split with a line walk that tracks ``` and ~~~ fences, added the
  scanner comment, added two cases to `tests/budget.test.mjs`, and extended the `0.8.0` entry by one
  line · checks: baseline `npm run check` green; final tests 99/99 and lint clean at 649/650;
  task-specific — a scratch task quoting `TEMPLATES.md` § Task File inside a fence, with 115 filler
  lines and no real `## Outcome`, split under the old regex into plan 186 / record 36 and now fails
  with `plan is 222 lines, plan budget is 120`; `plan + record` equals the file for all 21 tasks ·
  result: all five criteria pass. No blocker.

