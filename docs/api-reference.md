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
| `get_activity` | `session_token`, `workflow_id`, `activity_id`, `step_manifest?` | Get activity details. Optional manifest validates previous activity's step completion |
| `next_activity` | `session_token`, `workflow_id` | Get possible next activities with transition conditions from current activity (token.act) |
| `get_checkpoint` | `session_token`, `workflow_id`, `activity_id`, `checkpoint_id` | Get checkpoint details |
| `validate_transition` | `session_token`, `workflow_id`, `from_activity`, `to_activity`, `step_manifest?` | Validate transition. Optional manifest validates from_activity's step completion |

### Skill Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_skill` | `session_token`, `workflow_id`, `skill_id` | Get a skill (checks workflow-specific first, then universal) |

### Resource Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_resources` | `session_token`, `workflow_id` | List all resources for a workflow |
| `get_resource` | `session_token`, `workflow_id`, `index` | Get a specific resource by index |

### Discovery Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `discover_resources` | `session_token` | Discover all available resources: workflows, resources, skills |

### State Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `save_state` | `session_token`, `state`, `planning_folder_path`, `description?` | Save workflow state (encrypts session token at rest) |
| `restore_state` | `session_token`, `file_path` | Restore workflow state (decrypts session token) |

## Session Token

The session token is an opaque string returned by `start_session`. It captures the context of each call (workflow, activity, skill) so the server can validate subsequent calls for consistency.

### Lifecycle

1. Call `help` to learn the bootstrap procedure
2. Call `list_workflows` to see available workflows
3. Call `start_session(workflow_id)` to get rules + opaque token
4. Pass `session_token` alongside explicit `workflow_id`/`activity_id` params to every subsequent tool call
5. Use the updated token from `_meta.session_token` in the next call

### Validation

The server validates each call against the token's recorded state. Validation results are returned in `_meta.validation`:

```json
{
  "_meta": {
    "session_token": "<updated-token>",
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
- **HMAC integrity** — token signature is verified on every call (rejects fabricated/tampered tokens)

Warnings do not block execution — the tool still returns its result. They enable agent self-correction.

### Step Completion Manifest

When transitioning between activities, agents can include a `step_manifest` parameter — a structured summary of completed steps from the previous activity:

```json
{
  "step_manifest": [
    { "step_id": "resolve-target", "output": "Target verified at /path" },
    { "step_id": "initialize-target", "output": "Checked out main, pulled latest" }
  ]
}
```

The server validates: all required steps present, correct order, non-empty outputs. Missing manifest triggers a warning. All steps within an activity are required — optionality is handled at the activity level.

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
- **Start**: `list_workflows` → `start_session` → `get_workflow` → `list_resources`
- **Per-activity**: `get_activity` → `get_checkpoint` → `get_resource`
- **Transitions**: `validate_transition`

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
