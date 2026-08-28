# SDD Harness

A reusable Specification-Driven Development workflow for agent-assisted delivery. Project-agnostic:
product and architecture details live in each project's `docs/project/`.

Current version: **0.3.0** — see [`docs/sdd/VERSION.md`](docs/sdd/VERSION.md).

## What it is

Six documents, three scripts, and a manifest. Together they answer four questions without ceremony:
what is the task, what did we decide, what state is everything in, and did the checks pass.

```
harness.json          active version, profile, and record budgets
STATUS.md             generated — the whole project state, one file
JOURNAL.md            append-only, one line per closed task
docs/sdd/             the harness itself: README HARNESS AGENTS PROTOCOLS TEMPLATES VERSION
docs/project/         this project's own specifications; adopters get `templates/project/`
docs/tasks/           one file per task, state in the front-matter
docs/decisions/       one file per decision, generated index
docs/traces/          team profile only; in solo the trace is inline in the task
templates/            what an adopter receives: CLAUDE.md, harness.json, JOURNAL.md, project specs, seed task
scripts/              harness-status.mjs (generate) · harness-lint.mjs (enforce) · harness-init.mjs (install)
```

## Profiles

`harness.json` sets `profile`. `solo` is three roles, an inline trace, and implicit validation.
`team` is seven roles, trace files, and an explicit validation gate. Both keep the baseline and
final check gates. Full table in [`docs/sdd/README.md`](docs/sdd/README.md).

## Using it in a project

```sh
node scripts/harness-init.mjs ../my-app --project=my-app --profile=solo
```

That installs `docs/sdd/`, the specification templates as `docs/project/`, the two enforcement
scripts, `harness.json`, `JOURNAL.md`, and a `CLAUDE.md` that points the agent at `STATUS.md` first —
then generates `STATUS.md`, so the result is lint-clean on arrival. Existing files are never
overwritten without `--force`.

Add `--adopt` for a repository that already has code. A greenfield install declares the seven
foundation topics and no task may leave `ready` until each has an accepted decision; an adopted
install declares none — an existing repo would go red on arrival — and ships `T-001`, the task that
records what the code already decides and then declares them (D-020).

Two things remain yours:

1. Settle the foundation: `runtime`, `data`, `boundaries`, `identity`, `deploy`, `tests`,
   `interface`. One accepted decision each, ~200 lines once, and everything else is decided per
   task on evidence. Drop a topic the project does not have.
2. Fill `docs/project/brief.md` and `docs/project/quality-gates.md` from the `tests` decision, and
   add `node scripts/harness-lint.mjs` to that final check gate.

`templates/` is what gets installed. It never contains this repo's own specifications (D-012).

## Commands

```sh
npm test                          # the harness's own suite; no dependencies, Node >= 24
npm run init -- <dir> --project=x # install the harness into another repository (--adopt if it has code)
node scripts/harness-status.mjs   # regenerate STATUS.md and the decision index
node scripts/harness-lint.mjs     # enforce budgets and record shape; exit 1 on violation
npm run check                     # all three, in order
```

`harness-status` is deterministic — running it twice produces no diff. Never hand-edit what it writes.

## Budgets

Task 120 lines · trace block 25 · decision 40 · journal entry 1 · `docs/sdd/` total 600.
Enforced, not suggested (D-009). The linter also enforces closure: a `done` task needs its journal
line, no unchecked acceptance criterion, and a `harness:` version the changelog declares (D-013).

Hitting a budget means split the task, not raise the limit. Raising one is a governance change.
