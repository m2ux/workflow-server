---
metadata:
  version: 1.0.0
---

## Capability

Resume an existing sub-agent, preserving accumulated context where the harness supports it.

## Inputs

### agent_id

Harness-assigned identifier for the agent to resume (harness-specific; may be unavailable on some harnesses).

### session_index

Workflow-server `session_index` — included in the prompt so the resumed agent can authenticate every tool call against the server-managed `session.json`.

### composed_prompt

Updated instructions or continuation context

## Outputs

### agent_result

The resumed agent's next yield or final output

## Protocol

1. Select the harness-specific invocation by `{harness_kind}` and dispatch it as foreground (blocking):
   - `claude-code` or `cursor` — `Task(resume={agent_id})`. Preserves the agent's context window. Include `{session_index}` in the prompt. Never set `run_in_background`. Same primitive across CLI, IDE extensions, and the web app; Cursor wraps the same Claude Code Task primitive.
   - `generic` — apply [spawn-agent](./spawn-agent.md) with the `{session_index}` prepended to the `{composed_prompt}`. Full workflow state is read from `session.json` by the server on every authenticated call; the agent rebuilds context from artifacts and tool calls.
2. Block until the agent yields or completes; capture the output as `{agent_result}`.

## Rules

### resume-is-optimisation

Harness-level resume preserves the context window. Useful, not required for correctness — workflows must be correct without it.
