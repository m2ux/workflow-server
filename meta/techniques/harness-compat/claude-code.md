---
metadata:
  version: 2.0.0
---

## Capability

Harness-specific invoke details for `harness_kind: claude-code`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait/depth policy; group contract is foreground-always.

## Rules

### spawn

- Invoke `Agent(subagent_type=<type>, description={description}, prompt={composed_prompt}, run_in_background=false)`. Same primitive across CLI, IDE extensions (VSCode), and the web app.
- Set `run_in_background` false explicitly. Omitting it dispatches in the background, which forfeits the blocking-equivalent wait [foreground-always](./TECHNIQUE.md#foreground-always) requires.

### resume

- Invoke `SendMessage(<agent id or name>, {composed_prompt})`. Preserves the agent's context window; a fresh `Agent` call would start over instead.
- Include `{session_index}` in the prompt ([index-in-prompt](./TECHNIQUE.md#index-in-prompt)).

### concurrent

- Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel.
- Wait until every agent yields or completes before treating the batch as finished.
