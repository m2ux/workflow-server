# spawn-agent

Dispatch a new isolated sub-agent with no prior context.

## Inputs

- **prompt** — Full task prompt for the new agent
- **description** — Short label for the agent's role (optional; useful for tracing)

## Output

- **result** — The sub-agent's final output (text, including any `<checkpoint_yield>` block) — captured when the agent yields or completes

## Procedure

1. Use the harness's foreground spawn primitive (see Harness implementations below) with the given prompt; block until the agent yields a checkpoint or returns.

## Harness implementations

| Harness | Invocation |
|---|---|
| claude-code | `Task(subagent_type=<type>, description=<description>, prompt=<prompt>)` — same primitive across CLI, IDE extensions (Cursor, VSCode), and the web app. Omit `run_in_background` or set it to false. Spawned sub-agents do not inherit Task (depth-1-only rule). |
| cursor | Same as claude-code (Cursor wraps the Claude Code Task primitive). |
| cline | `use_subagents({ prompt_1: <prompt> })` |
| generic | Any harness mechanism that starts a new agent with the given prompt and blocks until the agent yields or completes. |

## Rules

### foreground-always

CRITICAL: spawn-agent MUST be dispatched as foreground (blocking). Never set `run_in_background`. Background dispatch silently breaks checkpoint delivery — the orchestrator never sees the worker's `<checkpoint_yield>`.

### index-in-prompt

When the spawned agent inherits a workflow session, ALWAYS include the `session_index` in the prompt. Server-managed `session.json` holds the state; the index is the lookup key.

### depth-1-only

spawn-agent operates depth-1 only. The Task primitive is a harness-level session-control gate; spawned sub-agents do not inherit it. Workflows MUST NOT design around nested orchestrator agents — one orchestrator agent drives all orchestrator-level work across all session levels.
