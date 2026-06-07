---
metadata:
  version: 1.0.0
---

## Capability

Dispatch multiple independent agents in parallel.

## Inputs

### agents

Array of `{ description, prompt }` objects — each becomes an independent sub-agent

## Output

### results

Array of agent results, one per dispatched agent

## Protocol

1. Select the harness-specific invocation by `{harness}` and dispatch all agents at once:
   - `claude-code` or `cursor` — emit multiple `Task` calls in a single response turn; the harness executes them in parallel. Same across CLI, IDE extensions, and the web app; Cursor wraps the same primitive.
   - `generic` — issue parallel invocations when the harness supports concurrent dispatch; fall back to sequential [spawn-agent](./spawn-agent.md) calls otherwise.
2. Block until all agents yield or complete; collect each agent's final output into `{results}` in input order.

## Rules

### parallelism-is-optimisation

Concurrent dispatch reduces wall-clock time. Not required for correctness — sequential fallback via [spawn-agent](./spawn-agent.md) is always valid.
