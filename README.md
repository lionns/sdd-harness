# SDD Harness

A reusable Specification-Driven Development workflow for agent-assisted delivery. Project-agnostic:
product and architecture details live in each project's `docs/project/`.

Current version: **0.2.1** — see [`docs/sdd/VERSION.md`](docs/sdd/VERSION.md).

## What it is

Six documents, two scripts, and a manifest. Together they answer four questions without ceremony:
what is the task, what did we decide, what state is everything in, and did the checks pass.

```
harness.json          active version, profile, and record budgets
STATUS.md             generated — the whole project state, one file
JOURNAL.md            append-only, one line per closed task
docs/sdd/             the harness itself: README HARNESS AGENTS PROTOCOLS TEMPLATES VERSION
docs/project/         the project's specifications (templates to fill in)
docs/tasks/           one file per task, state in the front-matter
docs/decisions/       one file per decision, generated index
docs/traces/          team profile only; in solo the trace is inline in the task
scripts/              harness-status.mjs (generate) · harness-lint.mjs (enforce)
```

## Profiles

`harness.json` sets `profile`. `solo` is three roles, an inline trace, and implicit validation.
`team` is seven roles, trace files, and an explicit validation gate. Both keep the baseline and
final check gates. Full table in [`docs/sdd/README.md`](docs/sdd/README.md).

## Using it in a project

1. Copy `docs/sdd/`, `docs/project/`, `scripts/`, `harness.json`, and empty `docs/tasks/`,
   `docs/decisions/`, `JOURNAL.md` into the project.
2. Set `project` and `profile` in `harness.json`.
3. Fill in `docs/project/` — at minimum `brief.md` and `quality-gates.md`.
4. Add `node scripts/harness-lint.mjs` to the project's final check gate.
5. Run `node scripts/harness-status.mjs` to create `STATUS.md`.

Point the project's `CLAUDE.md` at `STATUS.md` as the first file to read each session.

## Commands

```sh
npm test                          # the harness's own suite; no dependencies, Node >= 24
node scripts/harness-status.mjs   # regenerate STATUS.md and the decision index
node scripts/harness-lint.mjs     # enforce budgets and record shape; exit 1 on violation
npm run check                     # all three, in order
```

`harness-status` is deterministic — running it twice produces no diff. Never hand-edit what it writes.

## Budgets

Task 120 lines · trace block 25 · decision 40 · journal entry 1 · `docs/sdd/` total 600.
Enforced, not suggested (D-009). Hitting a budget means split the task, not raise the limit.
Raising one is a governance change.
