---
metadata:
  version: 1.2.1
---

## Capability

Dispatch multiple independent agents in parallel.

## Inputs

### agents

Array of `{ description, prompt }` objects — each becomes an independent sub-agent

## Outputs

### results

Array of agent results, one per dispatched agent

## Protocol

### 1. Resolve harness operation

- Apply [resolve-harness-operation](./resolve-harness-operation.md) with `{harness_kind}` and `operation_kind: concurrent` → `{harness_technique}`, `{harness_operation}`.

### 2. Dispatch batch

- Dispatch all agents by applying `{harness_technique}`'s `{harness_operation}` Rules section under [foreground-always](./TECHNIQUE.md#foreground-always).

### 3. Await results

- Wait until every agent yields or completes (blocking-equivalent); collect each agent's final output into `{results}` in input order.

## Rules

### parallelism-is-optimisation

Honor [scatter-gather](../scatter-gather.md)::parallelism-is-optimisation — sequential fallback via [spawn-agent](./spawn-agent.md) remains valid.
