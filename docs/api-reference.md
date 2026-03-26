# API Reference

## MCP Tools

### Bootstrap Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `help` | - | How to use this server. Returns bootstrap procedure and session protocol |
| `list_workflows` | - | List all available workflow definitions |
| `start_session` | `workflow_id` | Start a workflow session. Returns agent rules, workflow metadata, and opaque session token |
| `health_check` | - | Check server health and available workflows |

### Workflow Tools

All workflow tools require `session_token` and explicit `workflow_id`. Each response includes an updated token and validation result in `_meta`.

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_workflow` | `session_token`, `workflow_id`, `summary?` | Get workflow definition. Use `summary=true` for lightweight metadata |
| `next_activity` | `session_token`, `workflow_id`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | Transition to an activity. Validates the transition, step manifest, and activity manifest. Returns activity details, updated token, and a trace token in `_meta.trace_token` |
| `get_activities` | `session_token`, `workflow_id` | Get possible next activities with transition conditions from current activity (token.act) |
| `get_checkpoint` | `session_token`, `workflow_id`, `activity_id`, `checkpoint_id` | Get checkpoint details |

### Skill Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_skills` | `session_token`, `workflow_id`, `activity_id` | Get all skills and resources for an activity. Resources returned as structured array `[{index, id, version, content}]` |
| `get_skill` | `session_token`, `workflow_id`, `skill_id` | Get a single skill with resources. Response: `{skill, resources: [{index, id, version, content}]}` |

### Trace Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_trace` | `session_token`, `trace_tokens?` | Resolve accumulated trace tokens into full event data. Without tokens, returns the in-memory trace for the current session |

### State Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `save_state` | `session_token`, `state`, `planning_folder_path`, `description?` | Save workflow state (encrypts session token at rest) |
| `restore_state` | `session_token`, `file_path` | Restore workflow state (decrypts session token) |

## Session Token

The session token is an opaque string returned by `start_session`. It captures the context of each call (workflow, activity, skill) so the server can validate subsequent calls for consistency.

The token payload carries: `wf` (workflow ID), `act` (current activity), `skill` (last loaded skill), `cond` (last transition condition), `v` (workflow version), `seq` (sequence counter), `ts` (creation timestamp), `sid` (session UUID), and `aid` (agent ID).

### Lifecycle

1. Call `help` to learn the bootstrap procedure
2. Call `list_workflows` to see available workflows
3. Call `start_session(workflow_id)` to get rules + opaque token
4. Pass `session_token` alongside explicit `workflow_id`/`activity_id` params to every subsequent tool call
5. Use the updated token from `_meta.session_token` in the next call
6. Accumulate `_meta.trace_token` from each `next_activity` call for post-execution trace resolution

### Validation

The server validates each call against the token's recorded state. Validation results are returned in `_meta.validation`:

```json
{
  "_meta": {
    "session_token": "<updated-token>",
    "trace_token": "<trace-token (on next_activity only)>",
    "validation": {
      "status": "valid",
      "warnings": []
    }
  }
}
```

Validation checks:
- **Workflow consistency** — the token's workflow matches the explicit `workflow_id`
- **Activity transition** — the requested activity is a valid transition from the token's last activity
- **Skill association** — the requested skill is declared by the current activity
- **Version drift** — the workflow version hasn't changed since the session started
- **Step completion** — when `step_manifest` is provided, validates all steps present, in order, with outputs
- **Activity manifest** — when `activity_manifest` is provided, validates activity IDs exist in the workflow (advisory)
- **HMAC integrity** — token signature is verified on every call (rejects fabricated/tampered tokens)

Warnings do not block execution — the tool still returns its result. They enable agent self-correction. All validation warnings are captured in the execution trace.

### Step Completion Manifest

When transitioning between activities via `next_activity`, agents include a `step_manifest` parameter — a structured summary of completed steps from the previous activity:

```json
{
  "step_manifest": [
    { "step_id": "resolve-target", "output": "Target verified at /path" },
    { "step_id": "initialize-target", "output": "Checked out main, pulled latest" }
  ]
}
```

The server validates: all required steps present, correct order, non-empty outputs. Missing manifest triggers a warning. All steps within an activity are required — optionality is handled at the activity level.

### Activity Manifest

When transitioning between activities via `next_activity`, agents can include an `activity_manifest` parameter — a structured summary of activities completed so far:

```json
{
  "activity_manifest": [
    { "activity_id": "start-work-package", "outcome": "completed", "transition_condition": "default" },
    { "activity_id": "design-philosophy", "outcome": "completed", "transition_condition": "skip_optional_activities == true" }
  ]
}
```

Validation is advisory — the server warns on unknown activity IDs or empty outcomes but does not reject the call.

### Trace Tokens

Each `next_activity` call returns an HMAC-signed trace token in `_meta.trace_token`. The token contains the mechanical trace (tool calls, timing, validation warnings) for the activity just completed. Agents accumulate these opaque tokens and resolve them via `get_trace` for post-execution analysis. See [Workflow Fidelity](workflow-fidelity.md) for details.

### Token-exempt tools

- `help`, `list_workflows`, `start_session`, `health_check`

## Skills

Skills provide structured guidance for agents to consistently execute workflows.

### Skill Resolution

When calling `get_skill { workflow_id, skill_id }`:
1. First checks `{workflow_id}/skills/{NN}-{skill_id}.toon`
2. Falls back to `meta/skills/{NN}-{skill_id}.toon` (universal)

### Key Skills

#### workflow-execution (universal)

Primary skill for workflow navigation:
- **Start**: `list_workflows` → `start_session` → `get_workflow`
- **Per-activity**: `next_activity` → `get_skills` (includes skills + resources) → `get_checkpoint`
- **Transitions**: `get_activities` (query options) → `next_activity` (commit transition)

#### activity-resolution (universal)

Bootstrap skill for agent initialization:
- **Bootstrap**: `help` → `list_workflows` → `start_session`
- **Skill loading**: `get_skill`

## Available Workflows

| Workflow | Activities | Description |
|----------|------------|-------------|
| `meta` | 3 | Bootstrap workflow - independent activities for workflow lifecycle |
| `work-package` | 14 | Single work package from issue to merged PR |
| `work-packages` | 7 | Plan and coordinate multiple related work packages |
