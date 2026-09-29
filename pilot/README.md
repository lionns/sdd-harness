# Lean workflow pilot

Install with `node scripts/harness-init.mjs <target> --project=<name> --workflow=lean`. The default
`standard` workflow remains the comparison. This pilot adds a short task contract, recorded check
results, risk-based acceptance, and a minimal coordination rule. A recorded claim is not proof of
its truth; a verifier inspects the cited source and observed behavior.
Use a fresh test directory. `--force` on an existing harness installation can overwrite
project-owned files and is not a migration path.

## Question

Can a smaller task contract plus direct evidence reduce agent tokens, elapsed time, and human
review time without increasing defects, rework, or resource consumption?

## Human touchpoints

Ask the human for product goals and operating constraints, not a stack name: expected usage,
monthly spend, sensitive data, reliability, and maintenance preference. For foundation choices,
show a short recommendation with one alternative, assumptions, cost range, lock-in, and reversal
path. Write `- Human choice: accepted by <person>; evidence: <reply reference>` only after an
explicit reply. A deploy decision also states `- Release policy: manual` or `guarded-auto` and
its conditions. `guarded-auto` needs `- Release controls:` naming monitoring and rollback.
Present choices in five short points: recommendation, alternative, recurring cost with assumptions,
main risk, and what the human must decide. A Markdown line cannot authenticate the person.

Show the human a usable preview for product tasks. Agents own tests, source checks, technical
review, and documentation. Routine technical tasks close on evidence. Product and consequential
tasks wait for human acceptance. Consequential tasks need an independent verifier; sensitive
security, privacy, or data changes may also require a qualified human technical reviewer.
Use `routine` for internal, reversible changes; `product` for user-visible milestones; and
`consequential` for stack, identity, data, billing, or high-risk production choices. Classify by
impact, not by the number of lines changed.

Prepare production releases with preview, observed resource cost, known risk, monitoring, and
rollback. The first and high-risk release pauses for live approval **before** the deploy action.
Routine releases may automate only under the approved policy and provider-side protections; this
file check cannot stop an arbitrary command from deploying.

## Run one task

1. Choose a real task from an adopting project. Record its project, task category, agent, model,
   and a matched-pair ID before starting. Pair tasks of similar size and risk; assign one to the
   `standard` workflow and one to `lean`, on the same harness version. Keep the model and environment
   fixed within each pair. Different tasks cannot be perfectly matched; record the remaining risk.
2. For `lean`, copy `pilot/contract.md` (solo) or `pilot/contract-team.md` (team) into
   `docs/tasks/T-###-slug.md`. Set `validation: routine|product|consequential` and name the
   runtime path in `Resource impact: measured ...`, or explain `none ...`. Set these before work
   starts. Use `standard` and its normal task template for the comparison. Read sources directly.
3. Before implementing, run the configured baseline through the evidence command, for example
   `node scripts/harness-evidence.mjs T-101 baseline -- npm test`. A failed result is recorded;
   fix a red baseline or block the task. For a measured path, also run its resource command with
   `resource-before` now. Then implement within the task scope.
4. Run an observable task-specific command through the same tool using `task-specific`. For a UI
   or other manual check, record a path to a screenshot, session, or reproducible observation in
   `Behavior evidence`; a manual observation does not replace the recorded command. For a measured
   path, run the *same* resource command with `resource-after`, then run `final` after integration.
   Record observed values and budget in `Resource evidence`. Successful resource output and failed
   check tails are bounded to 1,000 characters; do not print secrets.
5. The verifier checks code, documentation claims, and resource evidence. For `product`, give the
   human a usable `Preview`; for `consequential`, present the decision and independent review.
   Add `- Preview:` for product, `- Review evidence:` for consequential, and `- Resource evidence:`
   for measured paths. Product and consequential tasks add `- Human decision: accepted by <person>`
   only after a reply and stay in `review` meanwhile. Routine tasks need none of these fields.
   Mark criteria, regenerate `STATUS.md`, and run the linter.
6. Enter one JSON object in a private JSONL file using `pilot/run.example.json` as the shape. Record
   actual usage supplied by the agent provider. Prefer the [local collector](usage.md) and set
   `usageFile` to its report; it makes no model calls. Measure documentation time too. Include every agent
   and coordination time; link
   the integration evidence for multi-agent runs. Leave unavailable token and cost fields null.
   Seven days later, fill rework, escaped defects, and resource regressions. Do not invent missing
   measurements.

## When to use more than one agent

Use `Mode: single` unless subtasks have independent inputs and file ownership. For `parallel`, put
the owners, paths or interface contracts, integration check, and verifier in `## Agents` before
dispatch. Give each implementer a separate checkout. The verifier receives the goal, relevant
sources, and diff, then checks behavior independently of the implementer's summary. Integrate in
one checkout and record the common final command after integration. Count all agents' tokens,
elapsed time, conflict repair, and human follow-up in the run.

## Read the result

`node pilot/summarize.mjs path/to/runs.jsonl` reports each valid matched pair
and medians for elapsed, documentation, and human review time. Token and dollar comparisons appear only for pairs
with both measurements. Acceptance, rework, and escaped defects remain visible beside cost.
The summary is descriptive; it does not prove a causal gain from a small pilot.

Keep the run data outside the repository if it contains project names, costs, or other private
details. Only publish aggregate findings and examples the project owner approves.
