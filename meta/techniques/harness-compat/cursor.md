---
metadata:
  version: 2.0.0
---

## Capability

Harness-specific invoke details for `harness_kind: cursor`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait/depth policy; group contract is foreground-always.

## Rules

### spawn

- Invoke `Agent(subagent_type=<type>, description={description}, prompt={composed_prompt}, run_in_background=false)`. Cursor wraps the Claude Code agent primitive across CLI, IDE, and web.
- Set `run_in_background` false explicitly. Omitting it dispatches in the background, which forfeits the blocking-equivalent wait [foreground-always](./TECHNIQUE.md#foreground-always) requires.

### resume

- Invoke `SendMessage(<agent id or name>, {composed_prompt})`. Preserves the agent's context window; a fresh `Agent` call would start over instead.
- Include `{session_index}` in the prompt ([index-in-prompt](./TECHNIQUE.md#index-in-prompt)).
- `SendMessage` has no blocking form: it returns once the resume is accepted, while the agent runs on. The signal that discharges the [foreground-always](./TECHNIQUE.md#foreground-always) wait is the harness task-notification for that agent — hold the turn open until it arrives, and read the send's acknowledgement as the resume being accepted rather than as the result.
- `TaskOutput` on that agent is not that wait. Against a `local_agent` task it yields the conversation transcript rather than the envelope, so one call spends thousands of tokens of context and still returns on its own timeout with the agent unfinished. The notification carries the envelope on its own.

### concurrent

- Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel.
- Wait until every agent yields or completes (synchronous dispatch, or background batch plus completion notifications) before treating the batch as finished.
