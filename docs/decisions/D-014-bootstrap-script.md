# D-014 — Adoption is one command, not five manual steps

- Status: accepted
- Date: 2026-08-27
- Supersedes: none
- Tasks: T-005

## Context

Installing the harness meant following five prose steps in `README.md`: copy four trees, create two
empty directories and a `JOURNAL.md`, edit `harness.json`, wire the linter into a gate, run the
generator. Every step is a chance to copy the wrong thing — and the first step was already wrong
(D-012). A workflow that claims records should be cheap should not open with a manual checklist.

## Decision

`scripts/harness-init.mjs <target> --project=<name> --profile=solo|team` performs the install from
`templates/` and `docs/sdd/`. It refuses to overwrite existing files unless `--force`, and does not
copy itself into the target.

## Consequences

- The adoption path is executable, so it is testable: `tests/init.test.mjs` installs into a temp
  directory and runs both enforcement scripts inside the result.
- `README.md`'s steps become a description of what the command did, not instructions to follow.
- A third script joins the governance surface and must stay dependency-free.
- Upgrading an existing installation is still unsolved; `--force` overwrites rather than merges.

## References

- `scripts/harness-init.mjs`, `README.md` § Using it in a project
- `T-005`, `D-012`
