---
metadata:
  version: 1.1.0
---

## Capability

Harness-specific invoke details for `harness_kind: cline`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait policy; group contract is foreground-always.

## Rules

### spawn

- Invoke `use_subagents { prompt_1: {composed_prompt} }`.
- Wait until the sub-agent yields or completes before continuing.

### resume

- When Cline exposes a resume primitive for `{agent_id}`, use it with `{composed_prompt}` and `{session_index}` in the prompt ([index-in-prompt](./TECHNIQUE.md#index-in-prompt)).
- Otherwise fall back to [spawn-agent](./spawn-agent.md) via [generic](./generic.md) with `{session_index}` prepended to `{composed_prompt}`.

### concurrent

- Issue parallel `use_subagents` invocations when the host supports concurrent dispatch.
- Otherwise fall back to sequential [spawn-agent](./spawn-agent.md) calls.
- Wait until every agent yields or completes before treating the batch as finished.
