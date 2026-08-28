# CLAUDE.md

This repo *is* the SDD harness. It also runs under it — the gates and budgets here are the ones it
imposes on every project that adopts it.

## Read first, every session

1. `STATUS.md` — every task, decision, and journal entry, in one generated file.
2. `harness.json` — the active harness version, profile, and record budgets.
3. The assigned task file in `docs/tasks/`.

If those three answer the question, stop reading. `docs/sdd/README.md` is the routing index.

## Rules that bind every change

- `docs/project/` is the authority for scope and behavior. Do not invent requirements inside an
  implementation task.
- No new implementation on a red baseline. Run `npm run check` first; if it fails, the task is
  `blocked`, not started — unless the task is to repair that baseline.
- A change is done only when `npm run check` is green. Never report `done` while a check fails.
- Keep changes inside the task's scope. No opportunistic refactors.
- Label assumptions as assumptions. Cite a file, command, or observation.
- Record the inline `## Trace` block, append the journal line, regenerate `STATUS.md`.

## Repo-specific

- Zero runtime dependencies. Node >= 24, built-ins only. Nothing enters `package.json`.
- `docs/sdd/` has a hard 600-line budget. Consolidate rather than add.
- New behavior in `scripts/` ships with a test in `tests/`.
- `templates/` is what adopters copy — never put this repo's own content there (D-012).
- `docs/project/` is this repo's own filled specification, not a template.

## Never edit by hand

`STATUS.md` and `docs/decisions/README.md` are generated. Run `npm run status`.

## Governance

Everything in `docs/sdd/`, `harness.json`, and `scripts/` is the governance surface: explicit human
approval, a decision file, and a `VERSION.md` entry when behavior changes. Propose; do not apply.

## Commands

```sh
npm test          # node --test, no dependencies
npm run status    # regenerate STATUS.md and the decision index
npm run lint      # enforce budgets, record shape, and closure integrity
npm run check     # all three, in order
```
