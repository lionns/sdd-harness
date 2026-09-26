# D-034 — Trial evidence before adding workflow ceremony

- Status: accepted
- Date: 2026-09-26
- Supersedes: none
- Tasks: T-023

## Context

The current harness can verify record shape and configured checks, but it cannot verify that a
task's prose is true or that its final check demonstrates the requested behavior. Producing and
reading task, review, and trace prose also has token, elapsed-time, and human-attention costs that
have not been measured across adopting projects.

## Decision

Ship an opt-in `lean` workflow in 0.10.0. It uses a short task contract, records executed checks,
requires observable evidence and human acceptance at closure, and requires ownership, integration,
and a verifier for parallel work. A paired-run tool compares total cost and quality with `standard`.
The default workflow stays `standard`. The user approved applying these four changes on 2026-09-26.

## Consequences

- The pilot cannot claim a gain from fewer lines alone; quality and human review time count.
- Existing adopters and the default install keep their current contract during the trial.
- The pilot mode is installable and tested; making it the default needs measured results and a
  separate decision. Older task records keep their original workflow rules.
- Missing token telemetry is reported as missing, not filled with estimates.

## References

- `docs/project/brief.md` · `docs/sdd/HARNESS.md` · `docs/sdd/TEMPLATES.md` · `T-023`
