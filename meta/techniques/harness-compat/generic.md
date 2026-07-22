---
metadata:
  version: 1.1.0
---

## Capability

Harness-specific invoke details for `harness_kind: generic`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait policy; group contract is foreground-always.

## Rules

### spawn

- Use any harness mechanism that starts a new agent with `{composed_prompt}` and waits (block or completion signal) until the agent yields or completes.
- Capture the final output as `{agent_result}`.

### resume

- Prefer a host resume primitive for `{agent_id}` when available; include `{session_index}` in the prompt ([index-in-prompt](./TECHNIQUE.md#index-in-prompt)).
- Otherwise apply spawn with `{session_index}` prepended to `{composed_prompt}`. Full workflow state is read from `session.json` by the server on every authenticated call; the agent rebuilds context from artifacts and tool calls.

### concurrent

- Issue parallel invocations when the harness supports concurrent dispatch.
- Otherwise fall back to sequential [spawn-agent](./spawn-agent.md) calls.
- Wait until every agent yields or completes; collect results in input order.
