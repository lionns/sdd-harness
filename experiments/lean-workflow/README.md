# Lean workflow pilot

This is an opt-in experiment. It is not installed by `harness-init` and does not change the 0.9.0
rules. D-034 is proposed; the distributed workflow changes only after a measured pilot and a
separate accepted decision.

## Question

Can a smaller task contract plus direct evidence reduce agent tokens, elapsed time, and human
review time without increasing defects or rework?

## Run one task

1. Choose a real task from an adopting project. Record its project, task category, agent, model,
   and a matched-pair ID before starting. Pair tasks of similar size and risk; assign one to the
   current 0.9.0 workflow and one to this pilot. Do not change the model between pair members.
2. For `lean`, copy `contract.md` into `docs/tasks/`, replace its placeholders, and fill its short
   contract. It retains the 0.9.0 fields required by `harness-lint`, including the trace and
   journal line. The human confirms the intended outcome and any expensive-to-reverse decision.
   For `current`, use the project's installed 0.9.0 task template and normal approval path.
3. In both modes, inspect the named source directly, run the configured baseline, implement the
   scoped change, and run the final gate. Record failed checks. For consequential claims about
   project behavior, cite the exact file, command result, or direct observation. Label an
   unverified claim as an assumption.
4. For `lean`, fill `## Outcome` and `## Trace` in that same task file, mark the criteria, append
   the journal line, and regenerate `STATUS.md`. Show the human a running behavior or other
   task-specific result, the diff, and the short outcome. The human decides whether the outcome
   is acceptable; they do not audit every sentence.
5. Enter one JSON object in a private JSONL file using `run.example.json` as the shape. Record
   actual usage supplied by the agent provider. Leave unavailable token and cost fields null.
   Seven days later, fill the rework and escaped-defect fields. Do not invent missing measurements.

## When to use more than one agent

Use one agent unless subtasks have independent inputs and file ownership. If parallel, give each
agent a separate checkout, a clear deliverable, and a shared interface or acceptance contract.
Integrate once in one checkout and rerun the common final gate. A review agent gets the contract
and the diff, then inspects sources and behavior itself; it does not inherit the implementer's
conclusion as evidence. Count its tokens, elapsed time, and human follow-up in the run.

## Read the result

`node experiments/lean-workflow/summarize.mjs path/to/runs.jsonl` reports each valid matched pair
and medians for elapsed and human review time. Token and dollar comparisons appear only for pairs
with both measurements. Acceptance, rework, and escaped defects remain visible beside cost.
The summary is descriptive; it does not prove a causal gain from a small pilot.

Keep the run data outside the repository if it contains project names, costs, or other private
details. Only publish aggregate findings and examples the project owner approves.
