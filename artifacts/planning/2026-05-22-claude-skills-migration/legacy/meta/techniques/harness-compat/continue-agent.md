# continue-agent

Resume an existing sub-agent, preserving accumulated context where the harness supports it.

## Inputs

- **agent_id** — Harness-assigned identifier for the agent to resume (harness-specific; may be unavailable on some harnesses)
- **session_index** — Workflow-server `session_index` — included in the prompt so the resumed agent can authenticate every tool call against the server-managed `session.json`
- **prompt** — Updated instructions or continuation context

## Output

- **result** — The resumed agent's next yield or final output

## Procedure

1. Use the harness's resume primitive (see Harness implementations below) with the new prompt; block until the agent yields or completes.

## Harness implementations

| Harness | Invocation |
|---|---|
| claude-code | `Task(resume=<agent_id>)` — preserves the agent's context window. Include `session_index` in the prompt. Never set `run_in_background`. Same primitive across CLI, IDE extensions, and the web app. |
| cursor | Same as claude-code. |
| generic | Apply [spawn-agent](spawn-agent.md) with the `session_index` prepended to the prompt. Full workflow state is read from `session.json` by the server on every authenticated call; the agent rebuilds context from artifacts and tool calls. |

## Rules

### foreground-always

CRITICAL: continue-agent MUST be dispatched as foreground (blocking). Never set `run_in_background`.

### index-in-prompt

ALWAYS include the `session_index` in the prompt. The harness-level resume preserves the context window only — server-side workflow state lives in `session.json`, keyed by the index.

### resume-is-optimisation

Harness-level resume preserves the context window. Useful, not required for correctness — workflows must be correct without it.
