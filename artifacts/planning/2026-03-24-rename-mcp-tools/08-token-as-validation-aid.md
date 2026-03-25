# Token as Validation Aid

## Design Shift

**Before**: Token encodes workflow context so tools don't need explicit params (parameter carrier)
**After**: Tools accept explicit params again. Token captures the *previous* call's state so the server can validate the *current* call (validation aid)

## Token Payload

```
{ wf, act, skill, seq, ts }
```

- `wf` — workflow_id of the last call
- `act` — activity_id of the last call
- `skill` — skill_id of the last call (if applicable)
- `seq` — monotonic counter
- `ts` — session creation timestamp

After each tool call, the token is updated with that call's context and returned via `_meta.session_token`.

## Validation Cases

### 1. Workflow Consistency

**Tool**: Any tool accepting `workflow_id`
**Check**: `token.wf === workflow_id`
**Detects**: Agent switched workflows mid-session without starting a new session
**Response**: Warning or error — agent should call `start_session` for the new workflow

### 2. Activity Transition Validity

**Tool**: `get_activity(workflow_id, activity_id)`
**Check**: Validate that a transition from `token.act` to `activity_id` exists in the workflow's transition table
**Detects**: Agent skipped activities or jumped to an unreachable activity
**Response**: Error with valid transitions listed from `token.act`

### 3. Skill-Activity Association

**Tool**: `get_skill(workflow_id, skill_id)`
**Check**: Validate that `skill_id` is listed in the current activity's `skills.primary` or `skills.supporting[]`
**Detects**: Agent loading a skill that doesn't belong to the current activity
**Response**: Warning with the activity's declared skills listed

### 4. Checkpoint-Activity Association

**Tool**: `get_checkpoint(workflow_id, activity_id, checkpoint_id)`
**Check**: Validate that `checkpoint_id` exists in the specified activity's checkpoints
**Detects**: Agent requesting a checkpoint from the wrong activity
**Response**: Error with valid checkpoint IDs for the activity

### 5. Resource-Workflow Association

**Tool**: `get_resource(workflow_id, index)`
**Check**: Validate that the resource index exists for the specified workflow
**Detects**: Agent requesting a resource that doesn't exist for this workflow
**Response**: Error with valid resource indices (already happens implicitly via loader)

### 6. Sequential Consistency

**Tool**: Any tool receiving `session_token`
**Check**: `token.seq` increments monotonically. Server tracks expected seq in-memory per session.
**Detects**: Replayed or stale tokens
**Response**: Warning — the agent may have lost track of the current token

### 7. Workflow Version Drift

**Tool**: Any tool loading a workflow
**Check**: `token.v` matches the version in the workflow file on disk
**Detects**: Workflow definition changed since the session started (mid-session update)
**Response**: Warning — agent may be working with stale workflow understanding

### 8. First-Call Validation

**Tool**: Any tool (when `token.seq === 0`)
**Check**: For a fresh session, the first call should be `get_workflow` or `get_activity` — not `get_checkpoint` or `get_resource`
**Detects**: Agent skipping bootstrap steps
**Response**: Warning suggesting the agent follow the bootstrap sequence

## Tool Parameter Changes

Tools revert to accepting explicit params alongside the token:

| Tool | Params |
|------|--------|
| `get_workflow` | `session_token`, `workflow_id` |
| `get_activity` | `session_token`, `workflow_id`, `activity_id` |
| `get_checkpoint` | `session_token`, `workflow_id`, `activity_id`, `checkpoint_id` |
| `validate_transition` | `session_token`, `workflow_id`, `from_activity`, `to_activity` |
| `get_skill` | `session_token`, `workflow_id`, `skill_id` |
| `list_resources` | `session_token`, `workflow_id` |
| `get_resource` | `session_token`, `workflow_id`, `index` |
| `discover_resources` | `session_token` |
| `save_state` | `session_token`, `state`, `planning_folder_path`, `description?` |
| `restore_state` | `session_token`, `file_path` |

## Validation Response Shape

Validation results are included in the `_meta` alongside the updated token:

```json
{
  "content": [{ "type": "text", "text": "..." }],
  "_meta": {
    "session_token": "<updated-token>",
    "validation": {
      "status": "valid",
      "warnings": []
    }
  }
}
```

When validation fails:

```json
{
  "_meta": {
    "session_token": "<updated-token>",
    "validation": {
      "status": "warning",
      "warnings": [
        "Activity transition from 'start-work-package' to 'implement' is not a direct transition. Valid transitions: ['design-philosophy']"
      ]
    }
  }
}
```

Warnings don't block execution — the tool still returns its result. This lets the agent self-correct rather than being hard-blocked. Critical violations (e.g., workflow_id mismatch) could optionally be errors.
