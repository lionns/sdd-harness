# Decision Log

Record decisions that affect implementation, delivery, architecture, product behavior, governance, or future task planning.

## How to Use

- Add new entries at the top of the log.
- Keep each decision short and specific.
- Link to source documents or task plans when available.
- Use `Proposed` only when a decision is not yet approved.
- Record approved changes to the SDD harness, agent roles, templates, or protocols.
- Do not mark governance changes as `Accepted` without explicit human validation.

## Entry Template

```md
## <YYYY-MM-DD> - <Decision Title>

Status: <Proposed | Accepted | Superseded>

Context:

- <problem, constraint, or tradeoff>

Decision:

- <the selected approach>

Consequences:

- <positive or negative impact>

References:

- <path, task id, or external reference>
```

## Decisions

## 2026-05-31 - Agent Model Assignment Strategy

Status: Accepted

Context:

- Each SDD role has different reasoning requirements. Using the same model for all roles wastes cost on mechanical tasks and under-serves high-stakes ones.
- Ollama (local) is available for testing but has capacity and reasoning limits.
- OpenCode GO ($10/month) provides access to stronger open models (DeepSeek V4 Pro, Kimi K2.6, Qwen3.7 Max) without local hardware constraints.
- Reviewer was originally assigned to Ollama/qwen2.5-coder, which carries risk of missing subtle bugs before Human Validation Gate. Claude gives maximum reasoning and direct traceability for the human validator.
- Release Engineer was originally assigned to Codex, but the role is mechanical enough for a lighter model.

Decision:

- Assign Reviewer to Claude in all configs (testing and production) for maximum control, reasoning quality, and direct traceability.
- Swap Release Engineer to Ollama/qwen2.5-coder (testing) or OpenCode GO DeepSeek V4 Flash (production).
- Run Ollama configuration first for local testing validation.
- Migrate to OpenCode GO configuration after testing is validated.
- Full configuration is in `docs/project/agent-config.md`.

Consequences:

- Reviewer quality improves significantly in production config, reducing risk before Human Validation Gate.
- Cost is reduced for mechanical roles (Tester, Release Engineer) by using lighter models.
- Testing phase uses only local models — no external API cost until production config is adopted.

References:

- `docs/project/agent-config.md`
- `docs/sdd/ROLES.md`

## 2026-05-31 - Add Harness Routing Index

Status: Accepted

Context:

- Agents should not load every harness document by default because that wastes tokens and increases irrelevant context.
- Agents need a stable entry point that tells them which documents to read by role and task phase.

Decision:

- Add `docs/sdd/README.md` as the routing index for the harness.
- Update the context protocol and harness overview to require agents to start from the index and load only applicable protocols.

Consequences:

- Agents can operate with smaller, higher-signal context.
- The index becomes the first document to update when new protocols or roles are added.

References:

- `docs/sdd/README.md`
- `docs/sdd/CONTEXT_PROTOCOL.md`
- `docs/sdd/SDD_HARNESS.md`

## 2026-05-31 - Add Harness Versioning

Status: Accepted

Context:

- Agents need to know which version of the SDD harness governed a task.
- Governance changes should be traceable through a version file and changelog.

Decision:

- Add `docs/sdd/HARNESS_VERSION.md` as the source of truth for the active harness version, versioning rules, and changelog.
- Require task plans and traces to record the harness version they use.

Consequences:

- Future tasks can be interpreted against the correct harness rules.
- Governance changes require version review and changelog updates.

References:

- `docs/sdd/HARNESS_VERSION.md`
- `docs/sdd/SDD_HARNESS.md`
- `docs/sdd/TASK_TEMPLATE.md`
- `docs/sdd/TRACE_PROTOCOL.md`

## 2026-05-31 - Add Workflow Gates and Human Validation

Status: Accepted

Context:

- New implementation should not begin from a failing test or check baseline.
- Changes should not be accepted unless final checks are green.
- A human validation step is required before marking work as done.

Decision:

- Add `docs/sdd/WORKFLOW_PROTOCOL.md` with task states, required workflow, baseline gate, final acceptance gate, human validation gate, and exception rules.
- Update the harness, agent protocol, review protocol, and task template to require baseline checks, final checks, and explicit human validation.
- Add `docs/project/quality-gates.md` as the project-level source of truth for configured checks.

Consequences:

- Agents must block or escalate when the project baseline is failing before new implementation.
- Agent review is not enough to mark work done; explicit human validation is required.
- Any exception to green checks must be human-approved and recorded.

References:

- `docs/sdd/WORKFLOW_PROTOCOL.md`
- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/REVIEW_PROTOCOL.md`
- `docs/sdd/TASK_TEMPLATE.md`
- `docs/project/quality-gates.md`

## 2026-05-31 - Add Context and Token Budget Protocol

Status: Accepted

Context:

- Agent traces and task handoffs should improve future work without consuming excessive tokens.
- Agents need clear rules for selecting context so they do not rely on unsupported assumptions.

Decision:

- Add `docs/sdd/CONTEXT_PROTOCOL.md` to define compact context packets, source selection, token budget rules, and anti-hallucination rules.
- Update the harness, agent protocol, task template, and trace protocol to reference compact context and concise traces.

Consequences:

- Agents get better task context with lower token overhead.
- High-impact ambiguity is treated as a blocker instead of being guessed.

References:

- `docs/sdd/CONTEXT_PROTOCOL.md`
- `docs/sdd/TRACE_PROTOCOL.md`
- `docs/sdd/TASK_TEMPLATE.md`

## 2026-05-31 - Add Agent Trace Protocol

Status: Accepted

Context:

- Agent activity needs to be auditable so future improvements to the harness can be based on execution evidence.
- Governance changes to the SDD harness require explicit human validation.

Decision:

- Add `docs/sdd/TRACE_PROTOCOL.md` and `docs/traces/` as the standard location for task-level agent traces.
- Require task templates and agent outputs to include trace references when traces are required.

Consequences:

- Future agent work can leave concise operational records for analysis and harness improvement.
- The trace protocol adds documentation overhead, so traces should remain factual and concise.

References:

- `docs/sdd/TRACE_PROTOCOL.md`
- `docs/sdd/AGENT_PROTOCOL.md`
- `docs/sdd/TASK_TEMPLATE.md`
