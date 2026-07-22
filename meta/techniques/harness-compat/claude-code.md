---
metadata:
  version: 1.1.0
---

## Capability

Harness-specific invoke details for `harness_kind: claude-code`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait/depth policy; group contract is foreground-always.

## Rules

### spawn

- Invoke `Task(subagent_type=<type>, description={description}, prompt={composed_prompt})`. Same primitive across CLI, IDE extensions (VSCode), and the web app.
- Omit `run_in_background` or set it false when the host true-blocks.

### resume

- Invoke `Task(resume={agent_id})`. Preserves the agent's context window.
- Include `{session_index}` in the prompt ([index-in-prompt](./TECHNIQUE.md#index-in-prompt)).
- Omit `run_in_background` or set it false when the host true-blocks.

### concurrent

- Emit multiple `Task` calls in a single response turn; the harness executes them in parallel.
- Wait until every Task yields or completes before treating the batch as finished.
