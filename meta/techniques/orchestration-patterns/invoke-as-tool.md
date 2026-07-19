---
metadata:
  version: 1.0.0
---

## Capability

Run one bounded sub-agent behind a function-shaped boundary: the caller supplies a task and receives only `{tool_result}` — never the sub-agent's intermediate turns (agent-as-tool embedding).

## Inputs

### task

Self-contained task string for the sub-agent.

### description

*(optional)* Short label for tracing.

### output_contract

*(optional)* Required return shape or artifact instructions.

### session_index

*(optional)* Include when the sub-agent must authenticate to workflow-server.

## Outputs

### tool_result

Structured or textual return value only. Intermediate tool calls and reasoning from the sub-agent do not land in the parent bag.

## Protocol

1. Build a prompt from `{task}`, `{output_contract}`, and `{session_index}` when present — instruct the agent to return only the final result matching the contract.
2. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with that prompt (and `{description}` when set).
3. Capture the agent's final output as `{tool_result}`. Discard intermediate transcript from the parent bag.
