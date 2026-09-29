# D-037 — Measure agent usage locally before further optimization

- Status: accepted
- Date: 2026-09-29
- Supersedes: none
- Tasks: T-027, T-024

## Context

The pilot accepts manually entered usage but lacks session-to-task collection. The user approved
adding this priority on 2026-09-29 after the token-efficiency research. Asking a model to estimate
its own usage adds cost and cannot establish a reliable measurement.

## Decision

Ship an optional, dependency-free local collector inside `pilot/`. Read only explicitly selected
logs and task intervals. Initially support Codex per-response records and Claude assistant usage.
Deduplicate responses, normalize provider cache semantics, and preserve missing telemetry. Summaries
load the resulting report directly and exclude partial coverage from paired task token totals.
Keep cost unknown: recorded usage does not establish subscription bills. Require explicit coverage
mapping; the collector cannot prove that every agent or provider event was included.

## Consequences

- Collection and aggregation need CPU and storage, but no inference or external service.
- Other providers and older schemas remain missing until separately tested adapters exist.
- This instruments T-024; it does not demonstrate savings or change closure gates.
- Jev is not integrated: its possible orchestration role needs a separate scoped experiment.

## References

- `pilot/usage.md` · `FR-18` · user approval, 2026-09-29
