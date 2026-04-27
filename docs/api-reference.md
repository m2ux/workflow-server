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
| `start_session` | `agent_id`, `workflow_id?`, `parent_session_token?`, `session_token?` | `session_token`, workflow info, `inherited`/`adopted`/`recovered` flags, and optional `warning` | Starts a new session, inherits an existing one, or creates a child session with parent context. **Fresh sessions default to the `meta` workflow** when no `workflow_id` or `session_token` is provided. `agent_id` sets the `aid` field inside the HMAC-signed token, distinguishing orchestrator from worker calls in the trace. The optional `session_token` parameter, when provided, causes the returned token to inherit all state (`sid`, `act`, `bcp`, `cond`, `v`) from the parent token while stamping the new `agent_id` into `aid`. The workflow is derived from the token's embedded `wf` field. The optional `parent_session_token` creates a child session with parent context fields (`pwf`, `pact`, `pv`, `psid`) embedded for trace correlation. **Token adoption on server restart:** If the provided `session_token` fails HMAC verification (e.g., the server was restarted and generated a new signing key), the server attempts to decode the payload without signature verification. If the payload is structurally valid, the server re-signs it with the current key and returns `adopted: true` with a `warning` — the session state (ID, activity position) is preserved. If the payload is also corrupted, the server falls back to a fresh session and returns `recovered: true` with a `warning` — the previous session state was NOT inherited and must be reconstructed from saved state. |
| `get_workflow_status` | `session_token` | `status` (active/blocked/completed), `current_activity`, `completed_activities`, `last_checkpoint` info, `session_token`, `workflow`, and `parent` context | Checks the status of the current workflow session. `session_token` authenticates the query and determines the session. The returned `status` is one of `active`, `blocked`, or `completed`. `current_activity` names the activity the agent is executing. `completed_activities` lists all finished activities derived from the trace. `last_checkpoint` contains the most recent checkpoint details. `workflow` reflects the current workflow metadata. If the session was created with a `parent_session_token`, the `parent` field contains the parent's session ID, workflow ID, activity, and version. |

### Workflow Tools

All require `session_token`. The workflow is determined from the session token (set at `start_session`). Each response includes an updated token and validation result in `_meta`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_token`, `summary?` | Primary skill (raw TOON), then complete workflow definition or summary metadata | Loads the workflow definition for the current session. The response begins with the workflow's primary skill as raw TOON, followed by a `---` separator, then the workflow data. `session_token` authenticates the call and determines which workflow to return. The optional `summary` parameter controls the response detail level. When `summary=true` (default), the workflow portion contains rules, variables, modes, `initialActivity`, and activity stubs (id, name, required). When `summary=false`, the workflow portion contains the full definition including all raw TOON fields. The primary skill at the beginning gives the agent immediate access to the workflow's orchestration protocol without a separate `get_skill` call. |
| `next_activity` | `session_token`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | `activity_id`, `name`, updated `session_token`, and trace token in `_meta` | Transitions from the current activity to the next activity in the workflow. This is the orchestrator's tool — it validates the transition, advances the session token, and records the trace, but does NOT return the activity definition. `session_token` authenticates the call and carries the prior activity state used to validate the transition. `activity_id` is the next activity to transition to — for the first call, use the `initialActivity` value from `get_workflow`; for subsequent calls, use an activity ID from the `transitions` field of the current activity's response. The optional `transition_condition` records the condition that triggered this transition, enabling server-side validation of condition-activity consistency. The optional `step_manifest` provides a structured summary of completed steps from the previous activity, validated for completeness and order. The optional `activity_manifest` provides an advisory summary of all completed activities. The returned `activity_id` and `name` confirm the transition target. A `trace_token` in `_meta` captures the mechanical trace for the completed activity. **Hard gate:** Calling `next_activity` while a blocking checkpoint is active (`bcp` is set) produces a hard error. |
| `get_activity` | `session_token` | Complete activity definition | Loads the complete activity definition for the current activity in the session. This is the worker's tool — call it after the orchestrator has called `next_activity` to transition. `session_token` authenticates the call and determines the current activity from the token's `act` field (no `activity_id` parameter is needed). The returned activity definition includes all steps, checkpoints, loops, decisions, transitions to subsequent activities, mode overrides, rules, and skill references — everything needed to execute the activity. |
| `yield_checkpoint` | `session_token`, `checkpoint_id` | Status, `checkpoint_handle`, and instructions | Yields execution to the orchestrator at a checkpoint step. `session_token` authenticates the call and must have an active activity. `checkpoint_id` identifies the checkpoint to yield (must match a checkpoint defined in the current activity). The returned `checkpoint_handle` is an opaque string the worker must yield to the orchestrator via a `<checkpoint_yield>` block. The status confirms the yield was recorded. **Hard gate:** Cannot yield a new checkpoint while another checkpoint is already active and awaiting resolution. |
| `resume_checkpoint` | `session_token` | Status and instructions | Resumes execution after the orchestrator resolves a checkpoint. `session_token` authenticates the call and must reference a resolved checkpoint. The server validates that the checkpoint was resolved before allowing execution to continue. The returned status confirms the checkpoint is cleared and the token sequence is advanced. **Hard gate:** Cannot resume if the checkpoint is still active (`bcp` is set). |
| `present_checkpoint` | `checkpoint_handle` or `session_token` | Full checkpoint definition | Used by the orchestrator to load full checkpoint details from a worker's yielded `checkpoint_handle`. Accepts either `checkpoint_handle` (preferred) or `session_token` — both are the same opaque token string. The `session_token` alternative is useful when resuming a workflow and the agent only has the session token from `get_workflow_status`. The returned checkpoint definition includes the message to present to the user, available options with their effects, and auto-advance configuration. |
| `respond_checkpoint` | `checkpoint_handle` or `session_token`, `option_id?`, `auto_advance?`, `condition_not_met?` | Resolution status and any defined `effect` | Used by the orchestrator to resolve a yielded checkpoint. Exactly one resolution mode must be provided: `option_id` records the user's selected option (validated against the checkpoint definition, with a minimum response time enforced), `auto_advance` uses the checkpoint's `defaultOption` (only valid for non-blocking checkpoints after `autoAdvanceMs` elapses), or `condition_not_met` dismisses a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a `condition` field). The returned `effect` contains any state changes defined by the selected option (`setVariable`, `transitionTo`, `skipActivities`). Resolving the checkpoint clears the `bcp` gate and unblocks the worker's token. |

### Skill Tools

All require `session_token`. The workflow is determined from the session token.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_skills` | `session_token` | Raw TOON skill blocks for the workflow's primary skill | Loads the workflow-level primary skill (e.g., the orchestrator management skill). `session_token` authenticates the call and determines which workflow's skill to return. The response is raw TOON content separated by `---` fences, prefixed with scope and session token headers. This is the workflow-scope skill; activity-level step skills are loaded separately via `get_skill`. |
| `get_skill` | `session_token`, `step_id?` | Skill definition as raw TOON | Loads a skill within the current workflow or activity. If called before `next_activity` (no current activity in session), it loads the primary skill for the workflow. If called during an activity, it resolves the skill reference from the activity definition. If `step_id` is provided, it loads the skill explicitly assigned to that step (searching both `activity.steps` and `activity.loops[].steps`). If `step_id` is omitted during an activity, it loads the primary skill for the entire activity. Returns the skill definition as raw TOON with a session token header. |
| `get_resource` | `session_token`, `resource_id` | Resource content, id, version, and session token | Loads a resource's full content by its ID. `session_token` authenticates the call. `resource_id` is a string identifying the resource to load. Bare indices (e.g., `"03"`) resolve within the session's workflow. Prefixed cross-workflow references (e.g., `"meta/01"`) resolve from the named workflow. The returned content includes the resource body, an `id` field, and a `version` field. |

### Trace Tools

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_trace` | `session_token`, `trace_tokens?` | Trace source, event count, and array of events | Resolves accumulated trace tokens into full event data for post-execution analysis. `session_token` authenticates the call. The optional `trace_tokens` parameter is an array of HMAC-signed trace tokens previously accumulated from `next_activity` calls. When `trace_tokens` is provided, the server decodes and returns the full event records for those specific tokens. When omitted, returns the in-memory trace for the current session. The response includes the trace source, the total event count, and the array of trace events with timing and validation details. |


## Session Token

The session token is an opaque string returned by `start_session`. It captures the context of each call (workflow, activity, skill) so the server can validate subsequent calls for consistency.

The token payload carries: `wf` (workflow ID), `act` (current activity), `skill` (last loaded skill), `cond` (last transition condition), `v` (workflow version), `seq` (sequence counter), `ts` (creation timestamp), `sid` (session UUID), `aid` (agent ID — set via `start_session`'s `agent_id` parameter), `bcp` (active blocking checkpoint ID, if any), `psid` (parent session ID for dispatched workflows), `pwf` (parent workflow ID), `pact` (parent activity), and `pv` (parent workflow version). When `start_session` is called with an existing `session_token`, all fields are inherited (including `sid`, `act`) and `aid` is stamped with the new agent identity. The token's `wf` (workflow ID) is the authoritative workflow source — there is no separate `workflow_id` parameter.

### Lifecycle

1. Call `discover` to learn the bootstrap procedure and available workflows
2. Call `list_workflows` to match the user's goal to a workflow
3. Call `start_session(agent_id)` to get a session token (defaults to the `meta` workflow). To resume an existing session, call `start_session(agent_id, session_token)` — the workflow is derived from the token. To start a session for a different workflow, pass `workflow_id`.
4. Call `get_skills` to load the workflow's primary skill
5. Call `get_workflow(summary=true)` to load the workflow structure and get the activity list and `initialActivity`
6. Call `next_activity(initialActivity)` to transition to the first activity (returns `activity_id` and `name` only)
7. Call `get_activity` to load the complete activity definition (steps, checkpoints, transitions, skills)
8. For each step with a `skill` property, call `get_skill(step_id)` to load the step's skill. Do NOT call `get_skill` for steps without a skill.
9. Call `get_resource` for each resource referenced by the skill when needed.
10. When encountering a checkpoint step, call `yield_checkpoint`, yield to the orchestrator, and wait to be resumed via `resume_checkpoint`.
11. Read `transitions` from the `get_activity` response; call `next_activity` with a `step_manifest` to advance
12. Accumulate `_meta.trace_token` from each `next_activity` call for post-execution trace resolution

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
- **Checkpoint gate** — when `bcp` is set, most tools are hard-blocked until `respond_checkpoint` clears it

Warnings do not block execution — the tool still returns its result. They enable agent self-correction. All validation warnings are captured in the execution trace.

### Checkpoint Enforcement

When a worker encounters a checkpoint step during activity execution, it calls `yield_checkpoint`. This sets the `bcp` (blocking checkpoint) field in the token and returns a `checkpoint_handle`. **Calling `next_activity` while `bcp` is set produces a hard error** (not a warning). Most other tools are also gated when `bcp` is active.

The worker yields the `checkpoint_handle` to the orchestrator. To clear the gate, the orchestrator calls `respond_checkpoint` using the handle:

```json
{ "checkpoint_handle": "...", "option_id": "proceed" }
```

Three resolution modes:

- **`option_id`** — the user's selected option. Validated against the checkpoint definition. Minimum response time enforced (default 3s since checkpoint issuance).
- **`auto_advance: true`** — use the checkpoint's `defaultOption`. Only valid for non-blocking checkpoints (`blocking: false` with `autoAdvanceMs`). The server enforces the full `autoAdvanceMs` timer.
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

- `discover`, `list_workflows`, `health_check`

## Skills

Skills provide structured guidance for agents to consistently execute workflows.

### Skill Resolution

When calling `get_skill({ step_id })`:
1. First checks `{workflow}/skills/{NN}-{skill_id}.toon` (using the session's workflow)
2. Falls back to `meta/skills/{NN}-{skill_id}.toon` (universal)

### Key Skills

#### session-protocol (universal)

Session lifecycle protocol:
- **Bootstrap**: `start_session(agent_id)` → `get_skills` → `get_workflow` → `next_activity(initialActivity)` → `get_activity`
- **Per-step**: `get_skill(step_id)` (for steps with a skill) → `get_resource(resource_id)` for referenced resources
- **Transitions**: Read `transitions` from `get_activity` response → `next_activity(activity_id)` with `step_manifest` → `get_activity`
- **Checkpoints**: `yield_checkpoint` → orchestrator resolves via `respond_checkpoint` → `resume_checkpoint`

#### orchestrator-management / worker-management (workflow-level)

Consolidated role-based skills for the orchestrator (top-level agent) and worker (sub-agent). The orchestrator manages workflow lifecycle, dispatches workers, and presents checkpoints. The worker self-bootstraps, executes steps, and reports structured results. These are loaded via `get_skills` as the workflow's primary skill.
