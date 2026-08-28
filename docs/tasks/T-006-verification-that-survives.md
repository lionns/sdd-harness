---
id: T-006
title: Verification the agent cannot quietly satisfy
status: ready
profile: solo
harness: 0.3.0
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

- [ ] `AGENTS.md` forbids deleting, skipping, relaxing, or narrowing a check to reach green, and
      names the escape hatch: a wrong check is a decision, not an edit.
- [ ] `HARNESS.md` distinguishes iterated checks from the integration check and requires one of each.
- [ ] The `quality-gates.md` template's final table has an integration row that cannot be left as `—`.
- [ ] The task template requires one acceptance criterion about the change working *with* existing
      behavior, not only in isolation.
- [ ] `harness-lint` rejects a `done` task with an empty task-specific verification line.
- [ ] Composition: the new lint rule runs together with the T-004 closure rules on the same task and
      all violations are still reported in one run.
- [ ] `docs/sdd/` stays within 600 lines; the added prose is under 15 lines total.
- [ ] `npm run check` is green.

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

- Changes:
- Files:
- Baseline result:
- Final result:
- Decisions recorded:
- Follow-up:
