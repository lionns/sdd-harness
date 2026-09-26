# Agent instructions

Read `STATUS.md`, `harness.json`, and the assigned task. Open only needed sources.
`docs/project/` defines behavior; ask when it conflicts with the task.

Classify validation and resource impact before implementation. Run the baseline through
`node scripts/harness-evidence.mjs`. Stay in scope. Verify claims against sources or observations;
label assumptions. Run task-specific and final checks through the same tool. Measure affected
runtime paths before and after. Agents own technical review; show the human a usable preview for
product work and plain-language tradeoffs for consequential choices.

Use `pilot/contract.md` (or `contract-team.md`) and `pilot/README.md`.
One agent is the default. Parallel work needs separate ownership, integration, and a verifier.
Routine tasks close on evidence. Product and consequential tasks wait for human acceptance.
Never choose a new stack or production release policy on the human's behalf. First or high-risk
production deployments need live approval before execution; routine releases follow the approved
policy and provider-side controls. Regenerate `STATUS.md` and run `node scripts/harness-lint.mjs`.

Harness governance changes (`docs/sdd/`, `harness.json`, `scripts/`) require explicit human approval,
a decision file, and a version entry. `STATUS.md` and `docs/decisions/README.md` are generated.
