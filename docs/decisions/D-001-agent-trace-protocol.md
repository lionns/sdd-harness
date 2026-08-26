# D-001 — Agent traces as the audit record

- Status: superseded
- Date: 2026-05-31
- Supersedes: none
- Tasks: -

## Context

Agent activity needed to be auditable so that future harness improvements could rest on execution
evidence rather than recollection.

## Decision

Add a trace protocol and `docs/traces/` as the standard location for task-level agent traces.
Require task templates and agent outputs to reference their trace.

## Consequences

- Agent work leaves operational records that can be analysed later.
- Adds documentation overhead; traces must stay factual and concise.
- Superseded in part by D-007: in the `solo` profile the trace is an inline block, not a file.

## References

- `docs/sdd/PROTOCOLS.md` § Trace
- D-007
