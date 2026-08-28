# D-027 — Enforcement is a git hook; vendor layers are accelerators

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-013

## Context

0.5.0 shipped enforcement as a Claude Code `Stop` hook, which was the only turn-level hook available
and is not portable: every agent defines its own event format. D-017 accepted that coupling as
tolerable because the gate was optional. It is not tolerable as the only mechanism — a project on
another agent then has rules that nothing enforces, which is the failure the gate exists to prevent.

There is no cross-agent turn-level hook to move to. The enforcement points that work for every agent,
and for a human with no agent at all, are the ones that live in the repository: git and CI.

## Decision

The neutral gate is `.githooks/pre-push` running `harness-lint`, installed by `harness-init --hooks`
and wired with `git config core.hooksPath .githooks`. `--claude` adds the `Stop` hook and the skills
on top. Any future vendor gets its own flag; none of them is required, and none holds a rule.

## Consequences

- Enforcement stops depending on which agent is in the room, and covers commits made by hand.
- `pre-push`, not `pre-commit`: it is the last moment before work is shared, and it does not block
  local work-in-progress, which is what trains people into habitual `--no-verify`.
- Later than a turn-level hook. An agent can still finish a turn on a broken record; it just cannot
  push one. Vendor layers close that window where they exist.
- `core.hooksPath` is per clone, so a teammate who never runs it has no gate. CI is the backstop and
  is one command, not a file the harness ships for one CI vendor.
- Renames the 0.5.0 `--hooks` flag rather than keeping it pointed at one vendor. Breaking, and taken
  now because the alternative is a flag whose name lies about its scope.

## References

- `templates/githooks/pre-push`, `scripts/harness-init.mjs`
- `D-017`, `D-024`, `T-013`
