---
metadata:
  version: 1.0.0
---

## Capability

Dispatch a new isolated sub-agent with no prior context.

## Inputs

### harness

Identifier of the harness in use: `claude-code`, `cursor`, `cline`, or `generic`

### prompt

Full task prompt for the new agent

### description

Short label for the agent's role (optional; useful for tracing)

## Output

### result

The sub-agent's final output (text, including any `<checkpoint_yield>` block) — captured when the agent yields or completes

## Protocol

1. Select the harness-specific invocation by `harness` and dispatch it as foreground (blocking):
   - `claude-code` or `cursor` — `Task(subagent_type=<type>, description=<description>, prompt=<prompt>)`. Same primitive across CLI, IDE extensions (Cursor, VSCode), and the web app. Omit `run_in_background` or set it to false. Cursor wraps the same Claude Code Task primitive. Spawned sub-agents do not inherit Task (depth-1-only — see Rules).
   - `cline` — `use_subagents { prompt_1: <prompt> }`.
   - `generic` — any harness mechanism that starts a new agent with the given {prompt} and blocks until the agent yields or completes.
2. Block until the agent yields a checkpoint or returns; capture its final output as `result`.

## Rules

### depth-1-only

spawn-agent operates depth-1 only. The Task primitive is a harness-level session-control gate; spawned sub-agents do not inherit it. Workflows MUST NOT design around nested orchestrator agents — one orchestrator agent drives all orchestrator-level work across all session levels.
