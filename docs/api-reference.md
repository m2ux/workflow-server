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
| `get_workflow` | `session_index` | The technique bundle, then lightweight workflow metadata | Loads the workflow structure for the current session. The response begins with the technique bundle — the resolved orchestrator techniques (the workflow's `techniques.workflow` plus the core orchestrator techniques), delivered as `techniques`, `rules`, and `unresolved`. A `---` separator precedes the workflow body, which is lightweight metadata: orchestrator `rules` (the flattened `rules.workflow` + `rules.universal`), `variables`, `initialActivity`, and activity stubs (id, name, required). Per-activity step detail and the worker-facing `rules.activity` / `techniques.activity` are delivered to workers via `get_activity`. The bundle gives the orchestrator immediate access to the techniques and rules it needs without separate `get_technique` calls. |
| `next_activity` | `session_index`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | `activity_id`, `name`, and trace token in `_meta` | Transitions from the current activity to the next activity in the workflow. This is the orchestrator's tool — it validates the transition, advances `session.json` (writing `session.json` and resealing `.session-token` atomically), and records the trace, but does NOT return the activity definition. `session_index` identifies the session. `activity_id` is the next activity to transition to — for the first call, use the `initialActivity` value from `get_workflow`; for subsequent calls, use an activity ID from the `transitions` field of the current activity's response. The optional `transition_condition` records the condition that triggered this transition, enabling server-side validation of condition-activity consistency. The optional `step_manifest` provides a structured summary of completed steps from the previous activity, validated for completeness and order. The optional `activity_manifest` provides an advisory summary of all completed activities. The returned `activity_id` and `name` confirm the transition target. A `trace_token` in `_meta` captures the mechanical trace for the completed activity. **Hard gate:** Calling `next_activity` while a blocking checkpoint is active (`activeCheckpoint` set in `session.json`) produces a hard error. |
| `get_activity` | `session_index` | The activity technique bundle, the workflow's inherited `activity_rules`, then the complete activity definition | Loads the complete activity definition for the current activity in the session. This is the worker's tool — call it after the orchestrator has called `next_activity` to transition. The response begins with the technique bundle, delivered as `techniques`, `rules`, and `unresolved`, separated from the activity body by `---`. The bundle resolves the workflow's `techniques.activity` (technique references inherited by EVERY activity) plus the activity's own `techniques[]` plus the core worker techniques — mirroring how `rules.activity` is inherited. The server then injects `activity_rules` — the workflow's `rules.activity` plus the dual-audience `rules.universal`, the worker-facing rules inherited by EVERY activity (workflow `rules.workflow` are orchestrator-only and never appear here). `session_index` identifies the session and determines the current activity from `session.json` (no `activity_id` parameter is needed). The activity body includes all steps, checkpoints, loops, decisions, transitions, rules, and the activity's `techniques` references — everything needed to execute the activity. |
| `yield_checkpoint` | `session_index`, `checkpoint_id` | Status, `checkpoint_handle`, and instructions | Yields execution to the orchestrator at a checkpoint step. `session_index` identifies the session and must have an active activity. `checkpoint_id` identifies the checkpoint to yield (must match a checkpoint defined in the current activity). The server records the active checkpoint in `session.json` (`activeCheckpoint`) and returns a one-shot opaque `checkpoint_handle` the worker yields to the orchestrator via a `<checkpoint_yield>` block. **Hard gate:** Cannot yield a new checkpoint while another checkpoint is already active in `session.json`. |
| `resume_checkpoint` | `session_index`, `checkpoint_handle` | Status and recorded effects | Resumes execution after the orchestrator resolves a checkpoint. `session_index` identifies the session and `checkpoint_handle` is the one-shot handle issued by `yield_checkpoint`. The server validates that the checkpoint has been resolved (i.e., `activeCheckpoint` is cleared in `session.json`) before allowing the worker to proceed, and returns the recorded variable effects. **Hard gate:** Cannot resume if `activeCheckpoint` is still set. |
| `present_checkpoint` | `checkpoint_handle` | Full checkpoint definition | Used by the orchestrator to load full checkpoint details from a worker's yielded `checkpoint_handle`. The server decodes the handle, looks up the active checkpoint recorded in `session.json`, and returns the checkpoint definition including the message to present to the user, available options with their effects, and auto-advance configuration. |
| `respond_checkpoint` | `checkpoint_handle`, `option_id?`, `auto_advance?`, `condition_not_met?` | Resolution status and any defined `effect` | Used by the orchestrator to resolve a yielded checkpoint. Exactly one resolution mode must be provided: `option_id` records the user's selected option (validated against the checkpoint definition, with a minimum response time enforced), `auto_advance` uses the checkpoint's `defaultOption` (only valid for non-blocking checkpoints after `autoAdvanceMs` elapses), or `condition_not_met` dismisses a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a `condition` field). The returned `effect` contains any state changes defined by the selected option (`setVariable`, `transitionTo`, `skipActivities`); the server clears `activeCheckpoint` from `session.json` and records the response under `checkpointResponses`. |

### Technique Tools

All require `session_index`. The workflow is determined from `session.json`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_technique` | `session_index`, `step_id?` | Fully composed technique as YAML | Loads a single composed technique within the current workflow or activity. If called before `next_activity` (no current activity in session), it loads the workflow's first declared technique (the first entry of the workflow's `techniques.workflow`). If called during an activity, it resolves the technique reference from the activity definition; with `step_id`, it loads the technique assigned to that step; without `step_id`, the activity's first declared technique (the first entry of the activity's `techniques[]`). The returned technique is fully **composed**: it inherits its ancestor techniques' base contract recursively (inputs/outputs/rules merged; the ancestor's `Initial`/`Final` protocol blocks wrap the descendant protocol and the server renumbers). Techniques are loaded one at a time. |
| `get_resource` | `session_index`, `resource_id` | Resource content, id, version, and `session_index` | Loads a resource's full content by its slug. `session_index` identifies the session. `resource_id` is a text-only slug. Bare slugs (e.g., `"review-mode"`) resolve within the session's workflow. Prefixed cross-workflow references (e.g., `"meta/bootstrap-protocol"`) resolve from the named workflow. The returned content includes the resource body, an `id` field, and a `version` field. |

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
4. Call `get_workflow({ session_index })` to load the workflow structure. The response begins with the technique bundle (`techniques`, `rules`, `unresolved`), followed by activity stubs and `initialActivity`.
5. Call `next_activity({ session_index, activity_id: initialActivity })` to transition to the first activity (returns `activity_id` and `name` only)
6. Call `get_activity({ session_index })` to load the complete activity definition. The response begins with the technique bundle for the activity's `techniques[]` (`techniques`, `rules`, `unresolved`), followed by the raw activity body.
7. Execute the steps and protocol of each technique in the bundle from step 6.
8. Call `get_resource` for each resource a technique references when needed. Call `get_technique` to load a technique that is not already in the bundle.
9. When encountering a checkpoint step, call `yield_checkpoint`, yield to the orchestrator, and wait to be resumed via `resume_checkpoint`.
10. Read `transitions` from the `get_activity` response; call `next_activity` with a `step_manifest` to advance
11. Accumulate `_meta.trace_token` from each `next_activity` call for post-execution trace resolution

> Note: `get_technique` loads a single composed technique on demand — the workflow's first declared technique before any activity, or the technique for the current activity (optionally a `step_id`'s technique). The bundle returned by `get_workflow` / `get_activity` supplies most behaviour without per-step technique fetches.

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

- `discover`, `list_workflows`, `health_check`

## Techniques

A technique is a markdown definition of a capability. Its file carries frontmatter with `metadata.version`, a `## Capability` section, `## Inputs` / `## Outputs` sections whose `####` sub-sections name the components (with reserved `#### artifact` and `#### default` components), a `## Protocol` section (`### N. Title` blocks or a flat list), and a `## Rules` section. Failure handling lives inline in the protocol step that triggers it. A technique can contain nested techniques. A technique body carries capability, flow, inputs, protocol, and outputs.

### Technique Addressing

Techniques are addressed by `::` paths of the form `[workflow::]technique[::nested…]`. A reference within the same workflow is implicit. Resolution checks the current workflow first, then `meta`. Slashes in a path are normalized to `::`.

### The Technique Bundle

An activity references techniques via a flat `techniques[]` array, and a workflow declares cross-cutting techniques via `techniques.workflow` (orchestrator) and `techniques.activity` (inherited by every activity). The server resolves those references and bundles them into the responses of `get_workflow` and `get_activity` as three buckets: `techniques` (the resolved technique bodies), `rules` (their behavioural invariants), and `unresolved` (references that did not resolve). The `get_workflow` bundle resolves `techniques.workflow`; the `get_activity` bundle resolves `techniques.activity` (inherited) plus the activity's own `techniques[]`. The bundle gives the orchestrator and worker the techniques and rules they need without separate `get_technique` calls.

### Protocol Composition

An ancestor technique's `Initial` and `Final` protocol blocks wrap a descendant's protocol, applied recursively up the technique's ancestry. The server renumbers the composed protocol so the steps read as a single ordered sequence.

### Key Techniques

#### workflow-engine (meta capability technique)

Drives workflow execution: session lifecycle, state persistence, activity dispatch, transition evaluation, checkpoint flow (yield, bubble, present-to-user, respond, resume), and sub-workflow handling. Activities reference it via the `::` path.

#### agent-conduct (meta capability technique)

Cross-cutting behavioural rules — orchestrator-discipline, checkpoint-discipline, operational-discipline, file-sensitivity, code-commentary. These rules appear in the `rules` bucket of every orchestrator and worker bundle.

#### Workflow-level techniques

A workflow may declare techniques partitioned by audience, mirroring the `rules.{workflow, activity}` model:

- **`techniques.workflow`** — orchestrator-level technique references, bundled into `get_workflow` alongside the core orchestrator techniques. `get_technique` (before any activity) returns the composed body of the first of these.
- **`techniques.activity`** — technique references inherited by every activity; the server injects them into each `get_activity` technique bundle, ahead of the activity's own `techniques[]`. Declaring a common technique here once avoids duplicating it across every activity's `techniques[]`.
