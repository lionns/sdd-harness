# Architecture

## Stack

Node >= 24, ES modules, zero runtime and zero dev dependencies. Tests run on the built-in
`node --test` runner. There is no build step, no bundler, and no TypeScript.

## Components

| Component | Responsibility |
| --- | --- |
| `scripts/lib/harness.mjs` | The only reader of the repo's records. Resolves `ROOT`, parses front-matter, lists tasks, decisions, traces, journal lines, and counts lines. Every rule and every renderer goes through it. |
| `scripts/harness-status.mjs` | Renders `STATUS.md` and `docs/decisions/README.md`. Exports `renderStatus` and `renderDecisionIndex` so the linter can compare without shelling out. |
| `scripts/harness-lint.mjs` | Enforces budgets, record shape, and closure integrity. Collects every violation, prints them together, exits 1. |
| `scripts/harness-init.mjs` | Installs `docs/sdd/`, `templates/`, and the two enforcement scripts into a target repo (D-014). |
| `docs/sdd/` | The harness itself: routing index, principles and gates, roles, protocols, templates, changelog. |
| `templates/` | What an adopter receives. Never this repo's own content (D-012). |

## Data

Records are files. There is no database, no index, and no cache: `STATUS.md` and the decision index
are pure functions of the files on disk, which is what makes regeneration deterministic and lets the
linter detect staleness by re-rendering and comparing. See `data-model.md` for the record shapes.

## Key Constraints

- **Determinism.** No timestamps, no `mtime` ordering, no randomness in generated output. Running
  the generator twice must produce no diff; a test asserts it.
- **Canonical paths.** `ROOT` comes from `fileURLToPath(new URL("../../", import.meta.url))`, and
  entrypoint detection compares against `realpathSync(process.argv[1])`. Anything else breaks on a
  path containing a space or a symlink (D-011).
- **One line count.** `lineCount` is the single definition every budget check and every report uses.
- **Copied, not linked.** Adopters get a copy of the scripts. There is no package to install and no
  version to resolve, so the scripts must work standalone from any repo root.
- **Fail together.** The linter never short-circuits on the first violation.

## Security

No network access, no credentials, no user input beyond CLI flags and the repo's own files.
`harness-init` writes outside its own tree, so it refuses to overwrite an existing file without
`--force`.

## Deployment

None. The harness is consumed by copying it into a repository, via `harness-init` or by hand.

## Known Constraints

- Front-matter parsing covers a deliberate subset of YAML: scalars and flat `[a, b]` lists.
- Upgrading an installed harness in place is unsolved; `--force` overwrites rather than merges.
