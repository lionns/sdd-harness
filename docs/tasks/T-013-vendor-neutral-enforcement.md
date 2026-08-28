---
id: T-013
title: Make the enforcement gate work for any agent, not only Claude
status: done
profile: solo
harness: 0.7.0
role: Implementer
goal: Move the enforcement gate to a git hook that runs for every agent and for a human with none, and demote the Claude Code layer to an optional accelerator behind its own flag.
decisions: [D-027]
implements: [NFR-6]
---

## Sources

- `templates/claude/` — the 0.5.0 gate, which only Claude Code fires
- `scripts/harness-init.mjs` — `--hooks` currently means "Claude"
- `D-017` § Consequences — the vendor coupling, accepted then as tolerable
- `D-027`

## Scope

- `templates/githooks/pre-push` running `harness-lint`, portable shell, no dependencies.
- `harness-init --hooks` installs it and runs `git config core.hooksPath .githooks` when the target
  is a git repository, reporting what it did.
- `harness-init --claude` installs the `Stop` hook and the skills, additive to `--hooks`.
- This repo installs its own `.githooks/`, and a test keeps it identical to the template.
- `README.md` and `templates/AGENTS.md` state which layers are neutral and which are not.

## Out of Scope

- A CI workflow file. That would pick one CI vendor to un-pick another; the README names the one
  command instead.
- Hook formats for other agents. Each would be a guess until someone runs the harness on one.
- Moving any rule into a vendor layer. The skills hold no rules today and must not start.
- `pre-commit`. Blocking every local commit is what teaches people to pass `--no-verify` always.

## Acceptance Criteria

- [x] WHEN `harness-lint` fails THE SYSTEM SHALL make `.githooks/pre-push` exit non-zero.
- [x] WHEN the records are valid THE SYSTEM SHALL make the hook exit zero and print nothing.
- [x] WHEN the target is a git repository THE SYSTEM SHALL set `core.hooksPath` to `.githooks` and
      say so; when it is not, it SHALL install the hook and print the command to run.
- [x] `--claude` installs `.claude/`; `--hooks` alone installs no vendor file at all.
- [x] Composition: an install with both flags lints clean and both gates fire on the same broken
      record.
- [x] The hook is executable in the target after install.
- [x] `npm run check` is green.

## Verification

- Baseline: `npm run check`
- Final: `npm run check`
- Task-specific: run the hook directly against a clean and a broken fixture repo, and install into
  a real `git init` directory to confirm `core.hooksPath` is set.

## Assumptions

- Assumption: `sh` is available wherever the harness is adopted. Node is already required (D-021),
  but git itself invokes hooks through a shell, so the hook is shell and delegates immediately.

## Risks

- `core.hooksPath` is per clone. A teammate who never configures it has no gate at all, and nothing
  in the repo can detect that. CI is the only real backstop and the README says so.
- Renaming `--hooks` breaks any 0.5.0 adopter. Accepted: there are none, and a flag named for a
  capability that belongs to one vendor would keep lying as more vendors arrive.

## Outcome

- Changes: `.githooks/pre-push` is the enforcement gate and runs for any agent; the Claude layer
  moved from `--hooks` to `--claude` and became additive; `NFR-6` records vendor neutrality as a
  requirement of this project rather than an aspiration.
- Files: `templates/githooks/pre-push`, `.githooks/pre-push`, `scripts/harness-init.mjs`,
  `docs/project/requirements.json`, `AGENTS.md`, `templates/AGENTS.md`, `README.md`,
  `docs/sdd/VERSION.md`, `harness.json`, `templates/harness.json`, `package.json`,
  `tests/{init,hooks}.test.mjs`.
- Baseline result: green — 81/81, lint clean.
- Final result: green — 85/85, lint clean, `docs/sdd` 621/650.
- Decisions recorded: D-027 (accepted).
- Follow-up: `NFR-4` said 600 and D-026 had made that false; it now names `harness.json` instead of
  a number, so it cannot go stale on the next budget change.

## Trace

- 2026-08-27 — read: `templates/claude/`, `harness-init.mjs`, D-017 § Consequences · did: confirmed
  there is no cross-agent turn-level hook to move to — every agent defines its own event format — so
  the neutral gate has to live where the repo does, in git · checks: baseline 81/81 green.
- 2026-08-27 — did: wrote the `pre-push` hook in shell delegating immediately to Node, split
  `--hooks` from `--claude`, and made `harness-init` wire `core.hooksPath` itself when the target is
  already a git repo · checks: ran the hook against a clean and a broken checkout of this repo; it
  refused the broken one, correctly, on a task that had no trace yet.
- 2026-08-27 — did: `chmodSync` after copy, because `cpSync` does not reliably carry the executable
  bit and git ignores a hook it cannot run — pinned by a test on the file mode · checks: 85/85.
