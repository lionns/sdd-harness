# D-035 — Minimize records in the lean experiment

- Status: accepted
- Date: 2026-09-26
- Supersedes: none
- Tasks: T-025

## Context

The first lean pilot still copied the full release history, required a journal line and trace on
every task, and placed all completed tasks in STATUS. Those records repeat the task outcome and
executed-check evidence. STATUS is read each session; its historical rows consume context.

## Decision

For new lean installs, keep STATUS as a generated index of active work and pending decisions.
Do not require or install JOURNAL.md, or require a trace on lean tasks. The task outcome and
executed-check file remain the closure record. Install a short agent entry point and compact
release declaration. Keep the standard workflow unchanged. Measure actual tokens and time before
considering a default change. The user authorized this simplification on 2026-09-26.

## Consequences

- A lean task's closure history is in its task file and evidence, with Git history when available.
- Lean STATUS no longer offers a recent-closure recap; completed tasks remain in docs/tasks/.
- Existing installs are not rewritten. Standard retains its older journal and trace rules.

## References

- `T-025` · `D-034` · `docs/project/brief.md`
