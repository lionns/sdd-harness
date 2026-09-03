# D-033 — An installed harness is a copy, and the linter can say so

- Status: accepted
- Date: 2026-09-03
- Supersedes: none
- Tasks: T-021

## Context

`harness-init` vendors the governance surface into every adopting repository — `docs/sdd/`, the
two scripts, `scripts/lib/`, and the gates — and nothing afterwards tells a copy from a fork. This
release exists because an adopting repository authored two harness versions in place: the change
was right and its records correct by every rule that repo could read, but they lived in the wrong
repository, and only a hand comparison found them. The skill that fired there says a proposal is
"a decision file in `docs/decisions/`" — the repo it stands in — and nothing says this repo is not
the harness. Prose would not have helped: D-017 moved enforcement off the agent's memory, and
D-027 keeps rules out of the vendor layer where that skill lives.

## Decision

`harness.lock` records a hash per vendored file. It is generated here by a new
`scripts/harness-manifest.mjs`, copied by `harness-init` filtered to what was installed, and
verified by `harness-lint` wherever the file is found — one code path, no repo-role flag. Drift
fails, naming the file and where the change belongs. A repository with no lock is checked as before.
Ships in `0.9.0` alongside D-032. `MINOR`.

## Consequences

- The rule stops depending on an agent reading it. Here the lock pins the release — edit governance,
  regenerate, or the lint fails, the discipline `STATUS.md` already has. There it pins the copy.
- Every `0.7.1` repository upgrades with no flag day: an absent lock checks nothing.
- A genuine fork deletes `harness.lock`; the deletion shows up in review. That is the only hatch.
- Budget *values* in `harness.json` stay unpinned — the numbers are the project's to hold, and D-031
  already checks the key set. Weakening one silently remains possible.
- A CRLF checkout hashes differently and would fail as drift. The generator must fix the newline it
  hashes, or Windows adopters are broken on arrival.

## References

- `docs/sdd/HARNESS.md` § Governance · `D-014`, `D-017`, `D-027`, `D-031`, `D-032`
