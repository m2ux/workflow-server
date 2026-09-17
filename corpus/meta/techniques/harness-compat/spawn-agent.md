---
metadata:
  version: 1.4.0
---

## Capability

Dispatch a new isolated sub-agent with no prior context.

## Inputs

### composed_prompt

Full task prompt for the new agent

### description

Short label for the agent's role (optional; useful for tracing)

## Outputs

### agent_result

The sub-agent's final output (text, including any `<checkpoint_yield>` block) — captured when the agent yields or completes

## Protocol

### 1. Resolve harness operation

- Apply [resolve-harness-operation](./resolve-harness-operation.md) with `{harness_kind}` and `operation_kind: spawn` → `{harness_technique}`, `{harness_operation}`.

### 2. Dispatch

- Dispatch by applying `{harness_technique}`'s `{harness_operation}` Rules section with `{composed_prompt}` and `{description}`, under [foreground-always](./TECHNIQUE.md#foreground-always).

### 3. Await result

- Wait until the agent yields a checkpoint or returns (blocking-equivalent); capture its final output as `{agent_result}`.

## Rules

### depth-1-only

spawn-agent operates depth-1 only. Spawned sub-agents do not inherit the orchestrator's dispatch primitive. Workflows MUST NOT design around nested orchestrator agents — one orchestrator agent drives all orchestrator-level work across all session levels. Harness-specific nesting limits are documented in the harness technique files.

A spawned agent therefore has no dispatch primitive, and `concurrency = 1` is its scatter contract, not a shortfall against it: any [scatter-gather](../scatter-gather.md) it runs is the sequential case, and running one is conformance, not deviation. Parallel scatter is available only where the dispatch primitive is — at the orchestrator. Hoist a pass there when its fan-out is worth an orchestrator-owned step; otherwise author it sequential and size the work accordingly.
