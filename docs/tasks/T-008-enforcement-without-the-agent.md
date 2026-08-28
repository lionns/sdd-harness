---
id: T-008
title: Move enforcement off the agent's context and into hooks
status: done
profile: solo
harness: 0.5.0
role: Planner
goal: Run the enforcement scripts from a Stop hook installed into the adopting repo, so compliance stops costing context on every session and stops depending on the agent remembering.
decisions: [D-017]
---

## Sources

- `scripts/harness-lint.mjs` — today it runs only when someone remembers to run it
- `docs/sdd/README.md` — the routing index asks the agent to load selectively, and hopes it does
- `templates/AGENTS.md` (T-007) — the rules an agent must hold in context
- `D-017`

## Scope

- `templates/claude/`: `settings.json`, `hooks/harness-gate.mjs`, `skills/`. Standalone `.claude/`,
  not a plugin — changed mid-task on evidence, see § Trace.
- A `Stop` hook running `harness-lint`, exiting 2 so the violation blocks the turn and reaches the
  session rather than being prose the agent must remember.
- Skills for the three points where the workflow is actually decided: plan a task, close a task,
  propose a governance change. Each is a thin pointer to `docs/sdd/`, not a second copy of it.
- `harness-init --hooks` installs it; without the flag nothing changes.

## Out of Scope

- Making the gate required. The markdown core stays complete and portable on its own (T-007); a
  project on another agent must lose nothing but the automation.
- Forking harness content into skill bodies. One source of truth, referenced by path.
- Publishing to a marketplace, packaging as a plugin, or any MCP server.
- Replacing `npm run check`. The hook is an extra net, not a substitute for the gate.

## Acceptance Criteria

- [x] `.claude/settings.json` parses and declares exactly one `Stop` handler with no `matcher`,
      which is the shape the hooks reference specifies for that event.
- [x] The `Stop` hook runs `harness-lint` and its failure output reaches the session, exiting 2
      on a violation, 0 when clean, and 0 on a repeat pass so a session cannot loop.
- [x] Each skill body is under 40 lines and contains no rule that is not in `docs/sdd/`.
- [x] With the gate installed, a task closed without a journal line is reported by the hook, which
      reads no harness document and holds no rule in context.
- [x] `harness-init --hooks` installs it; the default install is byte-identical to 0.4.0's, and
      a second `--hooks` install refuses to clobber an adopter's own `.claude/`.
- [x] The harness still lints clean in a checkout with the gate absent.
- [x] `docs/sdd/` line count does not increase.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: install into a temp repo with and without `--hooks` and diff the trees; fire the
  hook against a clean repo, a broken one, and a repeat pass.

## Assumptions

- Assumption: hook output reaching the session is enough to change behavior without also restating
  the rule in prose. If it is not, the rule stays where it is and the hook is a redundant net —
  still a net gain, since it costs no session context.

## Risks

- The skills become a second place where the workflow is defined, and the two drift. Mitigated by
  the under-40-line rule, by skills referencing paths rather than restating content, and by a test
  asserting this repo's `.claude/` is byte-identical to the template.
- Ties part of the harness to one vendor. Mitigated by the gate being strictly optional.
- Governance surface grows again. This is a governance change and needs approval on that basis.

## Outcome

- Changes: `templates/claude/` — a `Stop` hook running `harness-lint`, three skills, and the
  settings that wire them; `harness-init --hooks`; harness 0.5.0.
- Files: `templates/claude/**`, `.claude/**`, `scripts/harness-init.mjs`, `tests/hooks.test.mjs`,
  `tests/init.test.mjs`, `docs/sdd/{README,PROTOCOLS,VERSION}.md`, `README.md`,
  `templates/CLAUDE.md`, `harness.json`, `templates/harness.json`, `package.json`.
- Baseline result: green — 64/64, lint clean, before any edit.
- Final result: green — 73/73, lint clean, `docs/sdd` 589/600, down from 594.
- Decisions recorded: D-017 (amended while proposed, then accepted).
- Follow-up: T-007's `AGENTS.md` still collides with `docs/sdd/AGENTS.md`. The skills reference
  `docs/sdd/` paths, so that rename must update three skill bodies with it.

## Trace

- 2026-08-27 — read: the Claude Code hooks and plugins references · did: verified `Stop` before
  building on it — it is valid, takes **no** `matcher` (the task assumed one), and exit 2 blocks the
  turn returning stderr · checks: baseline 64/64 green.
- 2026-08-27 — did: **changed the mechanism from a plugin to standalone `.claude/`.** A plugin needs
  a marketplace or `--plugin-dir` on every launch; `.claude/` is checked into the adopting repo and
  needs no install, which is the same argument as D-024. The `hooks` object is format-identical, so
  a plugin remains a copy away. D-017 and the criteria above were rewritten to the delivered
  mechanism, not to what happened to pass.
- 2026-08-27 — did: paid for the `VERSION.md` entry by deleting two admitted duplicates — the budget
  table in `PROTOCOLS.md` and the profile table in `docs/sdd/README.md`, both restating normative
  content held elsewhere · checks: 594 → 589 lines, 73/73, lint clean.
