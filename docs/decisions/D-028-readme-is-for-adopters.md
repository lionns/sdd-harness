# D-028 — The README is for adopters; contributors read AGENTS.md

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-014

## Context

The README drifted four versions — it announced 0.3.0 while `harness.json` said 0.7.0, quoted a
budget D-026 had already changed, and linked to a table T-008 deleted. Every other record in this
repo stayed exact over the same period, because every other record is checked. The README is in no
budget, is not generated, and no test reads it. It is the one surface where the harness asked
someone to remember.

It also addresses two readers at once — someone installing the harness in their project, and someone
changing the harness itself — which is why its directory tree mixes `docs/project/` with
`templates/` and reads badly cold.

## Decision

The README is written for one reader: someone adopting the harness. Guidance for changing the
harness stays in `AGENTS.md`, which every contributing agent already loads. Facts the README would
otherwise restate — version, budgets, flags — are either read from their source or pinned by a test.

## Consequences

- A newcomer gets one narrative instead of two interleaved ones.
- Staleness becomes a failing test rather than something noticed four versions late.
- Only what a test can check is protected. Prose that goes out of date in meaning, not in a number,
  still depends on someone reading it.
- Contributors lose the orientation the README gave them. `AGENTS.md` is loaded first by every agent
  working here, so the cost falls on humans browsing the repo, who have `docs/sdd/README.md`.

## References

- `README.md`, `AGENTS.md`, `tests/readme.test.mjs`
- `D-016`, `D-026`, `T-014`
