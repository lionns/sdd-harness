# Agent Model Configuration

Which agent and model fills each SDD role in this repo. Role definitions live in `docs/sdd/AGENTS.md`;
this file is project configuration.

## Active Configuration

Profile `solo` — three roles, worn by one agent in one session.

| Role | Agent | Model | Notes |
|---|---|---|---|
| Planner | Claude Code | `claude-opus-5` | Writes task files and decision candidates; the governance surface makes planning the expensive half. |
| Implementer | Claude Code | `claude-opus-5` | Same session as Planner under `solo`. Zero-dependency Node; small, reviewable diffs. |
| Reviewer | Claude Code | `claude-opus-5` | Reviews into the task's `## Review` section. Agent review is not human validation. |

The `team` roles — Tester, Release Engineer, UX/Motion Designer, split Implementers — are unassigned.
This repo runs `solo`; they are hats, not seats.

## Rationale

- One model across all three roles because the surface is small (three scripts, ~300 lines) and the
  expensive judgment is governance, not code volume. Splitting roles across models would buy
  independence of review at the cost of context that is cheap to keep in one session.
- No local or smaller model is assigned: the tasks here are mostly editing normative prose under a
  hard line budget, which is exactly where a weaker model degrades first.

## Known Risks

- Reviewer and Implementer are the same agent in the same session, so review is not independent.
  Mitigated by the enforcement scripts, which are independent of the agent's judgment, and by human
  validation being implicit on accepting the change.
- Model assignment is not enforced by any check. It is documentation of intent.

## References

- `docs/sdd/AGENTS.md` — role definitions
- `docs/project/quality-gates.md` — the commands every role runs
- `docs/decisions/D-006-agent-model-assignment.md`
