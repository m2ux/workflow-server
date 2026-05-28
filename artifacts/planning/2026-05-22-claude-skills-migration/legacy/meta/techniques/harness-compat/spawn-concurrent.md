# spawn-concurrent

Dispatch multiple independent agents in parallel.

## Inputs

- **agents** — Array of `{ description, prompt }` objects — each becomes an independent sub-agent

## Output

- **results** — Array of agent results, one per dispatched agent

## Procedure

1. Use the harness's parallel-dispatch primitive (see Harness implementations below) for all agents at once; block until they all yield or complete.

## Harness implementations

| Harness | Invocation |
|---|---|
| claude-code | Multiple `Task` calls in a single response turn — the harness executes them in parallel. Same across CLI, IDE extensions, and the web app. |
| cursor | Same as claude-code. |
| generic | Parallel invocations when the harness supports concurrent dispatch; sequential [spawn-agent](spawn-agent.md) calls otherwise. |

## Rules

### parallelism-is-optimisation

Concurrent dispatch reduces wall-clock time. Not required for correctness — sequential fallback via [spawn-agent](spawn-agent.md) is always valid.
