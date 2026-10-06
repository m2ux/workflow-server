---
metadata:
  version: 1.7.0
---

## Capability

Dispatch a new isolated sub-agent with no prior context.

## Inputs

### composed_prompt

Full task prompt for the new agent

### description

*(optional)* Short label for the agent's role, useful for tracing. Unset when the caller has none.

## Outputs

### agent_result

The sub-agent's final output (text, including any `<checkpoint_yield>` block) — captured when the agent yields or completes

## Protocol

### 1. Resolve Harness Technique

- Apply [resolve-harness-operation](./resolve-harness-operation.md) with `{harness_kind}` and `operation_kind: spawn` → `{harness_technique}`, `{harness_operation}`.

### 2. Dispatch Agent

- Dispatch by applying `{harness_technique}`'s `{harness_operation}` Rules section with `{composed_prompt}` and `{description}`, under `foreground-always`.

### 3. Await Result

- Wait until the agent yields a checkpoint or returns (blocking-equivalent); capture its final output as `{agent_result}`.

## Rules

### depth-1-only

A spawned agent does not inherit a dispatch primitive. One orchestrator drives the orchestrator-level work.
