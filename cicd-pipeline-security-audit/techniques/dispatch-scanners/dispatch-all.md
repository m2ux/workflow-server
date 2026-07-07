---
metadata:
  version: 1.1.0
---

## Capability

Compose a sub-agent prompt for every scanner in the roster and dispatch all per-submodule scanner agents concurrently in a single batch.

## Outputs

### dispatched_scanners

The set of scanner agents handed off in the concurrent dispatch batch.

## Protocol

### 1. Compose Scanner Prompts

- For each agent in the `{scanner_assignments}` roster, build a sub-agent prompt collected as `{$scanner_prompts}` carrying: (1) workflow-server bootstrap instructions — `start_session(session_token, agent_id)` to inherit the dispatched session, then `next_activity({ activity_id: 'sub-workflow-scan' })`, then follow the activity steps sequentially; (2) context — the submodule path, its workflow file list, the scanner designator (`S1`-`Sn`), `{planning_folder_path}`, and the slice of `{workflow_inventory}` for the assigned submodule; (3) the output-format requirement — write structured output to the [scanner output file](../../resources/sub-agent-output-schema.md#file-naming-convention) conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema).

### 2. Dispatch Scanners

- Dispatch every scanner in the roster through [harness-compat](../../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-concurrent](../../../meta/techniques/harness-compat/spawn-concurrent.md)(agents: `{scanner_prompts}`), capturing the dispatched set as `{dispatched_scanners}`.
