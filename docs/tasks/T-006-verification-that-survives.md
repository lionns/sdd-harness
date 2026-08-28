---
id: T-006
title: Verification the agent cannot quietly satisfy
status: done
profile: solo
harness: 0.6.0
role: Planner
goal: Close the gap between "the configured checks pass" and "the change works", by forbidding the cheap ways to make a gate green and by requiring one criterion about composition rather than isolation.
decisions: [D-015]
---

## Sources

- `docs/sdd/HARNESS.md` § Final Acceptance Gate, § Definition of Done
- `docs/sdd/AGENTS.md` § Universal Rules — no rule currently protects the checks themselves
- `templates/project/quality-gates.md` — one flat list; no distinction between iterated and held-out checks
- `D-015`

## Scope

- `AGENTS.md` § Universal Rules: weakening a check to make it pass is a defect, not a fix.
- `HARNESS.md` § Final Acceptance Gate: name the two kinds of check and require both.
- `quality-gates.md` template: split the final table into checks the agent iterates against and at
  least one integration check that exercises features together.
- `TEMPLATES.md` § Task File: acceptance criteria must include one composition criterion.
- `harness-lint`: a `done` task whose `## Verification` names no task-specific check fails.

## Out of Scope

- Requiring a separate held-out test suite. Writing tests twice costs more than it returns at this
  size; the cheap half of the idea is the integration check, and that is what this task takes.
- Any change to budgets, states, or profiles.
- Coverage thresholds or any metric that can be gamed by adding trivial tests.

## Acceptance Criteria

- [x] `ROLES.md` forbids deleting, skipping, relaxing, or narrowing a check to reach green, and
      names the escape hatch: a wrong check is changed by a decision, never by an edit.
- [x] `HARNESS.md` distinguishes iterated checks from the integration check and requires one of each.
- [x] The `quality-gates.md` template splits the final gate into iterated checks and composition
      checks, the latter carrying a required integration row offered no `—`.
- [x] The task template requires one acceptance criterion about the change working *with* existing
      behavior, not only in isolation.
- [x] `harness-lint` rejects a `done` task with an empty task-specific verification line.
- [x] Composition: the new lint rule runs together with the T-004 closure rules on the same task and
      all violations are still reported in one run.
- [x] The added prose is under 15 lines total. The 600-line budget did not hold and was raised
      to 650 by D-026, after 26 lines of duplication were deleted to pay for it.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: a fixture task that is `done`, journal-linked, fully ticked, and still fails on the
  missing task-specific check — proving the rule adds a distinct signal rather than duplicating T-004.

## Assumptions

- Assumption: the integration check is named per project in `quality-gates.md`; the harness cannot
  know what "works end to end" means for an arbitrary project, so it enforces presence, not content.

## Risks

- Prose rules are the weakest form of enforcement and cost context on every session. Mitigated by
  keeping the addition under 15 lines and pairing it with one executable rule.
- A project with genuinely no integration surface (a pure library) may find the required row
  artificial. Acceptable: `quality-gates.md` § Known Exceptions already exists for that.

## Outcome

- Changes: weakening a check is now a named defect with a named escape hatch; the final gate
  distinguishes iterated checks from composition checks and requires both; a `done` task must name a
  task-specific check.
- Files: `docs/sdd/{ROLES,HARNESS,TEMPLATES}.md`, `templates/project/quality-gates.md`,
  `docs/project/quality-gates.md`, `scripts/harness-lint.mjs`, `tests/{lint.test,helpers/fixture}.mjs`.
- Baseline result: green — 73/73, lint clean.
- Final result: green — 81/81, lint clean, `docs/sdd` 609/650.
- Decisions recorded: D-015 (accepted), D-026 (budget 600 → 650).
- Follow-up: the open question this task recorded is still open — whether the 120-line task budget
  itself drives the isolation failures it is trying to cure. Nothing here answers it, and it should
  be answered from real projects rather than from reasoning.

## Trace

- 2026-08-27 — did: added the check-protection rule, the two-kinds-of-check clause, and the lint
  rule requiring a task-specific verification line · checks: every existing closed task already
  named one, so the rule found no debt.
- 2026-08-27 — did: the new rule broke the minimal fixture, which had no `## Verification` at all.
  Fixed in the fixture rather than by softening the rule, and added the composition test asserting
  this rule and the T-004 closure rules all report in one run · checks: 81/81.
- 2026-08-27 — did: `docs/sdd` reached 609 against a 600 budget. Deleted three duplications first
  (26 lines), then raised the budget to 650 by D-026 rather than shaving rules to hit a number.
