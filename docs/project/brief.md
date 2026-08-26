# Project Brief

## Objective

Build and maintain the SDD harness itself: a reusable Specification-Driven Development workflow that
projects copy in to get scoped tasks, recorded decisions, generated status, and enforced record
budgets. This repo is the source of that harness, not an application that uses it.

The harness earns its place only when the cost of producing its records stays below the value they
return. Every version is judged on that trade, which is why 0.2.0 cut the document set from eleven
files to six and moved budgets from prose into an executable check.

## Users

- **Primary:** a solo developer working with coding agents, who needs the agents to work from written
  tasks and leave an auditable trail without drowning in ceremony.
- **Secondary:** a small team or multiple agent families, served by the `team` profile.

## Scope

### In Scope

- The harness documents in `docs/sdd/`, the manifest `harness.json`, and the enforcement scripts.
- Specification templates in `docs/project/` for the projects that adopt the harness.
- Keeping the harness honest about itself: its own gates, tests, and records.

### Out of Scope

- Product features of any project that adopts the harness.
- Editor, CI, or agent-runner integrations beyond the two Node scripts.

## Constraints

- Zero runtime dependencies. Node >= 24, built-ins only.
- `docs/sdd/` stays under its own 600-line budget; consolidation beats addition.
- Changes to `docs/sdd/`, `harness.json`, or `scripts/` are governance changes: explicit human
  approval, a decision file, and a `VERSION.md` entry when behavior changes.
- `STATUS.md` and `docs/decisions/README.md` are generated. Never hand-edited.

## Success Measures

- A session starts by reading one file, `STATUS.md`, and knows the whole state.
- A record that exceeds its budget fails a check rather than accumulating silently.
- The harness passes the gates it imposes on the projects that adopt it.
