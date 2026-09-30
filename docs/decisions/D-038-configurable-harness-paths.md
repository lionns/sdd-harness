# D-038 — Adopters may name the docs and scripts directories

- Status: accepted
- Date: 2026-09-30
- Supersedes: none
- Tasks: T-028

## Context

A brownfield adopter (analitica-sgp) already versions `Docs/` and `Scripts/`. On a case-insensitive
filesystem the installer wrote into them silently; on Linux, where that product runs, every script,
hook and lock entry looks for `docs/` and `scripts/` and finds nothing. Renaming the project's
directories was rejected: nobody knows what references them. The adopter's owner approved this
design on 2026-09-30 and asked that the harness change only with explicit approval.

## Decision

`harness.json` accepts an optional `paths` object, `{"docs": "<dir>", "scripts": "<dir>"}`, each a
single directory name; absent keys default to `docs` and `scripts`. Scripts and hooks resolve every
harness path from it at run time, so vendored files stay byte-identical and the lock verifies.
`harness-init` takes `--docs-dir` and `--scripts-dir`, keys the lock by the installed paths, and
refuses to install when an existing directory differs from the requested one only in letter case.

## Consequences

- MINOR (0.14.0): a project without `paths` behaves exactly as before.
- Prose in `docs/sdd/` keeps saying `docs/` and `scripts/`; one routing line declares them logical.
- Hooks now read `harness.json`; the shell hook uses the `node` it already requires.
- Moving an existing install is a manual copy plus a regenerated lock, not `--force`.

## References

- `FR-19` · `scripts/lib/harness.mjs` · `scripts/harness-init.mjs` · owner approval, 2026-09-30
