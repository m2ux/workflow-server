---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 7
  legacy_id: 7
---

# Harness Compat

## Capability

Abstract sub-agent dispatch operations — harness-independent vocabulary for spawning, continuing, and concurrently dispatching agents.

## Inputs

### harness

Identifier of the harness in use: `claude-code`, `cursor`, `cline`, or `generic`

## Rules

### harness-independence

All techniques and activities MUST reference operation names from this technique ([spawn-agent](./spawn-agent.md), [continue-agent](./continue-agent.md), [spawn-concurrent](./spawn-concurrent.md)) rather than harness-specific tool syntax. Each operation takes the current `harness` as an input and branches inline in its procedure — harness-specific invocations are encoded only here, not duplicated into caller protocols.

### foreground-always

CRITICAL: every dispatch operation in this technique MUST be foreground (blocking). Never set `run_in_background`. Background dispatch silently breaks checkpoint delivery — the orchestrator never sees the worker's `<checkpoint_yield>`.

### index-in-prompt

When a dispatched agent inherits a workflow session, ALWAYS include the `session-index` in its prompt. Server-managed `session.json` holds the workflow state, keyed by the index; the harness context window (where preserved) never carries that state.
