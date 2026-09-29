---
id: T-027
title: Collect local agent usage per pilot task
status: done
profile: solo
harness: 0.13.0
goal: Make task token measurement reproducible from existing logs without asking an agent to estimate usage.
decisions: [D-037]
implements: [FR-18]
---

## Sources

- `docs/project/requirements.json` — FR-18
- `pilot/usage.md` — supported formats, measurement procedure, primary references
- `T-024` — real-project comparison still required
- User direction, 2026-09-29 — prioritize passive measurement

## Scope

- Read selected Codex and Claude session files with explicit task attribution and optional intervals.
- Normalize counters, deduplicate response records, preserve missing telemetry, and avoid billing guesses.
- Let paired summaries read usage reports without manual token transcription.
- Ship the collector with lean installations, tests, and an on-demand measurement guide.

## Out of Scope

- A background service, automatic discovery of every agent, or provider billing reconciliation.
- Gemini/OpenCode adapters, changing acceptance gates, or integrating Jev.
- Claiming measured token reductions before running T-024.

## Acceptance Criteria

- [x] WHEN selected session logs are collected THE SYSTEM SHALL report usage associated with the task
  without model calls, network access, dependencies, or copied transcript content.
- [x] WHEN cached tokens, reasoning, or repeated records occur THE SYSTEM SHALL avoid double counting.
- [x] WHEN coverage is partial or unsupported THE SYSTEM SHALL keep task totals unavailable.
- [x] WHEN a paired run references a usage report THE SYSTEM SHALL load matching measured totals
  and reject a mismatched task or project.

## Verification

- Baseline: `npm run check` — 127 tests, lint clean before implementation.
- Task-specific: `node --test tests/usage.test.mjs`; local Codex/Claude metadata-only smoke checks.
- Final: `npm run check`

## Outcome

- Optional local collection ships with lean and can be invoked from source for standard pairs.
- Paired summaries read task-matched usage reports; partial coverage stays unavailable.
- Verified: 138 tests and final lint clean; docs/sdd 588 lines. Real local logs yielded supported
  records for Codex (75), Claude main (684), and Claude subagent (29), without copying content.
- Residual risk: logs and declared coverage are best effort, not billing proof. Older Codex formats,
  Gemini, and OpenCode are unsupported. T-024 still requires real paired outcome measurements.

## Trace

- 2026-09-29 — read: STATUS, harness, T-024, pilot sources, provider protocol and Jev documentation
  · did: scoped approved priority and implemented local collection · checks: baseline 127/127;
  initial collector tests 10/10 · assumption: caller declares all participating sessions accurately.
- 2026-09-29 — read: actual local log field shapes · did: included Claude subagent attribution,
  report import, installer coverage, and source-only references · checks: collector 11/11;
  final check 138/138 and lint clean · follow-up: T-024 measures benefit, not document size.
