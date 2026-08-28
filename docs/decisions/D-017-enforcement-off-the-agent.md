# D-017 — Enforcement belongs in hooks, not in the agent's memory

- Status: proposed
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-008

## Context

Every rule in `docs/sdd/` is paid for twice: once in context on the sessions that read it, and again
whenever an agent forgets it. `harness-lint` is deterministic and free, but only runs when someone
remembers to run it — which is the same failure the rules have. A Claude Code plugin can run it on a
hook and expose the workflow as skills whose name and description cost ~100 tokens until used.

## Decision

Ship an optional plugin: a `Stop` hook running `harness-lint`, plus thin skills for planning,
closing, and proposing. The markdown core stays complete and portable; the plugin only automates it.
Skill bodies reference `docs/sdd/` by path and never restate it.

## Consequences

- Compliance stops competing with the task for context — the direction every rule should move.
- Two representations of the workflow now exist, and can drift. Capped at 40 lines per skill and
  enforced by reference-not-restate.
- Couples part of the harness to one vendor; kept tolerable by being strictly optional.
- The governance surface grows by a third component.

## References

- `plugin/`, `scripts/harness-lint.mjs`
- `T-008`, `D-016`
