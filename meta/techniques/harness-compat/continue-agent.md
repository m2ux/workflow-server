---
metadata:
  version: 1.3.1
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

### 1. Resolve harness operation

- Apply [resolve-harness-operation](./resolve-harness-operation.md) with `{harness_kind}` and `operation_kind: resume` → `{harness_technique}`, `{harness_operation}`.

### 2. Resume

- Resume by applying `{harness_technique}`'s `{harness_operation}` Rules section with `{agent_id}`, `{session_index}`, and `{composed_prompt}`, under [foreground-always](./TECHNIQUE.md#foreground-always).

### 3. Await result

- Wait until the agent yields or completes (blocking-equivalent); capture the output as `{agent_result}`.

## Rules

### resume-is-optimisation

Harness-level resume preserves the context window. Useful, not required for correctness — workflows must be correct without it.
