---
id: T-025
title: Remove redundant lean records and shorten startup context
status: done
profile: solo
harness: 0.11.0
goal: Make the opt-in lean workflow require fewer records and load less context without weakening observable verification or human acceptance.
decisions: [D-035]
implements: [FR-11, FR-12, FR-13]
---

## Sources

- `docs/project/brief.md` — record cost must stay below value
- `docs/sdd/HARNESS.md` and `docs/sdd/PROTOCOLS.md` — current records and gates
- `scripts/harness-status.mjs`, `scripts/harness-lint.mjs`, `scripts/harness-init.mjs` — mechanics
- User direction, 2026-09-26 — simplify the arnés and reduce token consumption

## Scope

- In lean installs, generate a compact active-work STATUS, remove the per-task journal and trace
  obligation, ship a short AGENTS entry point and release record, and keep behavior evidence.
- Shorten successful command records; keep enough failure output to diagnose.
- Measure documentation time alongside provider token usage in paired trials.
- Preserve the standard workflow and old task records.

## Out of Scope

- Claiming a measured token reduction before real-project telemetry exists.
- In-place migration of existing 0.9 or 0.10 installations.

## Acceptance Criteria

- [x] WHEN lean is installed THE SYSTEM SHALL start lint-clean without a journal and present a
  compact STATUS containing only actionable work and pending decisions.
- [x] WHEN a lean task closes THE SYSTEM SHALL require real check records, observable evidence,
  and human acceptance without a journal or trace.
- [x] WHEN standard is installed THE SYSTEM SHALL retain its existing journal, trace, and status
  behavior.
- [x] WHEN a paired run is summarized THE SYSTEM SHALL report documentation time and available
  token counts without estimating missing values.
- [x] WHEN lean is adopted into an existing codebase without a prior harness THE SYSTEM SHALL
  provide a foundation task that can close under the lean rules.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: install fresh solo/team lean and standard fixtures, close lean tasks without
  JOURNAL.md or trace, and verify existing standard closure tests remain green.

## Outcome

- Lean installs use a short AGENTS entry point, compact STATUS and release declaration, and no
  JOURNAL or task trace. Closure still needs executed checks, behavior evidence, residual risk,
  and named human acceptance.
- Successful check output is omitted; failure output is bounded to 1000 characters. Paired-run
  summaries now include documentation time when measured.
- Verified: `npm run check` passed, 121/121 tests and lint clean, including fresh lean solo/team,
  brownfield, optional Claude, and unchanged standard installs.
- Residual risk: token savings and delivery quality need real-project paired measurements in T-024.

## Trace

- 2026-09-26 — read: STATUS, harness config, T-024, current render/lint/init and pilot records
  · did: scoped the lean-only simplification after the user requested lower token cost
  · checks: baseline 118/118 and lint clean · assumption: savings need real telemetry.
- 2026-09-26 — read: source rules, installed templates, release records · did: implemented lean
  record reduction, conditional Claude guidance, tests, and manifest · checks: 121/121 and lint
  clean · follow-up: T-024 measures tokens, time, quality, and human review in real projects.
