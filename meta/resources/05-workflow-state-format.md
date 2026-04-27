---
id: workflow-state-format
version: 3.0.0
---

# Workflow State File Format

Schema reference for the `workflow-state.toon` file written to `{planning_folder_path}/workflow-state.toon` by the `save_state` MCP tool. Agents do NOT read or write this file directly — they call `save_state` and `restore_state`, which handle serialization, encryption, and schema validation.

## Top-Level (`StateSaveFile`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique save identifier (UUID or prefixed ID) |
| `savedAt` | ISO 8601 | yes | Timestamp of this save |
| `description` | string | no | Human-readable save point description |
| `workflowId` | string | yes | Workflow ID (e.g., `work-package`) |
| `workflowVersion` | string | yes | Workflow version |
| `planningFolder` | string | yes | Absolute path to the planning folder |
| `sessionToken` | string | yes | Opaque HMAC-signed session token. Both orchestrator and worker share this token; session identity is embedded within it. |
| `sessionTokenEncrypted` | boolean | yes | Whether the token is encrypted |
| `state` | object | yes | Nested execution state — see below |

## `state` Object

`currentActivity` is **not** stored here; it is encoded in the opaque `sessionToken` and retrieved via `get_workflow_status`.

| Field | Type | Description |
|-------|------|-------------|
| `stateVersion` | integer | Monotonically increasing sequence number |
| `startedAt` | ISO 8601 | When execution started |
| `updatedAt` | ISO 8601 | Most recent state change |
| `currentStep` | integer | Current step index (1-based) |
| `completedActivities` | string[] | Activity IDs completed in order |
| `skippedActivities` | string[] | Activity IDs skipped |
| `completedSteps` | object | Map of activity ID → completed step indices (1-based) |
| `checkpointResponses` | object | Checkpoint responses keyed by `activityId-checkpointId` |
| `decisionOutcomes` | object | Automated decision branches keyed by `activityId-decisionId` |
| `activeLoops` | array | Stack of executing loops (innermost last) |
| `variables` | object | Current workflow variable values |
| `history` | array | Chronological execution event log |
| `status` | string | `running`, `paused`, `suspended`, `completed`, `aborted`, `error` |
| `triggeredWorkflows` | array | Child workflows triggered from this one |
| `parentWorkflow` | object | Reference to parent workflow (if triggered) |

## Stale Token Handling

On resume, the orchestrator calls `start_session({ session_token: saved_token })`. The server returns one of:

- **Normal**: HMAC verified — payload preserved; agent continues with restored state in memory.
- **`adopted: true`**: HMAC failed (server restarted with a new key) BUT the payload was structurally valid — server re-signed and returned a fresh token; state preserved.
- **`recovered: true`**: HMAC failed AND payload corrupted — server returned a fresh session. State must be reconstructed via `restore_state({ session_token, file_path })` to load variables from this state file.

## Persistence Tools

`save_state` and `restore_state` are MCP tools — refer to the API reference for parameters and return shape. Agents MUST NOT bypass these tools to read or write the state file directly; doing so skips path validation, encryption-flag handling, and schema validation.
