# D-017 — Enforcement belongs in hooks, not in the agent's memory

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-008

## Context

Every rule in `docs/sdd/` is paid for twice: once in context on the sessions that read it, and again
whenever an agent forgets it. `harness-lint` is deterministic and free, but only runs when someone
remembers to run it — which is the same failure the rules have. A `Stop` hook can run it when a turn ends, and
skills expose the workflow at ~100 tokens of name and description until one is actually loaded.

## Decision

Ship an optional standalone `.claude/` — a `Stop` hook running `harness-lint`, plus thin skills for
planning, closing, and proposing — installed by `harness-init --hooks`. Not a plugin: a plugin needs
a marketplace or `--plugin-dir` on every launch, while `.claude/` is checked into the adopting repo
and reaches every teammate with no install. The markdown core stays complete and portable; this only
automates it. Skill bodies reference `docs/sdd/` by path and never restate it.

## Consequences

- Compliance stops competing with the task for context — the direction every rule should move.
- Two representations of the workflow now exist, and can drift. Capped at 40 lines per skill and
  enforced by reference-not-restate.
- Couples part of the harness to one vendor; kept tolerable by being strictly optional.
- The governance surface grows by a third component.
- Converting to a plugin later is a copy, not a rewrite: the `hooks` object in `.claude/settings.json`
  is format-identical to a plugin's `hooks/hooks.json`. Choosing standalone forecloses nothing.
- A `Stop` hook cannot see whether the agent read the rules, only whether the records are valid. It
  catches a bad close; it cannot cause a good one.

## References

- `templates/claude/`, `scripts/harness-lint.mjs`
- `T-008`, `D-016`
