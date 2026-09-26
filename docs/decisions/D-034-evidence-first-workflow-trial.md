# D-034 — Trial evidence before adding workflow ceremony

- Status: proposed
- Date: 2026-09-26
- Supersedes: none
- Tasks: T-023

## Context

The current harness can verify record shape and configured checks, but it cannot verify that a
task's prose is true or that its final check demonstrates the requested behavior. Producing and
reading task, review, and trace prose also has token, elapsed-time, and human-attention costs that
have not been measured across adopting projects.

## Decision

Trial an opt-in workflow in this branch: a short task contract before implementation, direct
evidence and residual risk at closure, one agent by default, and separate agents only for work
that has independent ownership and a common integration check. Measure costs and quality against
the current 0.9.0 workflow before deciding whether to change the distributed harness.

## Consequences

- The pilot cannot claim a gain from fewer lines alone; quality and human review time count.
- Existing adopters and the default install keep their current contract during the trial.
- A promoted workflow needs a separate accepted governance decision, version, migration path,
  and tests for every changed script behavior.
- Missing token telemetry is reported as missing, not filled with estimates.

## References

- `docs/project/brief.md` · `docs/sdd/HARNESS.md` · `docs/sdd/TEMPLATES.md` · `T-023`
