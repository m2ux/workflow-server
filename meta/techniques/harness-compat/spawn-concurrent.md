---
metadata:
  version: 1.3.0
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

### the-batch-is-the-purchase

A concurrent batch buys wall clock and bounded contexts, and it pays a whole further delivery for every member past the first. Emit the batch in one turn, so the wait is a fact of the turn rather than something scheduled; a chain of plain dispatches through [spawn-agent](./spawn-agent.md) is the sequential shape, and it forfeits what the batch is for.
