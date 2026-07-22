---
metadata:
  version: 1.1.0
---

## Capability

Harness-specific invoke details for `harness_kind: cursor`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait/depth policy; group contract is foreground-always.

## Rules

### spawn

- Invoke `Task(subagent_type=<type>, description={description}, prompt={composed_prompt})`. Cursor wraps the Claude Code Task primitive across CLI, IDE, and web.
- Prefer omitting `run_in_background` (or false) when the host true-blocks.
- When the host only supports async Task, async dispatch is allowed **only if** the caller waits on the Cursor completion notification before continuing — that wait is blocking-equivalent under [foreground-always](./TECHNIQUE.md#foreground-always).

### resume

- Invoke `Task(resume={agent_id})`. Preserves the agent's context window.
- Include `{session_index}` in the prompt ([index-in-prompt](./TECHNIQUE.md#index-in-prompt)).
- Prefer omitting `run_in_background` (or false) when the host true-blocks; async resume plus completion notification is allowed when the host cannot true-block.

### concurrent

- Emit multiple `Task` calls in a single response turn; the harness executes them in parallel.
- Wait until every Task yields or completes (true block, or async batch + completion notifications) before treating the batch as finished.
