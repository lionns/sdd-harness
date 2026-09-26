# Agent instructions

Read `STATUS.md`, `harness.json`, and the assigned task. Open only needed sources.
`docs/project/` defines behavior; ask when it conflicts with the task.

Run the baseline through `node scripts/harness-evidence.mjs` before implementation. Stay in scope.
Verify claims against sources or observations; label assumptions. Run task-specific and final
checks through the same tool. Show behavior, diff, decisions, and risk to the human. Leave the task
in `review` until the human accepts.

Use `pilot/contract.md` (or `contract-team.md`) and `pilot/README.md`.
One agent is the default. Parallel work needs separate ownership, integration, and a verifier.
After acceptance, mark done, regenerate `STATUS.md`, and run `node scripts/harness-lint.mjs`.

Harness governance changes (`docs/sdd/`, `harness.json`, `scripts/`) require explicit human approval,
a decision file, and a version entry. `STATUS.md` and `docs/decisions/README.md` are generated.
