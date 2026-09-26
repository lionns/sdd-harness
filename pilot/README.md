# Lean workflow pilot

Install with `node scripts/harness-init.mjs <target> --project=<name> --workflow=lean`. The default
`standard` workflow remains the comparison. This pilot adds a short task contract, recorded check
results, explicit human acceptance, and a minimal coordination rule. It does not verify that an
agent's prose is true; the reviewer inspects the cited source and observed behavior.
Use a fresh test directory. `--force` on an existing harness installation can overwrite
project-owned files and is not a migration path.

## Question

Can a smaller task contract plus direct evidence reduce agent tokens, elapsed time, and human
review time without increasing defects or rework?

## Run one task

1. Choose a real task from an adopting project. Record its project, task category, agent, model,
   and a matched-pair ID before starting. Pair tasks of similar size and risk; assign one to the
   `standard` workflow and one to `lean`, on the same harness version. Keep the model and environment
   fixed within each pair. Different tasks cannot be perfectly matched; record the remaining risk.
2. For `lean`, copy `pilot/contract.md` (solo) or `pilot/contract-team.md` (team) into
   `docs/tasks/T-###-slug.md`, replace its placeholders,
   and confirm the observable goal and expensive-to-reverse choices with the human. Use `standard`
   and the normal task template for the comparison. Read the named source directly.
   Under `team`, also write the profile's trace file in `docs/traces/` and name the human validator.
3. Before implementing, run the configured baseline through the evidence command, for example
   `node scripts/harness-evidence.mjs T-101 baseline -- npm test`. A failed result is recorded;
   fix a red baseline or block the task. Then implement within the task scope.
4. Run an observable task-specific command through the same tool using `task-specific`. For a UI
   or other manual check, record a path to a screenshot, session, or reproducible observation in
   `Behavior evidence`; a manual observation does not replace the recorded command. Run the project
   check through `final` after integration. Avoid commands whose output contains secrets: the last
   2,000 characters are stored in `docs/evidence/<task>.json`.
5. Show the human the behavior, diff, decision candidates, failed checks, and residual risk. Leave
   the task in `review` until the human accepts. Then fill `Human decision: accepted by <name>`,
   mark criteria, append the journal line, regenerate `STATUS.md`, and run
   `node scripts/harness-lint.mjs`. The
   reviewer focuses on behavior and material decisions rather than reading every narrative line.
6. Enter one JSON object in a private JSONL file using `pilot/run.example.json` as the shape. Record
   actual usage supplied by the agent provider. Include every agent and coordination time; link
   the integration evidence for multi-agent runs. Leave unavailable token and cost fields null.
   Seven days later, fill the rework and escaped-defect fields. Do not invent missing measurements.

## When to use more than one agent

Use `Mode: single` unless subtasks have independent inputs and file ownership. For `parallel`, put
the owners, paths or interface contracts, integration check, and verifier in `## Agents` before
dispatch. Give each implementer a separate checkout. The verifier receives the goal, relevant
sources, and diff, then checks behavior independently of the implementer's summary. Integrate in
one checkout and record the common final command after integration. Count all agents' tokens,
elapsed time, conflict repair, and human follow-up in the run.

## Read the result

`node pilot/summarize.mjs path/to/runs.jsonl` reports each valid matched pair
and medians for elapsed and human review time. Token and dollar comparisons appear only for pairs
with both measurements. Acceptance, rework, and escaped defects remain visible beside cost.
The summary is descriptive; it does not prove a causal gain from a small pilot.

Keep the run data outside the repository if it contains project names, costs, or other private
details. Only publish aggregate findings and examples the project owner approves.
