# Local agent usage — pilot priority

Measure before optimizing. This optional Node tool reads explicit local session logs; it never
calls a model, contacts a service, installs a dependency, or estimates a bill. It ships with lean;
for a standard comparison, invoke the same tool from the harness source checkout.

## Collect once a task finishes

1. The runner/operator copies `usage.example.json` to a private directory and sets `project`,
   `taskId`, each provider, real session ID, and log path. Paths resolve beside the manifest.
   Codex uses the thread ID (`session_meta.payload.id` / `token_usage_record.payload.thread_id`).
   Claude uses `sessionId`; for a subagent log also set its `agentId` (both appear in the log).
   Include implementers, retries, reviewers, and subagents separately.
2. Prefer sessions dedicated to one task. For a shared session, record the task's UTC start/end
   as `from` and `to` in advance. The interval is `[from,to)` by response timestamp, not prompt
   start. Wait for requests to finish and logs to flush. Do not split an in-flight request or
   run unrelated work in the same interval. Without boundaries, the whole selected session counts.
3. Keep `coverage: partial` until every participating session and interval is accounted for.
   Set `complete` only after checking that mapping. The tool cannot discover omitted agents,
   missing provider telemetry, or prove that a transcript is complete.
4. Run locally, with paths adjusted to your private directory:

   ```sh
   node pilot/usage.mjs /private/path/sessions.json > /private/path/usage.json
   ```

5. In the pilot run record, set `usageFile` to the report path (relative to the runs JSONL file,
   or absolute). Run `node pilot/summarize.mjs /private/path/runs.jsonl`. It reads the measured
   input/output totals automatically; partial reports leave the paired token metric unavailable.
   Keep `costUsd: null` unless independently supplied billing data is actually attributable.

Repeating collection replaces the report; it never appends usage again. The same model, provider
version, reasoning settings, and environment must be kept within each comparison pair. Manual
`inputTokens` / `outputTokens` records still work when `usageFile` is null or absent.

## Supported formats and accounting

- Codex: JSONL `token_usage_record` with `payload.thread_id`, `response_id`, and `usage`.
  Input includes cached input; output includes reasoning. Those breakdowns are not added again.
  Cumulative `token_count` and old CLI streams are deliberately unsupported: resets, fork history,
  and repeated counters can distort attribution. A log without response records stays missing.
- Claude Code: JSONL assistant messages with `sessionId`, `message.id`, and `message.usage`.
  Subagents may share the parent session ID; their `agentId` distinguishes the source.
  Input is uncached + cache creation + cache read. All three counters are required. Repeated
  content blocks for one response use the largest reported counters, rather than being summed.
- A response is counted once by provider and response ID. Cross-session collisions fail clearly.
  Historical Codex records belonging to another thread are excluded. Duplicate session entries
  and multiple paths to the same file are rejected.
- Gemini and OpenCode need additional adapters; they currently produce an explicit missing result.
  Missing files, counters, or matching records never become zero. Invalid JSON fails without
  echoing transcript text. Run again after an active writer has finished its last line.
- Reports retain IDs, numeric counters, observed models when supplied, and a hash of the file path;
  no prompts, code, tool output, or local paths are copied. Reports still belong in private storage.

`observedInputTokens` / `observedOutputTokens` expose the available subtotal when coverage is
partial. Cache/reasoning breakdowns also describe observed data. `inputTokens` / `outputTokens`
are task totals only with declared complete coverage and supported records from every source.
These logs are best-effort telemetry, not authoritative invoices or subscription-quota meters.
CPU and disk work remain; no inference is needed. If an agent invokes the command and reads its
report, that conversation still consumes tokens. Run collection and aggregation outside the model
loop (terminal or runner hook) and show the agent only the summary when needed.

## Sources checked 2026-09-29

- [Codex protocol: TokenUsageRecord](https://github.com/openai/codex/blob/main/codex-rs/protocol/src/protocol.rs)
- [Anthropic cache accounting](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [ccusage: broader optional local-log tooling](https://github.com/ccusage/ccusage)

Start with comparable real tasks, include acceptance and later rework, and change one optimization
at a time. Tallying usage is implemented; reduced cost or better quality still needs pilot evidence.
