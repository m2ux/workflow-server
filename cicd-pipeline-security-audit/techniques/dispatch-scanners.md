---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Compose and concurrently dispatch per-submodule scanner sub-agents — each receiving its assigned submodule path, workflow file list, reconnaissance data, and injection pattern catalog — then dispatch the verification (V) and merge (M) coordination agents after scanner results are collected.

## Inputs

### scanner-assignments

[Agent-to-submodule mapping](../resources/intermediate-artifact-schemas.md#scanner-assignments) for the scanner roster

### reconnaissance-data

Per-workflow trigger, permission, and checkout classification data

## Protocol

### 1. Compose Scanner Prompts

- For each agent in the roster from the `scanner-assignments` mapping, build a sub-agent prompt (spawn-agent operation, harness-compat technique) — collected as `{$scanner-prompts}` — containing: (1) workflow-server bootstrap instructions — 'call start_session(session_token, agent_id) to inherit the dispatched session, then call next_activity({ activity_id: <assigned-activity-id> }), follow the activity steps sequentially'; (2) context variables — submodule path, workflow file list, scanner designator (S1-Sn), planning_folder_path, and the slice of `reconnaissance-data` for the assigned submodule; (3) output format requirement — 'write structured output to s{n}-{submodule}.json conforming to the output schema in [sub-agent-output-schema](../resources/sub-agent-output-schema.md)'

### 2. Dispatch Scanners

- Dispatch all scanner agents in the roster using harness-compat::spawn-concurrent with the `{$scanner-prompts}` from step 1, forming `{$dispatched-scanners}`.
- All scanner agents MUST be dispatched in a single batch

### 3. Collect Results

- Wait for all scanners to return. Collect structured output from each. If any scanner fails or times out, record the failure and proceed with available results.

### 4. Verify Dispatch Completeness

- Compare the scanner roster from `scanner-assignments` against `{$dispatched-scanners}`. Every scanner in the roster must have been dispatched and returned a result. Record the `dispatch-status`: a dispatch manifest table (scanner_id, assigned_submodule, dispatched (yes/no), returned (yes/no), status) plus the {scanners_dispatched} and {scanners_returned} counts. If any scanner was NOT dispatched, flag as INCOMPLETE and return the manifest for re-dispatch.
- Verify {scanners_dispatched} equals scanners_assigned before proceeding

### 5. Dispatch Verification

- After all scanners return and dispatch completeness verified, compose V agent context with: all scanner output file paths, the workflow file inventory from scope-setup, and bootstrap instructions — 'call start_session(session_token, agent_id) to inherit the dispatched session, then call next_activity({ activity_id: sub-verification })'. Dispatch V agent using harness-compat::spawn-agent.

### 6. Dispatch Merge

- After V returns, compose M agent context with: all scanner output file paths, the verification report, severity rubric ([cicd-severity-rubric](../resources/cicd-severity-rubric.md)), and bootstrap instructions — 'call start_session(session_token, agent_id) to inherit the dispatched session, then call next_activity({ activity_id: sub-merge })'. Dispatch M agent using harness-compat::spawn-agent.

## Outputs

### dispatch-status

Dispatch and collection status for all agents

#### scanners_dispatched

Count of dispatched scanner agents

#### scanners_returned

Count of returned scanner agents

#### verification_dispatched

Whether V was dispatched

#### merge_dispatched

Whether M was dispatched
