# API Reference

## MCP Tools

### Bootstrap Tools

No session token required.

| Tool | Parameters | Description |
|------|------------|-------------|
| `discover` | - | Entry point. Returns server name, version, available workflows, and the bootstrap procedure |
| `list_workflows` | - | List all available workflow definitions with full metadata |
| `health_check` | - | Server health, version, workflow count, and uptime |

### Session Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `start_session` | `workflow_id` | Start a new workflow session. Returns a session token and basic workflow metadata (id, version, title, description). Does not return the activity list — use `get_workflow` for that |

### Workflow Tools

All require `session_token`. The workflow is determined from the session token (set at `start_session`). Each response includes an updated token and validation result in `_meta`.

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_workflow` | `session_token`, `summary?` | Load the workflow definition for the current session. `summary=true` (default) returns rules, variables, execution model, `initialActivity`, and activity stubs. `summary=false` returns the full definition |
| `next_activity` | `session_token`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | Load and transition to an activity. Returns the complete activity definition (steps, checkpoints, transitions, mode overrides, rules, skill references). Also returns a trace token in `_meta.trace_token` |
| `get_checkpoint` | `session_token`, `activity_id`, `checkpoint_id` | Load full checkpoint details (message, options with effects, blocking/auto-advance config) for presentation |

### Skill Tools

All require `session_token`. The workflow is determined from the session token.

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_skills` | `session_token` | Load all workflow-level skills (behavioral protocols). Returns a map of skill objects with `_resources` containing lightweight references (index, id, version — no content) |
| `get_skill` | `session_token`, `skill_id` | Load a single skill by ID with `_resources` references |
| `get_step_skill` | `session_token`, `step_id` | Load the skill for a specific step within the current activity. Requires `next_activity` to have been called first |
| `get_resource` | `session_token`, `resource_index` | Load a resource's full content by index. Bare indices resolve within the session workflow; prefixed refs (e.g., `meta/04`) resolve from the named workflow |

### Trace Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_trace` | `session_token`, `trace_tokens?` | Resolve accumulated trace tokens into full event data. Without tokens, returns the in-memory trace for the current session |

### State Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `save_state` | `session_token`, `state`, `planning_folder_path`, `description?` | Save workflow execution state to a TOON file (encrypts session token at rest) |
| `restore_state` | `session_token`, `file_path` | Restore workflow state from a saved file (decrypts session token) |

## Session Token

The session token is an opaque string returned by `start_session`. It captures the context of each call (workflow, activity, skill) so the server can validate subsequent calls for consistency.

The token payload carries: `wf` (workflow ID), `act` (current activity), `skill` (last loaded skill), `cond` (last transition condition), `v` (workflow version), `seq` (sequence counter), `ts` (creation timestamp), `sid` (session UUID), and `aid` (agent ID).

### Lifecycle

1. Call `discover` to learn the bootstrap procedure and available workflows
2. Call `list_workflows` to match the user's goal to a workflow
3. Call `start_session(workflow_id)` to get a session token (workflow is bound to the session from this point)
4. Call `get_skills` to load behavioral protocols
5. Call `get_workflow(summary=true)` to get the activity list and `initialActivity`
6. Call `next_activity(initialActivity)` to load the first activity
7. For each step with a skill, call `get_step_skill(step_id)` then `get_resource` for each `_resources` entry
8. Read `transitions` from the activity response; call `next_activity` with a `step_manifest` to advance
9. Accumulate `_meta.trace_token` from each `next_activity` call for post-execution trace resolution

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
- **Activity transition** — the requested activity is a valid transition from the token's last activity
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

- `discover`, `list_workflows`, `start_session`, `health_check`

## Skills

Skills provide structured guidance for agents to consistently execute workflows.

### Skill Resolution

When calling `get_skill { skill_id }` or `get_step_skill { step_id }`:
1. First checks `{workflow}/skills/{NN}-{skill_id}.toon` (using the session's workflow)
2. Falls back to `meta/skills/{NN}-{skill_id}.toon` (universal)

### Key Skills

#### session-protocol (universal)

Session lifecycle protocol:
- **Bootstrap**: `start_session(workflow_id)` → `get_skills` → `get_workflow` → `next_activity(initialActivity)`
- **Per-step**: `get_step_skill(step_id)` → `get_resource(resource_index)` for each `_resources` entry
- **Transitions**: Read `transitions` from activity response → `next_activity(activity_id)` with `step_manifest`

#### execute-activity (universal)

Activity execution protocol for workers:
- **Goal resolution**: `discover` → `list_workflows` → match user goal
- **Bootstrap**: `start_session` → `get_skills` → `next_activity`
- **Execution**: Steps → checkpoints (yield to orchestrator) → artifacts → structured result

#### orchestrator-management / worker-management (universal)

Consolidated role-based skills for the orchestrator (top-level agent) and worker (sub-agent). The orchestrator manages workflow lifecycle, dispatches workers, and presents checkpoints. The worker self-bootstraps, executes steps, and reports structured results.
