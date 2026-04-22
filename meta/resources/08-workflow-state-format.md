---
id: workflow-state-format
version: 2.0.0
---

# Workflow State File Format

The `workflow-state.json` file persists workflow execution state to disk, enabling session resume across conversations. It is written to `{planning_folder_path}/workflow-state.json`.

## Top-Level Structure (stateSaveFile)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique save identifier (UUID or prefixed ID) |
| `savedAt` | ISO 8601 | yes | Timestamp of this save |
| `description` | string | no | Human-readable save point description |
| `workflowId` | string | yes | Workflow ID (e.g., `work-package`) |
| `workflowVersion` | string | yes | Workflow version |
| `planningFolder` | string | yes | Absolute path to the planning folder |
| `sessionToken` | string | yes | Unified session token (opaque HMAC-signed string) for the target workflow. Both orchestrator and worker share this token. The session identity is embedded within the token. |
| `sessionTokenEncrypted` | boolean | yes | Whether the token is encrypted |
| `state` | object | yes | Full nested execution state |

## State Object

Note: `currentActivity` is NOT stored in this state object or at the top level. It is securely encoded within the opaque `sessionToken` and should be retrieved via `get_workflow_status`. (`workflowId` and `workflowVersion` are stored at the top level for discovery purposes, but not inside this nested `state` object).

| Field | Type | Description |
|-------|------|-------------|
| `stateVersion` | integer | Monotonically increasing sequence number |
| `startedAt` | ISO 8601 | When execution started |
| `updatedAt` | ISO 8601 | Most recent state change |
| `currentStep` | integer | Current step index (1-based) |
| `completedActivities` | string[] | Activity IDs completed in order |
| `skippedActivities` | string[] | Activity IDs skipped |
| `completedSteps` | object | Map of activity ID to completed step indices (1-based) |
| `checkpointResponses` | object | Checkpoint responses keyed by `activityId-checkpointId` |
| `decisionOutcomes` | object | Automated decision branches keyed by `activityId-decisionId` |
| `activeLoops` | array | Stack of executing loops (innermost last) |
| `variables` | object | Current workflow variable values |
| `history` | array | Chronological execution event log |
| `status` | string | `running`, `paused`, `suspended`, `completed`, `aborted`, `error` |
| `triggeredWorkflows` | array | Child workflows triggered from this one |
| `parentWorkflow` | object | Reference to parent workflow (if triggered) |

## Worker Token-Persist Pattern

After completing all steps and writing artifacts, the activity worker persists its current session token via a read-modify-write cycle. This ensures the most recent token is on disk even if the orchestrator layer fails before its own persist step.

### Procedure

1. **Read** the existing `{planning_folder_path}/workflow-state.json` using file tools.
2. **If the file does not exist**, skip silently. The orchestrator creates the file on first persist.
3. **Update** these fields on the parsed object:
   - `sessionToken` — set to the worker's current `session_token`
   - `savedAt` — set to the current ISO 8601 timestamp
   - `description` — set to `"State after {activity_id}"`
   - `state.updatedAt` — set to the current ISO 8601 timestamp
   - `state.stateVersion` — increment by 1
   - `state.completedSteps[{activity_id}]` — set to the array of completed step indices
4. **Write** the updated JSON back to the same path.

### Constraints

- **Read before write.** Never overwrite with a partial state — always merge into the existing file.
- **Token is opaque.** NEVER parse, decode, or modify the session token string. The session identity is embedded within the token — there is no separate `session_id` field.
- **Preserve unmodified fields.** Only touch the fields listed above; leave everything else unchanged.
- **No file creation.** Workers do not create the state file — they only update an existing one.

## Example

```json
{
  "id": "save-a1b2c3d4",
  "savedAt": "2026-04-14T12:34:56Z",
  "description": "State after analyze-codebase",
  "workflowId": "work-package",
  "workflowVersion": "1.2.0",
  "planningFolder": "/path/to/.engineering/artifacts/planning/2026-04-14-feature-xyz",
  "sessionToken": "eyJ3Zi...<opaque-unified-token>...signature",
  "sessionTokenEncrypted": false,
  "state": {
    "stateVersion": 5,
    "startedAt": "2026-04-14T12:00:00Z",
    "updatedAt": "2026-04-14T12:34:56Z",
    "completedActivities": ["discover-session", "dispatch-workflow"],
    "skippedActivities": [],
    "completedSteps": {
      "discover-session": [1, 2, 3, 4],
      "dispatch-workflow": [1, 2],
      "analyze-codebase": [1, 2, 3]
    },
    "checkpointResponses": {},
    "decisionOutcomes": {},
    "activeLoops": [],
    "variables": {
      "planning_folder_path": "/path/to/.engineering/artifacts/planning/2026-04-14-feature-xyz",
      "target_path": "midnight-node"
    },
    "history": [],
    "status": "running",
    "triggeredWorkflows": []
  }
}
```

## Stale Session Detection

On resume, call `start_session({ session_token: saved_token, agent_id })`. If the server restarted, it will either re-sign and adopt the session (returning `adopted: true`) or return `recovered: true` with a fresh session. In the latter case, reconstruct state from saved variables and `completedActivities` by calling `start_session({ workflow_id, agent_id })` then transitioning via `next_activity`.
