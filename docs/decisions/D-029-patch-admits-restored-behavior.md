# D-029 — `PATCH` admits fixes that restore documented behavior

- Status: accepted
- Date: 2026-08-28
- Supersedes: none
- Tasks: T-016

## Context

0.5.0 announced a `Stop` gate that blocks a turn on a broken record. Its `settings.json` entry used
a flat shape Claude Code discards, so the gate never ran in any repo that installed it, until T-015
corrected the schema. Publishing that fix runs into a taxonomy with no slot for it: § Change Rules
requires a behavior-altering change to bump the version, while § Versioning Rules defines `PATCH` as
"clarifications, formatting, non-behavioral documentation changes" and `MINOR` as backward-compatible
*additions*. A fix that restores behavior already promised is neither.

## Decision

`PATCH` becomes "clarifications, formatting, and fixes that restore already-documented behavior."
0.7.1 ships under it: the corrected schema, and the note that adopters who ran `--claude` before it
hold a dead gate.

## Consequences

- The version stays honest about what an adopter observes: a gate that starts firing is a change to
  them, and silence leaves them trusting a gate that enforces nothing.
- `MINOR` stays reserved for capability. Calling a bug fix an addition would inflate the number and
  cost the distinction that makes it readable.
- ~8 of the 29 remaining `docs/sdd/` budget lines, spent on history rather than rules. D-026
  predicted this and named it a follow-up; this does not resolve it, and the next release is worse.
- "Restores documented behavior" is bounded by what the documents claimed, so a fix to behavior
  never written down falls outside it — deliberately, but it needs judgment rather than a rule.
- 0.5.0 and 0.7.0 keep their entries unedited. A shipped changelog records what was released, not
  what worked; the 0.7.1 entry carries the correction.

## References

- `docs/sdd/VERSION.md` § Versioning Rules, § Change Rules
- `harness.json`, `README.md:5`, `tests/readme.test.mjs`
- `D-017`, `D-026`, `D-027`, `T-015`
