---
id: T-018
title: Adopt the plan/record budget split proven in an adopting repository
status: done
profile: solo
harness: 0.7.1
role: Implementer
goal: Release 0.8.0 and 0.8.1 here — the task budget split into plan and record, and the budget
  contract the linter checks both ways — porting the implementation and tests from the repository
  that authored and ran them, so this harness holds the change its adopters already run.
decisions: [D-030, D-031]
---

## Sources

- `docs/decisions/D-030-task-budget-plan-and-record.md` — the split
- `docs/decisions/D-031-budget-contract-both-ways.md` — the contract check and the migration
- `docs/sdd/VERSION.md` § Change Rules, § Versioning Rules · `PROTOCOLS.md` § Budgets
- `docs/sdd/TEMPLATES.md` § Task File — the 120-line budget stated in prose
- The adopting repository `cosmiq/personal/ritmo`, commits `cc49319`, `746047f`, `712e056` — the
  implementation, its four tests, and two review rounds against real tasks

## Scope

- `scripts/lib/harness.mjs` — `taskBudgetSections`, `enforcedBudgetKeys`, `budgetContractProblems`.
- `scripts/harness-lint.mjs` — the contract check before any other check, and the split budgets.
- `harness.json` — `taskFileLines` becomes `taskPlanLines: 120` and `taskRecordLines: 60`;
  `journalEntryLines` is removed.
- `templates/harness.json` — the same keys. `harness-init` spreads this file, so an adopter installs
  whatever budget set it holds.
- `tests/helpers/fixture.mjs` — `DEFAULT_CONFIG.budgets`, or every fixture repo fails the contract.
- `tests/` — a new file porting the four cases from the adopting repo's suite.
- `docs/sdd/PROTOCOLS.md` § Budgets and `TEMPLATES.md` § Task File — state the two budgets.
- `docs/sdd/VERSION.md` — `0.8.0` and `0.8.1` entries, citing `D-030` and `D-031`.
- `package.json` `version` and `README.md:5`, both pinned by tests to the declared version.
- `docs/project/data-model.md:19` — "Budget: 120 lines, trace block 25".

## Out of Scope

- **The three findings the adopter's review left open** — the split lands inside fenced code, a
  comment beside the textual scanner, and where harness tests live. `T-019`, landing in this same
  release before the version commit, so the port stays a verifiable copy and no adopter meets the
  defect. Nothing here is fixed in passing.
- **The rule that an adopter proposes upstream instead of authoring locally**, and any check for
  drift in a vendored copy. Own decision, own task.
- **Removing the harness records from the adopting repository.** A different repo, and it happens
  after this releases, not before.
- **Any new budget, rule or gate.** This adopts a change; it does not extend it.

## Acceptance Criteria

- [x] WHEN a task file's front-matter through `## Risks` exceeds `taskPlanLines` THE SYSTEM SHALL
      exit non-zero from `harness-lint` naming the task and the plan budget.
- [x] WHEN the text from the first `## Outcome` to end of file exceeds `taskRecordLines` THE SYSTEM
      SHALL exit non-zero naming the task and the record budget.
- [x] WHEN `harness.json` omits a budget the linter reads, or declares one no check reads, THE
      SYSTEM SHALL exit non-zero naming that key before any other check reports.
- [x] A task file with no `## Outcome` heading is measured entirely against `taskPlanLines`.
- [x] WHEN `harness-init` installs into a fresh target THE SYSTEM SHALL leave a repository whose
      first `harness-lint` is clean — templates, scripts and the new contract in composition.
- [x] `npm run check` is green over this repository's own 17 tasks, none of them edited.
- [x] `docs/sdd/` stays within its 650-line total.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: in a scratch copy, delete `taskPlanLines` from `harness.json` and run
  `harness-lint` — it must name the key and exit 1 rather than report clean; then give a task a
  61-line record and confirm the failure names the record budget, not the plan.

## Assumptions

- **The port is a copy, not a merge.** Rests on a file-by-file diff of the two repositories: outside
  the hunks this task lands, `scripts/`, `docs/sdd/`, `.claude/` and `.githooks/` are identical, so
  the two script files transfer verbatim.
- **`0.8.0` and `0.8.1` ship together**, as they did in the adopter. Releasing `0.8.0` alone would
  publish the silent-skip hole D-031 closes.

## Risks

- `docs/sdd/` lands at 648 of 650. Any further prose in this release must be paid for by deleting
  duplication first, as D-026 did.
- The changelog entries are re-authored with this repo's ids. Copying the adopter's text verbatim
  would cite `D-015` and `D-016`, which exist here and mean something else entirely.
- Every repo on `0.7.1` that pulls `scripts/` without its `harness.json` starts failing. That is
  D-031 working as decided, but it is the observable break and the release note must say so.

## Outcome

- Changes: `taskBudgetSections`, `enforcedBudgetKeys` and `budgetContractProblems` copied into
  `scripts/lib/harness.mjs`; `harness-lint` validates the budget contract before any other check and
  measures plan and record separately; both `harness.json` files carry the new keys; the fixture
  merges budgets instead of replacing them, so a test that narrows one no longer drops the rest.
- Files: 17 — the two scripts, both `harness.json`, `tests/{budget,lint}.test.mjs`,
  `tests/helpers/fixture.mjs`, `docs/sdd/{VERSION,PROTOCOLS,TEMPLATES}.md`,
  `docs/project/data-model.md`, `package.json`, `README.md`, this task, `JOURNAL.md`, and the two
  generated files.
- Baseline result: tests 90/90, lint clean, `docs/sdd/` 633/650
- Final result: tests 97/97, lint clean, `docs/sdd/` 648/650
- Decisions recorded: D-030, D-031, both accepted before implementation
- Follow-up: T-019 corrects the fenced-heading split before this release ships.

## Review

- Low · `tests/helpers/fixture.mjs:37` · budgets now merge, so a test cannot omit a key by passing a
  partial `budgets` object · a future test meaning to break the contract must delete the key from
  the written file, as `lint.test.mjs` does · accepted: the alternative is every budget test
  tripping the contract instead of its own rule.

## Trace

- 2026-09-03 — read: `D-030`, `D-031`, the adopting repo's `scripts/lib/harness.mjs` and
  `harness-lint.mjs`, `tests/helpers/fixture.mjs`, `tests/{lint,init,readme}.test.mjs` ·
  did: copied the two scripts verbatim — the diff outside these hunks was empty, as the plan
  assumed — then updated both `harness.json` files, the fixture, the budget message in
  `lint.test.mjs`, and the four prose surfaces; ported the adopter's four cases to
  `tests/budget.test.mjs` and added three lint cases for the split and the contract ·
  checks: baseline `npm run check` green before any edit; final tests 97/97 and lint clean;
  task-specific — on a scratch copy, deleting `taskPlanLines` failed with `budget contract missing
  \`taskPlanLines\``, and 61 appended record lines failed naming the record budget at 92 lines, not
  the plan; a fresh `harness-init --claude --hooks` install linted clean on arrival ·
  result: all seven criteria pass. No assumption left open; no blocker.

