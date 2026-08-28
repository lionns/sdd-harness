---
id: T-009
title: Acceptance criteria written so a check can decide them
status: done
profile: solo
harness: 0.6.0
role: Planner
goal: Adopt a constrained grammar for behavioral acceptance criteria so a criterion states a trigger and an observable result, removing the ambiguity an agent would otherwise resolve by guessing.
decisions: [D-018]
---

## Sources

- `docs/sdd/TEMPLATES.md` § Task File — criteria are free-form checkboxes today
- `docs/sdd/HARNESS.md` § Definition of Ready — "acceptance criteria are explicit and testable"
- T-004 § Review — the closure rule ticks boxes, it cannot judge what a box says
- `D-018`

## Scope

- `TEMPLATES.md`: behavioral criteria use `WHEN <trigger> THE SYSTEM SHALL <observable result>`;
  non-behavioral criteria (a file exists, a budget holds) stay plain.
- Two worked examples in the template — one behavioral, one not.
- `HARNESS.md` § Definition of Ready gains one clause pointing at the grammar.

## Out of Scope

- Linting the grammar. A regex would reward wording over meaning and push authors to satisfy the
  pattern rather than state the behavior. The grammar is a convention; the gate stays human.
- Rewriting criteria in closed tasks.
- Any requirements-management format, ID scheme, or tool.

## Acceptance Criteria

- [x] `TEMPLATES.md` states the grammar in at most six lines including both examples.
- [x] The template makes clear that non-behavioral criteria are exempt, so the grammar does not turn
      "the file exists" into ceremony.
- [x] `docs/sdd/` grows by no more than eight lines in total.
- [x] T-006's composition criterion, written in the new grammar, still fits the template.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: rewrite this task's own criteria and one criterion of T-006 in the grammar and
  confirm they read as checks rather than intentions.

## Assumptions

- Assumption: the grammar pays for itself at the point the criterion is written, not at review time.
  If authors find it fights them on non-behavioral work, the exemption clause is the release valve.

## Risks

- Constrained grammars invite box-ticking: an author can satisfy the pattern and still say nothing
  observable. This is why the task refuses to lint it — a check here would make the risk worse.

## Outcome

- Changes: `TEMPLATES.md` § Acceptance Criteria states the grammar with both examples; the
  Definition of Ready points at it.
- Files: `docs/sdd/TEMPLATES.md`, `docs/sdd/HARNESS.md`.
- Baseline result: green — 73/73, lint clean.
- Final result: green — 81/81, lint clean.
- Decisions recorded: D-018 (accepted).
- Follow-up: none. The grammar stays unlinted on purpose; if criteria stay ambiguous in real
  projects, the answer is a better example, not a regex.

## Trace

- 2026-08-27 — did: wrote the grammar in six lines with a behavioral and a non-behavioral example,
  and exempted non-behavioral criteria explicitly so "the file exists" does not become ceremony ·
  checks: 81/81, lint clean.
- 2026-08-27 — did: wrote T-006's composition criterion in the new grammar as the test name in
  `tests/lint.test.mjs`, which is the criterion proving the grammar fits real use.
