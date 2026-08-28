# SDD Harness

Specification-Driven Development for work done with coding agents. Zero dependencies, Node >= 24.

Version **0.7.1** — changelog in [`docs/sdd/VERSION.md`](docs/sdd/VERSION.md).

## The problem it solves

Start a project with an agent and it will invent an architecture, skip the tests, and forget by next
session what it decided. Ask it again a week later and it re-derives everything from scratch, badly
and differently. The usual fix is to write more documents, which costs tokens every session and
still depends on the agent reading them.

This harness takes the opposite route: **the fewest records that answer the four questions that
matter — what is the task, what did we decide, what state is everything in, did the checks pass —
and an executable check that enforces them, so compliance costs nothing per session.**

Rules that can be a check are a check. Prose is the fallback, not the mechanism.

## Install

```sh
node scripts/harness-init.mjs ../my-app --project=my-app --hooks
```

| Flag | Effect |
|---|---|
| `--project=<name>` | required |
| `--profile=solo\|team` | `solo` is three roles, an inline trace, implicit validation. `team` is seven roles, trace files, an explicit validation gate. Default `solo` |
| `--hooks` | installs `.githooks/pre-push`, which refuses a push whose records are invalid. Git runs it for every agent, and for a human using none |
| `--claude` | adds a Claude Code `Stop` hook and three skills, catching a bad record a turn earlier. Optional, holds no rules |
| `--adopt` | the repository already has code — see below |
| `--force` | overwrite; nothing is overwritten without it |

You get `docs/sdd/`, blank specification templates in `docs/project/`, the two enforcement scripts,
`harness.json`, `JOURNAL.md`, and an `AGENTS.md` telling the agent to read `STATUS.md` first. The
result is lint-clean on arrival.

`--hooks` sets `core.hooksPath` when the target is already a git repo, otherwise it prints the one
command. That setting is per clone, so run `node scripts/harness-lint.mjs` in CI as the backstop.

## First: settle the foundation

This is the part that stops an agent inventing your architecture.

Before any task can leave `ready`, each topic your `harness.json` lists needs **one accepted
decision** in `docs/decisions/` carrying `- Foundation: <topic>`. The defaults are the choices that
are expensive to reverse:

`runtime` · `data` · `boundaries` · `identity` · `deploy` · `tests` · `interface`

- **Delete** a topic your project does not have. A CLI has no `interface`; drop it rather than
  writing "not applicable".
- **Deferring is allowed** — as an accepted decision *to defer*, with a `- Trigger:` line naming
  what will force the choice. A deferral is a record; silence is not.
- **Nothing else** is decided up front. Everything beyond the list is decided per task, on evidence.
  That is what keeps this from becoming a specification phase.

Seven decisions of forty lines each is about two hundred lines, once, for the whole project.

`--adopt` inverts this for an existing codebase: it declares no topics, so your in-flight work does
not go red on arrival, and ships `T-001` — the task that records what your code already decides,
citing the file that proves each, then declares them.

The `tests` decision matters most: it is what makes the baseline gate mean something instead of
passing trivially because nothing is configured yet.

## The loop

Once the foundation exists, every task runs the same way.

1. **Read** `STATUS.md`, `harness.json`, and the task file. That is the whole context for most work.
2. **Baseline gate.** Run the checks in `docs/project/quality-gates.md`. Red means the task is
   `blocked`, not started — unless the task is to fix the baseline.
3. **Implement** only what the task scopes.
4. **Final gate.** Same checks, green, plus a check specific to this change and at least one that
   exercises it against what already exists.
5. **Close.** Fill `## Outcome`, record the trace, set `status: done`, append one line to
   `JOURNAL.md`, run `node scripts/harness-status.mjs`.

A task is a file with its state in the front-matter and nowhere else:

```md
---
id: T-004
title: Reject a done task with no journal line
status: done
profile: solo
harness: 0.7.0
goal: Make the Definition of Done checkable rather than described.
decisions: [D-013]
implements: [FR-3]
---
```

`STATUS.md` and `docs/decisions/README.md` are generated from those files. Never edit them by hand;
`harness-lint` regenerates them and fails if what is on disk differs.

## What the linter enforces

`node scripts/harness-lint.mjs` exits non-zero on any of it, and reports every violation in one run:

- **Budgets** — task, trace, decision, journal, and total harness-doc lines. The numbers live in
  `harness.json`. Hitting one means split the task; raising one is a governance change.
- **Closure** — a `done` task needs its journal line, no unchecked acceptance criterion, a
  `## Sources` that is not empty, a task-specific check named in `## Verification`, and a `harness:`
  version the changelog declares.
- **Foundation** — no task past `ready` while a declared topic has no accepted decision.
- **Traceability** — an `implements:` id that no `docs/project/*.json` declares. Ids no task
  implements are reported without failing: a backlog is not a defect.
- **Staleness** — generated files that no longer match their sources.

## Commands

```sh
npm run check                     # tests, regenerate, lint — in that order
node scripts/harness-status.mjs   # regenerate STATUS.md and the decision index
node scripts/harness-lint.mjs     # enforce; exit 1 on any violation
npm run init -- <dir> --project=x # install into another repository
npm test                          # this repo's own suite
```

## Where things live

```
harness.json          version, profile, foundation topics, record budgets
AGENTS.md             what the agent reads first; CLAUDE.md is a pointer to it
STATUS.md             generated — every task, decision, and recent closure, one file
JOURNAL.md            append-only, one line per closed task
docs/sdd/             the harness: README (routing), HARNESS, ROLES, PROTOCOLS, TEMPLATES, VERSION
docs/project/         your specifications — brief, requirements, architecture, quality gates
docs/tasks/           one file per task
docs/decisions/       one file per decision, immutable once accepted, generated index
docs/traces/          team profile only; in solo the trace is inline in the task
```

[`docs/sdd/README.md`](docs/sdd/README.md) is the routing index: it says which harness document to
open for which job, and asks you not to read the rest.

---

This repository is the harness, and runs under it. If you are changing the harness rather than using
it, start at [`AGENTS.md`](AGENTS.md) — the governance rules bind every change here.
