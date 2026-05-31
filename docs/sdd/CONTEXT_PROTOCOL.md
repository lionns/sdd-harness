# Context Protocol

## Purpose

This protocol defines how agents select and carry context during SDD work. The goal is to give each agent enough evidence to act correctly without wasting tokens on irrelevant or duplicated material.

## Context Principles

- Load the smallest context set that can safely answer the task.
- Start from `docs/sdd/README.md` to identify which harness documents apply.
- Prefer file paths, section names, task IDs, and decision IDs over copying long content.
- Read source documents directly when accuracy matters.
- Summarize only stable facts, constraints, decisions, and open questions.
- Treat missing context as a blocker when guessing would change product behavior, architecture, data, security, or governance.
- Do not rely on memory when a local source of truth exists.

## Context Packet

Each task should provide a compact context packet:

```md
## Context Packet

Objective:

Primary sources:

Relevant decisions:

Required constraints:

Known exclusions:

Open questions:

Token budget notes:
```

## Source Selection

Use this priority order:

1. `docs/sdd/README.md` for routing.
2. Assigned task plan.
3. Relevant project specification sections.
4. Relevant accepted decisions.
5. Directly affected source files.
6. Recent traces for the same task, feature, or decision.
7. External references only when the task explicitly requires them.

## Token Budget Rules

- Do not paste full documents into task plans or traces unless the exact wording is required.
- Do not read all harness documents by default.
- Use excerpts only for clauses that are critical to acceptance criteria, contracts, or governance.
- Keep traces concise and link to files instead of reproducing file contents.
- Prefer bullet summaries for findings, assumptions, and verification results.
- Archive detailed investigation notes outside the main task only when they are necessary for future work.

## Anti-Hallucination Rules

- Every task should name the source documents that define scope.
- Every assumption must be labeled as an assumption.
- Claims about project behavior must reference a source, file, command result, or observation.
- If two sources conflict, stop and escalate instead of choosing silently.
- If context is insufficient for a high-impact decision, request human clarification.

## Context Handoff

When handing work to another agent, include:

- What was read.
- What was concluded.
- What remains uncertain.
- Which files changed.
- Which checks passed or failed.
- Which source should be read next.

The handoff should be short enough to fit into a task plan or trace without duplicating the underlying documents.
