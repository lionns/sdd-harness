# D-032 — The changelog is history, and the rules budget should not hold it

- Status: accepted
- Date: 2026-09-03
- Supersedes: none
- Tasks: T-020

## Context

`sddDocsTotalLines` caps `docs/sdd/` at 650. Once the current release lands the directory sits at
649, and `VERSION.md` is 143 of those — about 110 of them changelog entries, which grow four to
eight lines per release and are never removed. D-026 paid for the last raise by deleting duplication
first; D-029 then spent eight of the remaining lines on history and recorded that the next release
would be worse. It is: `0.9.0`'s entry cannot be written at all, and D-033 needs a line of prose it
cannot have. The budget caps what a session must read (D-002, D-009), and a changelog is read when
migrating between versions, not when working a task.

## Decision

The changelog moves to `CHANGELOG.md` at the repository root, which `harness-init` installs
alongside `docs/sdd/`. `VERSION.md` keeps the versioning rules, the change rules, and the current
version — the parts that bind a task. `knownVersions()` reads the new file. Ships in `0.9.0`
alongside D-033. `MINOR`: nothing about what is enforced changes.

## Consequences

- This has the shape of narrowing a check to reach green, which `ROLES.md` calls a defect. The
  distinction is what the number is for: the budget caps the rules a session loads, and release
  history never was one. What remains in `docs/sdd/` is all rules; leaving history there is the gaming.
- About 110 lines return to the rules budget, and it stops shrinking by a release per release.
- Adopters keep the migration notes: an install that dropped the changelog would leave a repository
  unable to read why its version changed.
- Four readers point at the old path — `knownVersions`, the linter's message, `README.md:5` and
  three test files. Each is a pin that must move with it.
- `docs/sdd/` and `CHANGELOG.md` can now disagree about the current version. The existing version
  pins cover `README.md` and `package.json`; this adds a third surface to hold together.

## References

- `docs/sdd/VERSION.md` § Change Rules · `D-002`, `D-009`, `D-026`, `D-029`, `D-033`
