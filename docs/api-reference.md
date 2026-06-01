# API Reference

## MCP Tools

### Bootstrap Tools

No `session_index` required.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `discover` | - | Server info and `discovery` instructions | Entry point for the workflow server. Returns the server name, version, and the bootstrap procedure an agent should follow. The `discovery` instructions describe how to call `list_workflows` and `start_session` to begin a session. |
| `list_workflows` | - | Array of workflow definitions (each with `id`, `title`, `version`, and `tags`) | Lists all available workflow definitions. Each entry in the returned array contains an `id` (unique workflow identifier), `title` (human-readable name), `version` (semver string), and `tags` (array of categorization strings for matching a user's goal to a workflow). |
| `health_check` | - | Server status and stats | Returns the server health status. The response includes the server version, the number of workflows available, and the server uptime. |

### Session Tools

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `start_session` | `agent_id`, `workflow_id?`, `planning_slug?`, `parent_planning_slug?` | `session_index`, `planning_slug`, workflow info | Starts a new session or resumes an existing one, optionally with a parent for nested-workflow dispatch. **Fresh sessions default to the `meta` workflow** when no `workflow_id` is provided. `agent_id` sets the recorded agent identity in `session.json`, distinguishing orchestrator from worker calls in the trace. `planning_slug` is a single-segment slug for the planning folder under `<workspace>/.engineering/artifacts/planning/<slug>/`; it determines where `session.json` and the sealed `.session-token` live and deterministically derives the 6-character base32 `session_index`. When `planning_slug` is omitted, the server mints a transitional slug. To **resume** a session, pass the same `planning_slug` again — the server loads the existing `session.json`, verifies the seal, and returns the same `session_index`. For **nested dispatch**, also pass `parent_planning_slug`; the server snapshots the parent's `session.json` (seal-verified) under the child's `parentSession` field for trace correlation and recursive parent traversal. Server restarts are transparent because state lives in `session.json` rather than in an agent-held token. |
| `get_workflow_status` | `session_index` | `status` (active/blocked/completed), `current_activity`, `completed_activities`, `last_checkpoint` info, `workflow`, and `parent` context | Checks the status of the current workflow session. `session_index` identifies the session. The returned `status` is one of `active`, `blocked`, or `completed`. `current_activity` names the activity the agent is executing. `completed_activities` lists all finished activities (from `session.json`). `last_checkpoint` contains the most recent checkpoint details. `workflow` reflects the current workflow metadata. If the session was created with a `parent_planning_slug`, the `parent` field contains the parent's session info derived from the `parentSession` snapshot. |

### Workflow Tools

All require `session_index`. The workflow is determined from `session.json` (recorded at `start_session`). Each response includes the `session_index` and a validation result in `_meta`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_index`, `summary?` | Primary technique (raw TOON), bundled orchestrator operations, then workflow definition or summary metadata | Loads the workflow definition for the current session. The response begins with the workflow's primary technique (when present), followed by a TOON-encoded `operations` bundle resolving the union of `workflow.operations` and the core orchestrator op set (engine traversal, checkpoint flow, orchestrator discipline). A `---` separator precedes the workflow body. `session_index` identifies the session. The optional `summary` parameter controls the response detail level. When `summary=true` (default), the workflow portion contains rules, variables, `initialActivity`, and activity stubs (id, name, required). When `summary=false`, the workflow portion contains the full raw TOON definition. The bundled operations give the orchestrator immediate access to the procedures and rules it needs without separate `get_technique` calls. |
| `next_activity` | `session_index`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | `activity_id`, `name`, and trace token in `_meta` | Transitions from the current activity to the next activity in the workflow. This is the orchestrator's tool — it validates the transition, advances `session.json` (writing `session.json` and resealing `.session-token` atomically), and records the trace, but does NOT return the activity definition. `session_index` identifies the session. `activity_id` is the next activity to transition to — for the first call, use the `initialActivity` value from `get_workflow`; for subsequent calls, use an activity ID from the `transitions` field of the current activity's response. The optional `transition_condition` records the condition that triggered this transition, enabling server-side validation of condition-activity consistency. The optional `step_manifest` provides a structured summary of completed steps from the previous activity, validated for completeness and order. The optional `activity_manifest` provides an advisory summary of all completed activities. The returned `activity_id` and `name` confirm the transition target. A `trace_token` in `_meta` captures the mechanical trace for the completed activity. **Hard gate:** Calling `next_activity` while a blocking checkpoint is active (`activeCheckpoint` set in `session.json`) produces a hard error. |
| `get_activity` | `session_index` | Bundled worker operations, then complete activity definition | Loads the complete activity definition for the current activity in the session. This is the worker's tool — call it after the orchestrator has called `next_activity` to transition. The response begins with a TOON-encoded `operations` bundle resolving the union of `activity.operations` and the core worker op set (yield/resume checkpoint, finalize-activity, agent-conduct rules), separated from the activity body by `---`. `session_index` identifies the session and determines the current activity from `session.json` (no `activity_id` parameter is needed). The activity body includes all steps, checkpoints, loops, decisions, transitions, rules, and the activity's own `operations` references — everything needed to execute the activity. |
| `yield_checkpoint` | `session_index`, `checkpoint_id` | Status, `checkpoint_handle`, and instructions | Yields execution to the orchestrator at a checkpoint step. `session_index` identifies the session and must have an active activity. `checkpoint_id` identifies the checkpoint to yield (must match a checkpoint defined in the current activity). The server records the active checkpoint in `session.json` (`activeCheckpoint`) and returns a one-shot opaque `checkpoint_handle` the worker yields to the orchestrator via a `<checkpoint_yield>` block. **Hard gate:** Cannot yield a new checkpoint while another checkpoint is already active in `session.json`. |
| `resume_checkpoint` | `session_index`, `checkpoint_handle` | Status and recorded effects | Resumes execution after the orchestrator resolves a checkpoint. `session_index` identifies the session and `checkpoint_handle` is the one-shot handle issued by `yield_checkpoint`. The server validates that the checkpoint has been resolved (i.e., `activeCheckpoint` is cleared in `session.json`) before allowing the worker to proceed, and returns the recorded variable effects. **Hard gate:** Cannot resume if `activeCheckpoint` is still set. |
| `present_checkpoint` | `checkpoint_handle` | Full checkpoint definition | Used by the orchestrator to load full checkpoint details from a worker's yielded `checkpoint_handle`. The server decodes the handle, looks up the active checkpoint recorded in `session.json`, and returns the checkpoint definition including the message to present to the user, available options with their effects, and auto-advance configuration. |
| `respond_checkpoint` | `checkpoint_handle`, `option_id?`, `auto_advance?`, `condition_not_met?` | Resolution status and any defined `effect` | Used by the orchestrator to resolve a yielded checkpoint. Exactly one resolution mode must be provided: `option_id` records the user's selected option (validated against the checkpoint definition, with a minimum response time enforced), `auto_advance` uses the checkpoint's `defaultOption` (only valid for non-blocking checkpoints after `autoAdvanceMs` elapses), or `condition_not_met` dismisses a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a `condition` field). The returned `effect` contains any state changes defined by the selected option (`setVariable`, `transitionTo`, `skipActivities`); the server clears `activeCheckpoint` from `session.json` and records the response under `checkpointResponses`. |

### Technique Tools

All require `session_index` (except `resolve_operations`). The workflow is determined from `session.json`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_technique` | `session_index`, `step_id?` | Fully composed technique as TOON | Loads a single composed technique within the current workflow or activity. If called before `next_activity` (no current activity in session), it loads the workflow primary technique. If called during an activity, it resolves the technique reference from the activity definition; with `step_id`, it loads the technique assigned to that step; without `step_id`, the activity primary technique. The returned technique is fully **composed**: it inherits its workflow-root `techniques/TECHNIQUE.md` base contract recursively (inputs/outputs/rules/errors merged, root protocol prepended). Techniques are loaded one at a time. |
| `get_resource` | `session_index`, `resource_id` | Resource content, id, version, and `session_index` | Loads a resource's full content by its slug. `session_index` identifies the session. `resource_id` is a text-only slug. Bare slugs (e.g., `"review-mode"`) resolve within the session's workflow. Prefixed cross-workflow references (e.g., `"meta/bootstrap-protocol"`) resolve from the named workflow. The returned content includes the resource body, an `id` field, and a `version` field. |
| `resolve_operations` | `operations` | Array of resolved entries (one per ref) with `source`, `workflow?`, `name`, `type` (`operation` / `rule` / `error` / `not-found`), `body`, and `ref` | Resolves a flat list of `group::element-name` references to their bodies. References may be workflow-prefixed (e.g., `"meta/agent-conduct::file-sensitivity"`). Each ref is matched against the target technique's operations, then `rules`, then `errors` (in that order). When at least one element from a technique is resolved, that technique's remaining global rules are auto-appended with type `rule` (so an activity that references one operation also receives the technique's invariants). No `session_index` required — this is a structural lookup. Used internally by `get_workflow` and `get_activity` to assemble their operation bundles, and exposed for clients that need to resolve refs ad-hoc. |

### Trace Tools

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_trace` | `session_index`, `trace_tokens?` | Trace source, event count, and array of events | Resolves accumulated trace tokens into full event data for post-execution analysis. `session_index` identifies the session. The optional `trace_tokens` parameter is an array of HMAC-signed trace tokens previously accumulated from `next_activity` calls. When `trace_tokens` is provided, the server decodes and returns the full event records for those specific tokens. When omitted, returns the in-memory trace for the current session. The response includes the trace source, the total event count, and the array of trace events with timing and validation details. |


## Session State

Each session has a 6-character base32 `session_index` returned by `start_session`. The index is **deterministically derived** from the planning slug (`<workspace>/.engineering/artifacts/planning/<slug>/`), so the same slug always resolves to the same index across server restarts.

The canonical session state lives on disk in two files under the planning folder, both **owned by the server**:

* **`session.json`** — Plaintext, JSON-Schema-validated state (`schemas/session-file.schema.json`). Holds `sessionIndex`, `workflowId`, `workflowVersion`, `agentId`, `seq`, `ts`, `currentActivity`, `currentTechnique`, `condition`, `activeCheckpoint` (if a checkpoint is in flight), `variables`, `completedActivities`, `skippedActivities`, `checkpointResponses`, `history`, `triggeredWorkflows`, and (for child workflows) a snapshot of the parent under `parentSession`.
* **`.session-token`** — A sealed, HMAC-signed envelope binding `session.json` to the workspace + server signing key. Mismatch between the two on read raises a hard `SealMismatchError`.

Writes are atomic (write-temp + rename) and performed on every authenticated tool call. Reads verify the seal before returning state. Server restarts are transparent — the agent simply passes the same `session_index` (or resumes via `start_session({ agent_id, planning_slug })`) and the server reloads `session.json` from disk.

Agents pass only the `session_index` on every authenticated tool call; they do not read or write the session files themselves.

### Lifecycle

1. Call `discover` to learn the bootstrap procedure and available workflows
2. Call `list_workflows` to match the user's goal to a workflow
3. Call `start_session({ agent_id, planning_slug })` to get a `session_index` (defaults to the `meta` workflow when no `workflow_id` is provided). Resuming a session uses the same call shape with the same `planning_slug`. To start a session for a different workflow, pass `workflow_id`.
4. Call `get_workflow({ session_index, summary: true })` to load the workflow structure. The response begins with the workflow's primary technique and a bundled `operations` block (workflow-declared ops + core orchestrator ops), followed by activity stubs and `initialActivity`.
5. Call `next_activity({ session_index, activity_id: initialActivity })` to transition to the first activity (returns `activity_id` and `name` only)
6. Call `get_activity({ session_index })` to load the complete activity definition. The response begins with the worker `operations` bundle (activity-declared ops + core worker ops), followed by the raw activity body.
7. Execute steps in order. Step `description` fields may carry inline operation invocations of the form `group::operation-name(arg: {var}, ...)` — the operation body is already in the bundle from step 6.
8. Call `get_resource` for each resource referenced by an operation when needed. (Use `resolve_operations` directly if you need to fetch additional ops outside the bundled sets.)
9. When encountering a checkpoint step, call `yield_checkpoint`, yield to the orchestrator, and wait to be resumed via `resume_checkpoint`.
10. Read `transitions` from the `get_activity` response; call `next_activity` with a `step_manifest` to advance
11. Accumulate `_meta.trace_token` from each `next_activity` call for post-execution trace resolution

> Note: `get_technique` loads a single composed technique on demand — the workflow primary technique before any activity, or the technique for the current activity (optionally a `step_id`'s technique). The operation-focused path above (bundled by `get_workflow` / `get_activity`) supplies most behaviour without per-step technique fetches.

### Validation

The server validates each call against the recorded state in `session.json`. Validation results are returned in `_meta.validation`:

```json
{
  "_meta": {
    "session_index": "<6-char-base32>",
    "trace_token": "<trace-token (on next_activity only)>",
    "validation": {
      "status": "valid",
      "warnings": []
    }
  }
}
```

Validation checks:
- **Activity transition** — the requested activity is a valid transition from the activity recorded in `session.json`
- **Version drift** — the workflow version hasn't changed since the session started
- **Step completion** — when `step_manifest` is provided, validates all steps present, in order, with outputs
- **Activity manifest** — when `activity_manifest` is provided, validates activity IDs exist in the workflow (advisory)
- **Seal integrity** — `.session-token` is verified against `session.json` on every read (rejects tampered state)
- **Checkpoint gate** — when `activeCheckpoint` is set in `session.json`, most tools are hard-blocked until `respond_checkpoint` clears it

Warnings do not block execution — the tool still returns its result. They enable agent self-correction. All validation warnings are captured in the execution trace.

### Checkpoint Enforcement

When a worker encounters a checkpoint step during activity execution, it calls `yield_checkpoint`. The server records `activeCheckpoint` in `session.json` and returns a one-shot `checkpoint_handle`. **Calling `next_activity` while `activeCheckpoint` is set produces a hard error** (not a warning). Most other tools are also gated while a checkpoint is active.

The worker yields the `checkpoint_handle` to the orchestrator. To clear the gate, the orchestrator calls `respond_checkpoint` using the handle:

```json
{ "checkpoint_handle": "...", "option_id": "proceed" }
```

Three resolution modes:

- **`option_id`** — the user's selected option. Validated against the checkpoint definition. Minimum response time enforced (default 3s since checkpoint issuance).
- **`auto_advance: true`** — use the checkpoint's `defaultOption`. Only valid for non-blocking checkpoints (`blocking: false` with `autoAdvanceMs`). The server enforces the full `autoAdvanceMs` timer.
- **`condition_not_met: true`** — dismiss a conditional checkpoint whose condition evaluated to false. Only valid when the checkpoint has a `condition` field.

The response includes any effects from the selected option (`setVariable`, `transitionTo`, `skipActivities`); the server applies them to `session.json` and clears `activeCheckpoint`. The orchestrator relays the effects back to the worker, which then calls `resume_checkpoint({ session_index, checkpoint_handle })` to proceed.

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

### Session-index-exempt tools

- `discover`, `list_workflows`, `health_check`, `resolve_operations`

## Techniques and Operations

Techniques are markdown definitions of a capability, with the procedures (`operations`), behavioural invariants (`rules`), and recovery guidance (`errors`) that agents use while executing a workflow. Under the operation-focused model, a grouped technique exposes named **operations** — individual `{op}.md` files with `inputs`, `output`, a `## Protocol` step list, `tools`, `resources`, `errors`, `rules`, and optional `prose` — that activities and workflows reference by `group::operation-name`.

### Operation References

Activities and workflows declare a flat `operations` array of `group::operation-name` references (workflow-prefixed forms like `meta/agent-conduct::file-sensitivity` are also supported). The server resolves these refs (and the corresponding core op set for orchestrators / workers) and bundles them into the responses of `get_workflow` and `get_activity`. Inline forms in step descriptions (`group::operation-name(arg: {var}, ...)`) point at the same bundled bodies.

`resolve_operations` is the underlying lookup tool — exposed for clients that need to resolve refs ad-hoc. Each resolved entry carries `source`, `name`, `type` (`operation` / `rule` / `error` / `not-found`), and `body`. When at least one element from a technique is resolved, that technique's remaining global rules are auto-appended so an activity that references one operation still receives the technique's invariants.

### Technique Resolution

When resolving a technique (via `get_technique` or `resolve_operations`):
1. First checks the session's workflow — `{workflow}/techniques/{slug}.md` (or `{group}/{op}.md` for an operation ref)
2. Falls back to `meta/techniques/...` (universal)

A `group::op` reference resolves to `{group}/{op}.md`: unprefixed resolves under `meta`, while `{workflow}/{group}::{op}` resolves within the named workflow.

### Key Techniques

#### workflow-engine (meta capability technique)

Houses the operations and rules that drive workflow execution: session lifecycle, state persistence, activity dispatch, transition evaluation, checkpoint flow (yield, bubble, present-to-user, respond, resume), and sub-workflow handling. The core orchestrator and worker op sets pull from this technique plus `agent-conduct`. Activities reference its operations directly via `workflow-engine::<operation>`.

#### agent-conduct (meta capability technique)

Cross-cutting behavioural rules — orchestrator-discipline, checkpoint-discipline, operational-discipline, file-sensitivity, code-commentary. These are auto-included when their technique is referenced and form part of every orchestrator / worker bundle.

#### Workflow primary techniques

Workflows may declare a `techniques.primary`. `get_technique` (before any activity) and `get_workflow` return its composed body. Workflows compose behaviour via `operations` arrays referencing capability techniques.
