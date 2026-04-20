# API Reference

## MCP Tools

### Bootstrap Tools

No session token required.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `discover` | - | Server info and `discovery` instructions | Entry point for the workflow server. Returns the server name, version, and the bootstrap procedure an agent should follow. The `discovery` instructions describe how to call `list_workflows` and `start_session` to begin a session. |
| `list_workflows` | - | Array of workflow definitions (each with `id`, `title`, `version`, and `tags`) | Lists all available workflow definitions. Each entry in the returned array contains an `id` (unique workflow identifier), `title` (human-readable name), `version` (semver string), and `tags` (array of categorization strings for matching a user's goal to a workflow). |
| `health_check` | - | Server status and stats | Returns the server health status. The response includes the server version, the number of workflows available, and the server uptime. |

### Session Tools

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `start_session` | `agent_id`, `session_token?` | `session_token`, workflow info, `inherited` flag, and optionally `adopted`/`recovered` flags | Starts a new session or inherits an existing one. **Fresh sessions default to the `meta` workflow** (the bootstrap orchestration workflow) — no `workflow_id` parameter is needed. To start a session for a different workflow, use `dispatch_workflow`. `agent_id` sets the `aid` field inside the HMAC-signed token, distinguishing orchestrator from worker calls in the trace. The optional `session_token` parameter, when provided, causes the returned token to inherit all state (`sid`, `act`, `bcp`, `cond`, `v`) from the parent token while stamping the new `agent_id` into `aid`. The workflow is derived from the token's embedded `wf` field — there is no `workflow_id` parameter to mismatch. The returned `session_token` is required for all subsequent tool calls. The session identity is embedded in the token — there is no separate `session_id` return field. The `inherited` flag is `true` when a parent token was provided and its HMAC was valid. **Token adoption on server restart:** If the provided `session_token` fails HMAC verification (e.g., the server was restarted and generated a new signing key), the server attempts to decode the payload without signature verification. If the payload is structurally valid, the server re-signs it with the current key and returns `adopted: true` with a `warning` — the session state (ID, activity position) is preserved. If the payload is also corrupted, the server falls back to a fresh `meta` session and returns `recovered: true` with a `warning` — the previous session state was NOT inherited and must be reconstructed from `workflow-state.json`. |
| `dispatch_workflow` | `workflow_id`, `parent_session_token`, `variables?` | `client_session_token`, workflow metadata, `initial_activity`, and a pre-composed `client_prompt` | Creates a client session for a target workflow and returns a dispatch package for a sub-agent. `workflow_id` identifies the child workflow to start. `parent_session_token` is the orchestrator's session token, used to link the client session back to the parent. The optional `variables` parameter sets initial state variables in the client session. The returned `client_session_token` is an independent token for the child workflow — it embeds the session identity (`sid`) and parent reference (`psid`) within the token itself. `initial_activity` names the first activity the sub-agent should execute. `client_prompt` is a pre-composed prompt string to pass directly to the sub-agent. |
| `get_workflow_status` | `client_session_token` | `status` (active/blocked/completed), `current_activity`, `completed_activities`, `last_checkpoint` info, `session_token`, and variables | Checks the status of a dispatched client workflow session. `client_session_token` authenticates the query and determines the session. The returned `status` is one of `active`, `blocked`, or `completed`. `current_activity` names the activity the sub-agent is executing. `completed_activities` lists all finished activities. `last_checkpoint` contains the most recent checkpoint details. `variables` reflects the current workflow state. |

### Workflow Tools

All require `session_token`. The workflow is determined from the session token (set at `start_session`). Each response includes an updated token and validation result in `_meta`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_token`, `summary?` | Primary skill (raw TOON), then complete workflow definition or summary metadata | Loads the workflow definition for the current session. The response begins with the workflow's primary skill as raw TOON, followed by a `---` separator, then the workflow data. `session_token` authenticates the call and determines which workflow to return. The optional `summary` parameter controls the response detail level. When `summary=true` (default), the workflow portion contains rules, variables, orchestration model, `initialActivity`, and activity stubs (steps and checkpoints omitted). When `summary=false`, the workflow portion contains the full definition including all steps, checkpoints, and raw TOON fields such as `skills`, `modes`, and `tags`. The primary skill at the beginning of the response gives the agent immediate access to the workflow's orchestration protocol without a separate `get_skill` call. |
| `next_activity` | `session_token`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | `activity_id`, `name`, updated `session_token`, and trace token in `_meta` | Transitions from the current activity to the next activity in the workflow. This is the orchestrator's tool — it validates the transition, advances the session token, and records the trace, but does NOT return the activity definition. `session_token` authenticates the call and carries the prior activity state used to validate the transition. `activity_id` is the next activity to transition to — for the first call, use the `initialActivity` value from `get_workflow`; for subsequent calls, use an activity ID from the `transitions` field of the current activity's response. The optional `transition_condition` records the condition that triggered this transition, enabling server-side validation of condition-activity consistency. The optional `step_manifest` provides a structured summary of completed steps from the previous activity, validated for completeness and order. The optional `activity_manifest` provides an advisory summary of all completed activities. The returned `activity_id` and `name` confirm the transition target. A `trace_token` in `_meta` captures the mechanical trace for the completed activity. After calling `next_activity`, the worker should call `get_activity` to load the complete activity definition. |
| `get_activity` | `session_token` | Complete activity definition | Loads the complete activity definition for the current activity in the session. This is the worker's tool — call it after the orchestrator has called `next_activity` to transition. `session_token` authenticates the call and determines the current activity from the token's `act` field (no `activity_id` parameter is needed). The returned activity definition includes all steps, checkpoints, loops, transitions to subsequent activities, mode overrides, rules, and skill references — everything needed to execute the activity. |
| `yield_checkpoint` | `session_token`, `checkpoint_id` | Status, `checkpoint_handle`, and instructions | Yields execution to the orchestrator at a checkpoint step. `session_token` authenticates the call and must have an active activity. `checkpoint_id` identifies the checkpoint to yield (must match a checkpoint defined in the current activity). The returned `checkpoint_handle` is an opaque string the worker must yield to the orchestrator via a `<checkpoint_yield>` block. The status confirms the yield was recorded. The instructions describe the next steps for the worker. |
| `resume_checkpoint` | `session_token` | Status and instructions | Resumes execution after the orchestrator resolves a checkpoint. `session_token` authenticates the call and must reference a resolved checkpoint. The server validates that the checkpoint was resolved before allowing execution to continue. The returned status confirms the checkpoint is cleared and the token sequence is advanced. |
| `present_checkpoint` | `checkpoint_handle` | Full checkpoint definition | Used by the orchestrator to load full checkpoint details from a worker's yielded `checkpoint_handle`. `checkpoint_handle` is the opaque string returned by `yield_checkpoint`. The returned checkpoint definition includes the message to present to the user, available options with their effects, and blocking/auto-advance configuration. |
| `respond_checkpoint` | `checkpoint_handle`, `option_id?`, `auto_advance?`, `condition_not_met?` | Resolution status and any defined `effect` | Used by the orchestrator to resolve a yielded checkpoint. `checkpoint_handle` is the opaque string from `yield_checkpoint`. Exactly one resolution mode must be provided: `option_id` records the user's selected option (validated against the checkpoint definition, with a minimum response time enforced), `auto_advance` uses the checkpoint's `defaultOption` (only valid for non-blocking checkpoints after `autoAdvanceMs` elapses), or `condition_not_met` dismisses a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a `condition` field). The returned `effect` contains any state changes defined by the selected option (`setVariable`, `transitionTo`, `skipActivities`). Resolving the checkpoint unblocks the worker's token. |

### Skill Tools

All require `session_token`. The workflow is determined from the session token.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_skills` | `session_token` | Map of skill objects with lightweight `_resources` references | Loads all workflow-level skills (behavioral protocols such as session-protocol and agent-conduct). `session_token` authenticates the call and determines which workflow's skills to return. The returned skill objects contain the raw TOON skill definitions. Each skill includes a `_resources` array of lightweight string references (e.g., `"03"` or `"meta/04"`) that can be loaded individually via `get_resource`. |
| `get_skill` | `session_token`, `step_id?` | Skill definition object | Loads the skill for a specific step within the current activity. `session_token` authenticates the call and determines the current workflow and activity context. The optional `step_id` parameter identifies which step's skill to load. If `step_id` is omitted, loads the primary skill for the current activity. If no activity is active (before calling `next_activity`), loads the workflow's primary skill. The returned skill definition includes protocol steps, rules, errors, inputs, and resource references. Requires `next_activity` to have been called first when `step_id` is provided. |
| `get_resource` | `session_token`, `resource_index` | Resource content, id, and version | Loads a resource's full content by its index. `session_token` authenticates the call. `resource_index` is a string identifying the resource to load. Bare indices (e.g., `"03"`) resolve within the session's workflow. Prefixed cross-workflow references (e.g., `"meta/04"`) resolve from the named workflow. The returned content includes the resource body, an `id` field identifying the resource, and a `version` field. |

### Trace Tools

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_trace` | `session_token`, `trace_tokens?` | Trace source, event count, and array of events | Resolves accumulated trace tokens into full event data for post-execution analysis. `session_token` authenticates the call. The optional `trace_tokens` parameter is an array of HMAC-signed trace tokens previously accumulated from `next_activity` calls. When `trace_tokens` is provided, the server decodes and returns the full event records for those specific tokens. When omitted, returns the in-memory trace for the current session. The response includes the trace source, the total event count, and the array of trace events with timing and validation details. |


## Session Token

The session token is an opaque string returned by `start_session`. It captures the context of each call (workflow, activity, skill) so the server can validate subsequent calls for consistency.

The token payload carries: `wf` (workflow ID), `act` (current activity), `skill` (last loaded skill), `cond` (last transition condition), `v` (workflow version), `seq` (sequence counter), `ts` (creation timestamp), `sid` (session UUID), `aid` (agent ID — set via `start_session`'s `agent_id` parameter), and `bcp` (active blocking checkpoint ID, if any). When `start_session` is called with an existing `session_token`, all fields are inherited (including `sid`, `act`) and `aid` is stamped with the new agent identity. The token's `wf` (workflow ID) is the authoritative workflow source — there is no separate `workflow_id` parameter.

### Lifecycle

1. Call `discover` to learn the bootstrap procedure and available workflows
2. Call `list_workflows` to match the user's goal to a workflow
3. Call `start_session(agent_id)` to get a session token (defaults to the `meta` workflow). To resume an existing session, call `start_session(agent_id, session_token)` — the workflow is derived from the token. To start a session for a different workflow, use `dispatch_workflow`.
4. Call `get_skills` to load behavioral protocols
5. Call `get_workflow(summary=true)` to load the workflow's primary skill and get the activity list and `initialActivity`
6. Call `next_activity(initialActivity)` to transition to the first activity (returns `activity_id` and `name` only)
7. Call `get_activity` to load the complete activity definition (steps, checkpoints, transitions, skills)
8. For each step with a `skill` property, call `get_skill(step_id)` then `get_resource` for each `_resources` entry. Do NOT call `get_skill` for steps without a skill.
9. When encountering a checkpoint step, call `yield_checkpoint`, yield to the orchestrator, and wait to be resumed via `resume_checkpoint`.
10. Read `transitions` from the `get_activity` response; call `next_activity` with a `step_manifest` to advance
11. Accumulate `_meta.trace_token` from each `next_activity` call for post-execution trace resolution

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

### Checkpoint Enforcement

When a worker encounters a checkpoint step during activity execution, it calls `yield_checkpoint`. This sets the `bcp` (blocking checkpoint) field in the token and returns a `checkpoint_handle`. **Calling `next_activity` while `bcp` is set produces a hard error** (not a warning).

The worker yields the `checkpoint_handle` to the orchestrator. To clear the gate, the orchestrator calls `respond_checkpoint` using the handle:

```json
{ "checkpoint_handle": "...", "option_id": "proceed" }
```

Three resolution modes:

- **`option_id`** — the user's selected option. Validated against the checkpoint definition. Minimum response time enforced (default 3s since checkpoint issuance).
- **`auto_advance: true`** — use the checkpoint's `defaultOption`. Only valid for non-blocking checkpoints (`blocking: false`). The server enforces the full `autoAdvanceMs` timer.
- **`condition_not_met: true`** — dismiss a conditional checkpoint whose condition evaluated to false. Only valid when the checkpoint has a `condition` field.

The response includes any effects from the selected option (`setVariable`, `transitionTo`, `skipActivities`). The orchestrator relays these updates back to the worker, which then calls `resume_checkpoint` to proceed.

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

When calling `get_skill { step_id }`:
1. First checks `{workflow}/skills/{NN}-{skill_id}.toon` (using the session's workflow)
2. Falls back to `meta/skills/{NN}-{skill_id}.toon` (universal)

### Key Skills

#### session-protocol (universal)

Session lifecycle protocol:
- **Bootstrap**: `start_session(agent_id)` → `get_skills` → `get_workflow` → `next_activity(initialActivity)` → `get_activity`
- **Per-step**: `get_skill(step_id)` → `get_resource(resource_index)` for each `_resources` entry
- **Transitions**: Read `transitions` from `get_activity` response → `next_activity(activity_id)` with `step_manifest` → `get_activity`

#### 11-activity-worker (universal)

Activity execution protocol for workers:
- **Bootstrap**: `start_session` → `get_skills` → `next_activity` → `get_activity`
- **Execution**: Steps → checkpoints (yield to orchestrator) → artifacts → structured result

#### orchestrator-management / worker-management (universal)

Consolidated role-based skills for the orchestrator (top-level agent) and worker (sub-agent). The orchestrator manages workflow lifecycle, dispatches workers, and presents checkpoints. The worker self-bootstraps, executes steps, and reports structured results.
