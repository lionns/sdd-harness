# D-011 — Scripts resolve paths canonically

- Status: accepted
- Date: 2026-08-26
- Supersedes: none
- Tasks: T-001, T-002

## Context

T-001 gave the harness its first test suite, and the suite immediately failed: `harness-status`
exited 0 without generating anything. Two path bugs, both in code the harness relies on to enforce
itself. `import.meta.url === \`file://${process.argv[1]}\`` compares a path Node canonicalized
against one it did not, so the guard is false through any symlink — `npm run check` then deadlocks,
because the linter correctly reports the generated files stale and names the script that just did
nothing. Separately, `new URL(...).pathname` kept percent-encoding, so any repo path containing a
space failed every read with `ENOENT`.

## Decision

Resolve paths through `fileURLToPath`, and decide entrypoint identity by comparing it to
`realpathSync(process.argv[1])`, both behind named helpers in `scripts/lib/harness.mjs`. Give the
line budgets one shared `lineCount`, so `sddDocLines` stops counting a trailing newline that the
linter's own counting had always stripped.

## Consequences

- The scripts work from symlinked paths and paths containing spaces. Regression tests pin all three
  behaviors and fail against the pre-fix scripts.
- Every project's reported `docs/sdd/` total drops by one line per file; here 535 becomes 529. The
  number only goes down, so no project can newly fail the budget.
- **Open:** `VERSION.md` defines `PATCH` as non-behavioral documentation changes, which does not
  cover a bug fix in `scripts/`. `0.2.1` is issued under a stretched reading. The versioning rules
  need a category for enforcement-layer fixes; that is a separate governance change.

## References

- `T-001` § Review · `T-002`
- `scripts/lib/harness.mjs`, `tests/paths.test.mjs`
