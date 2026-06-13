---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 4
  legacy_id: 4
---

## Capability

Compose and concurrently dispatch per-submodule scanner sub-agents — each receiving its assigned submodule path, workflow file list, workflow inventory classification data, and injection pattern catalog — then dispatch the verification (V) and merge (M) coordination agents after scanner results are collected.

## Inputs

### scanner_assignments

[Agent-to-submodule mapping](../resources/intermediate-artifact-schemas.md#scanner-assignments) for the scanner roster.

### workflow_inventory

Complete [inventory of workflow files](../resources/intermediate-artifact-schemas.md#workflow-inventory) with per-workflow trigger, permission, and checkout classification data.

### scanners_assigned

Count of scanner agents in the roster.

## Protocol

### 1. Compose Scanner Prompts

- For each agent in the `{scanner_assignments}` roster, build a sub-agent prompt collected as `{$scanner_prompts}` carrying: (1) workflow-server bootstrap instructions — `start_session(session_token, agent_id)` to inherit the dispatched session, then `next_activity({ activity_id: 'sub-workflow-scan' })`, then follow the activity steps sequentially; (2) context — the submodule path, its workflow file list, the scanner designator (`S1`-`Sn`), `{planning_folder_path}`, and the slice of `{workflow_inventory}` for the assigned submodule; (3) the output-format requirement — write structured output to the [scanner output file](../resources/sub-agent-output-schema.md#file-naming-convention) conforming to the [output schema](../resources/sub-agent-output-schema.md#schema).

### 2. Dispatch Scanners

- Dispatch every scanner in the roster through [harness-compat](../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-concurrent](../../meta/techniques/harness-compat/spawn-concurrent.md)(agents: `{scanner_prompts}`), capturing the dispatched set as `{$dispatched_scanners}`.

### 3. Collect Results

- Wait for all scanners to return and collect each one's structured output.  
  > If a scanner fails or times out, record the failure and proceed with the available results.

### 4. Verify Dispatch Completeness

- Compare the `{scanner_assignments}` roster against `{dispatched_scanners}` and assemble `{dispatch_status}`: a dispatch manifest (scanner id, assigned submodule, dispatched, returned, status) plus the `{dispatch_status.scanners_dispatched}` and `{dispatch_status.scanners_returned}` counts.
- Confirm `{dispatch_status.scanners_dispatched}` equals `{scanners_assigned}`.  
  > If any roster scanner was not dispatched, flag `{dispatch_status}` as incomplete and return the manifest for re-dispatch.

### 5. Dispatch Verification

- Compose the V agent context `{$verification_prompt}` — all scanner output file paths, the `{workflow_inventory}`, and bootstrap instructions (`start_session(session_token, agent_id)`, then `next_activity({ activity_id: 'sub-verification' })`) — and dispatch it through [harness-compat](../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../meta/techniques/harness-compat/spawn-agent.md)(prompt: `{verification_prompt}`).

### 6. Dispatch Merge

- Compose the M agent context `{$merge_prompt}` — all scanner output file paths, the verification report, the [severity rubric](../resources/cicd-severity-rubric.md#severity-matrix), and bootstrap instructions (`start_session(session_token, agent_id)`, then `next_activity({ activity_id: 'sub-merge' })`) — and dispatch it through [harness-compat](../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../meta/techniques/harness-compat/spawn-agent.md)(prompt: `{merge_prompt}`).

## Outputs

### dispatch_status

Dispatch and collection status for all agents.

#### scanners_dispatched

Count of dispatched scanner agents.

#### scanners_returned

Count of returned scanner agents.

#### verification_dispatched

Whether V was dispatched.

#### merge_dispatched

Whether M was dispatched.
