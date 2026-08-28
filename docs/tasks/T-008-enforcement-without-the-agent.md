---
id: T-008
title: Move enforcement off the agent's context and into hooks
status: ready
profile: solo
harness: 0.3.0
role: Planner
goal: Package the harness as an optional Claude Code plugin whose hooks run the enforcement scripts automatically, so compliance stops costing context on every session and stops depending on the agent remembering.
decisions: [D-017]
---

## Sources

- `scripts/harness-lint.mjs` — today it runs only when someone remembers to run it
- `docs/sdd/README.md` — the routing index asks the agent to load selectively, and hopes it does
- `templates/AGENTS.md` (T-007) — the rules an agent must hold in context
- `D-017`

## Scope

- `plugin/` at the repo root: `.claude-plugin/plugin.json`, `hooks/hooks.json`, `skills/`.
- A `Stop` hook running `harness-lint`, surfacing violations as feedback rather than prose the agent
  must remember.
- Skills for the three points where the workflow is actually decided: plan a task, close a task,
  propose a governance change. Each is a thin pointer to `docs/sdd/`, not a second copy of it.
- `harness-init --plugin` installs it; without the flag nothing changes.

## Out of Scope

- Making the plugin required. The markdown core stays complete and portable on its own (T-007);
  a project on another agent must lose nothing but the automation.
- Forking harness content into skill bodies. One source of truth, referenced by path.
- Publishing to a marketplace, or any MCP server.
- Replacing `npm run check`. The hook is an extra net, not a substitute for the gate.

## Acceptance Criteria

- [ ] `claude plugin validate ./plugin` passes.
- [ ] The `Stop` hook runs `harness-lint` and its failure output reaches the session.
- [ ] Each skill body is under 40 lines and contains no rule that is not in `docs/sdd/`.
- [ ] With the plugin installed, a session that closes a task without a journal line is told so
      without the agent having read `docs/sdd/HARNESS.md` in that session.
- [ ] `harness-init --plugin` installs it; the default install is byte-identical to 0.3.0's.
- [ ] The harness still lints clean in a checkout with the plugin absent.
- [ ] `docs/sdd/` line count does not increase.
- [ ] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: install into a temp repo with and without `--plugin` and diff the trees; manual
  session check that the hook fires, recorded in the trace.

## Assumptions

- Assumption: hook output reaching the session is enough to change behavior without also restating
  the rule in prose. If it is not, the rule stays where it is and the hook is a redundant net —
  still a net gain, since it costs no session context.

## Risks

- The plugin becomes a second place where the workflow is defined, and the two drift. Mitigated by
  the under-40-line rule and by skills referencing paths rather than restating content.
- Ties part of the harness to one vendor. Mitigated by the plugin being strictly optional.
- Governance surface grows again. This is a governance change and needs approval on that basis.

## Outcome

- Changes:
- Files:
- Baseline result:
- Final result:
- Decisions recorded:
- Follow-up:
