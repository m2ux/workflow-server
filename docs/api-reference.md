# API Reference

## MCP Tools

MCP tool and parameter descriptions registered with the server are intentionally terse (call contract and footguns only). This document is the canonical deep reference for behavior, delivery modes, and response shapes; `discover` / runtime payloads remain self-describing at call time.

### Bootstrap Tools

No `session_index` required.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `discover` | - | Server info and bootstrap procedure | Entry point for the workflow server. Returns the server name, version, and the pre-session bootstrap stub (schema fetch → `start_session` → `get_workflow`). Ongoing delivery policy is authoritative in techniques delivered with the `get_workflow` operations bundle. |
| `list_workflows` | - | Array of workflow definitions (each with `id`, `title`, `version`, and `tags`) | Lists all available workflow definitions. Each entry in the returned array contains an `id` (unique workflow identifier), `title` (human-readable name), `version` (semver string), and `tags` (array of categorization strings for matching a user's goal to a workflow). |
| `health_check` | - | Server status and stats | Returns the server health status. The response includes the server version, the number of workflows available, and the server uptime. |

### Session Tools

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `start_session` | `agent_id`, `workflow_id?`, `planning_slug?`, `parent_planning_slug?`, `context_mode?` | `session_index`, `planning_slug`, workflow info | Starts a new session or resumes an existing one, optionally with a parent for nested-workflow dispatch. **Fresh sessions default to the `meta` workflow** when no `workflow_id` is provided. `agent_id` sets the recorded agent identity in `session.json`, distinguishing orchestrator from worker calls in the trace. `planning_slug` is a single-segment slug for the planning folder under `<workspace>/.engineering/artifacts/planning/<slug>/`; it determines where `session.json` and the sealed `.session-token` live and deterministically derives the 6-character base32 `session_index`. When `planning_slug` is omitted, the server mints a transitional slug. To **resume** a session, pass the same `planning_slug` again — the server loads the existing `session.json`, verifies the seal, and returns the same `session_index`. For **nested dispatch**, also pass `parent_planning_slug`; the server snapshots the parent's `session.json` (seal-verified) under the child's `parentSession` field for trace correlation and recursive parent traversal. `context_mode` declares the session's delivery context model: `"persistent"` opts into [reference delivery](#reference-delivery); omitted (or `"fresh"`) delivers full content on every call — the correct mode when disposable workers each execute in a fresh context. On resume, a supplied `context_mode` overwrites the recorded value. Fresh sessions start with the variable bag seeded from the workflow's declared `defaultValue`s, recorded as a `variables_seeded` history event (resumes never re-seed — the mutated bag is preserved); `dispatch_child` seeds each child's bag from the child workflow's own declarations the same way. Server restarts are transparent because state lives in `session.json` rather than in an agent-held token. |
| `get_workflow_status` | `session_index` | `status` (active/blocked/completed), `current_activity`, `completed_activities`, `last_checkpoint` info, `workflow`, and `parent` context | Checks the status of the current workflow session. `session_index` identifies the session. The returned `status` is one of `active`, `blocked`, or `completed`. `current_activity` names the activity the agent is executing. `completed_activities` lists all finished activities (from `session.json`). `last_checkpoint` contains the most recent checkpoint details. `workflow` reflects the current workflow metadata. If the session was created with a `parent_planning_slug`, the `parent` field contains the parent's session info derived from the `parentSession` snapshot. |
| `inspect_session` | `session_index`, `view?`, `child_index?`, `variable?` | A compact structured projection of the addressed session, selected by `view`, serialised as JSON text | Read-only inspection of a session's on-disk state. `view` selects the projection: `summary` (default, the composite of all below), `identity` (workflow/session/agent header + current position), `variables` (the variable bag), `checkpoints` (each checkpoint response as `optionId`, `respondedAt`, `variablesSet`), `activities` (`completed` / `skipped` / `current`), `history` (event `count`, a per-type `byType` tally, and the `milestones` sub-sequence), and `children` (a one-line digest per `triggeredWorkflows` child). `child_index` descends one positional level into the addressed session's `triggeredWorkflows[child_index].state` and projects that child instead (an out-of-range index returns the actionable `NOT_FOUND` message); deeper children are reached by passing that child's own `session_index`. `variable` — meaningful only with `view: variables` — narrows the result to a single key's value. The tool reads through the same sealed load path as every other tool (so it verifies integrity) but never mutates state, and is **not** gated on an active checkpoint — it is usable while the session is blocked, which is exactly when an orchestrator wants to look. It returns a shaped projection, never the raw `session.json`. |

### Workflow Tools

All require `session_index`. The workflow is determined from `session.json` (recorded at `start_session`). Each response includes the `session_index` and a validation result in `_meta`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_index` | The technique bundle, then lightweight workflow metadata | Loads the workflow structure for the current session. The response begins with the technique bundle — the resolved orchestrator techniques (the workflow's `techniques.workflow` plus the core orchestrator techniques), delivered as `techniques`, `rules`, and `unresolved`. A `---` separator precedes the workflow body, which is lightweight metadata: orchestrator `rules` (the flattened `rules.workflow` + `rules.universal`), `variables`, `initialActivity`, and activity stubs (id, name, required). Per-activity step detail and the worker-facing `rules.activity` / `techniques.activity` are delivered to workers via `get_activity`. The bundle gives the orchestrator immediate access to the techniques and rules it needs without separate `get_technique` calls. |
| `next_activity` | `session_index`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | `activity_id`, `name`, and trace token in `_meta` | Transitions from the current activity to the next activity in the workflow. This is the orchestrator's tool — it validates the transition (advisory: an out-of-graph transition warns in `_meta.validation`, it is not blocked), advances `session.json` (writing `session.json` and resealing `.session-token` atomically), and records the trace, but does NOT return the activity definition. `session_index` identifies the session. `activity_id` is the next activity to transition to — for the first call, use the `initialActivity` value from `get_workflow`; for subsequent calls, use an activity ID from the `transitions` field of the current activity's response. The optional `transition_condition` records the condition that triggered this transition; the server checks it against the declared condition text by exact string equality (warn-only — a paraphrase or `when`-spelling variant warns). The optional `step_manifest` provides a structured summary of completed steps from the previous activity, validated for completeness and order, and cross-checked (warn-only) against the `technique_fetched` and `technique_bundled` events recorded during the activity — see [Fidelity Observability](#fidelity-observability). The optional `activity_manifest` provides an advisory summary of all completed activities. The returned `activity_id` and `name` confirm the transition target. A `trace_token` in `_meta` captures the mechanical trace for the completed activity. **Hard gate:** Calling `next_activity` while a blocking checkpoint is active (`activeCheckpoint` set in `session.json`) produces a hard error. |
| `get_activity` | `session_index`, `context_tokens`, `bundle?` | The activity technique bundle, the workflow's inherited `activity_rules`, then the complete activity definition | Loads the complete activity definition for the current activity in the session. This is the worker's tool — call it after the orchestrator has called `next_activity` to transition. The response begins with the technique bundle, delivered as `techniques`, `rules`, and `unresolved`, separated from the activity body by `---`. The bundle resolves the workflow's `techniques.activity` (technique references inherited by EVERY activity) plus the activity's own `techniques[]` plus the core worker techniques — mirroring how `rules.activity` is inherited. The server then injects `activity_rules` — the workflow's `rules.activity` plus the dual-audience `rules.universal`, the worker-facing rules inherited by EVERY activity (workflow `rules.workflow` are orchestrator-only and never appear here). `session_index` identifies the session and determines the current activity from `session.json` (no `activity_id` parameter is needed). **`context_tokens` is REQUIRED** — the worker declares its own context window in tokens; the server derives an eager step-technique bundling budget from it (availability headroom × a token→char factor, both server config) and inlines the activity's ungated step-bound techniques that fit, in document order, under that budget. It is per-agent and per-call — never stored on the session, never defaulted; **omitting it is a validation error** (the call is rejected). The activity body includes all steps, checkpoints, loops, decisions, transitions, rules, and the activity's `techniques` references — everything needed to execute the activity. `bundle` overrides the delivery mode for the bundle and `activity_rules`: `"reference"` activates [reference delivery](#reference-delivery) for this call, `"full"` forces full delivery; when omitted, the mode follows the session's `context_mode` (`"persistent"` → reference, otherwise full). Eligible ungated step-bound techniques are inlined corpus-wide under a `step_techniques` map — see [Hybrid Technique Bundling](#hybrid-technique-bundling). When the activity contains constructs the server does not execute, the response also carries a short `enforcement_notes` block naming who acts — see [Enforcement Boundary](#enforcement-boundary). |
| `yield_checkpoint` | `session_index`, `checkpoint_id` | Status (`yielded` or `replayed`), and instructions | Yields execution to the orchestrator at a checkpoint step, or replays a prior response for the same key. `session_index` identifies the session and must have an active activity. `checkpoint_id` identifies the checkpoint: an exact match against a defined checkpoint id wins; otherwise the server matches on the base id (the portion before `#`), so an instance-qualified id `<baseId>#<instance>` (e.g. `dimension-confirmed#activity-list`) resolves to the single loop-body definition while recording under the full string. Responses are stored in `checkpointResponses` under `<activityId>-<checkpoint_id>`. If that key already has a response, the tool returns `status: "replayed"` with `resolved_option` / optional `effect` and does **not** set `activeCheckpoint` — the worker applies the effect and continues without yielding. On a fresh key, the server sets `activeCheckpoint` and returns `status: "yielded"`; the worker emits a `<checkpoint_yield>` block for the orchestrator. **Hard gate:** Cannot yield a new checkpoint while another checkpoint is already active in `session.json`. |
| `resume_checkpoint` | `session_index`, `checkpoint_handle` | Status and recorded effects | Resumes execution after the orchestrator resolves a checkpoint. `session_index` identifies the session and `checkpoint_handle` is the one-shot handle issued by `yield_checkpoint`. The server validates that the checkpoint has been resolved (i.e., `activeCheckpoint` is cleared in `session.json`) before allowing the worker to proceed, and returns the recorded variable effects. **Hard gate:** Cannot resume if `activeCheckpoint` is still set. |
| `present_checkpoint` | `checkpoint_handle` | Full checkpoint definition | Used by the orchestrator to load full checkpoint details from a worker's yielded `checkpoint_handle`. The server decodes the handle, looks up the active checkpoint recorded in `session.json`, and returns the checkpoint definition including the message to present to the user, available options with their effects, and auto-advance configuration. |
| `respond_checkpoint` | `checkpoint_handle`, `option_id?`, `auto_advance?`, `condition_not_met?` | Resolution status and any defined `effect` | Used by the orchestrator to resolve a yielded checkpoint. Exactly one resolution mode must be provided: `option_id` records the user's selected option (validated against the checkpoint definition, with a minimum response time enforced), `auto_advance` uses the checkpoint's `defaultOption` (only valid for non-blocking checkpoints after `autoAdvanceMs` elapses), or `condition_not_met` dismisses a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a `condition` field). The returned `effect` contains the state changes defined by the selected option, with per-effect enforcement: the server applies `setVariable` to the session variable bag (validated against the declared variable `type` warn-only — a mismatch is stored as written and surfaced in `_meta.validation`; `{name}` template passthroughs are exempt), records `skipActivities` in the session's `skippedActivities` bookkeeping, and returns `transitionTo` for the orchestrator to enact via `next_activity` (selecting the option does not itself move the session). The server clears `activeCheckpoint` from `session.json` and records the response under `checkpointResponses`. |

### Technique Tools

All require `session_index`. The workflow is determined from `session.json`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_technique` | `session_index`, `step_id?`, `full?` | Fully composed technique as YAML | Loads a single composed technique within the current workflow or activity. If called before `next_activity` (no current activity in session), it loads the workflow's first declared technique (the first entry of the workflow's `techniques.workflow`). If called during an activity, it resolves the technique reference from the activity definition; with `step_id`, it loads the technique assigned to that step; without `step_id`, the activity's first declared technique (the first entry of the activity's `techniques[]`). The returned technique is fully **composed**: it inherits its ancestor techniques' base contract recursively (inputs/outputs/rules merged; the ancestor's `Initial`/`Final` protocol blocks wrap the descendant protocol and the server renumbers). A step-bound fetch (`step_id` supplied) also annotates the binding seam: each of the technique's own inputs carries a `source:` stating where its value comes from under the name-match convention (step-binding value, workflow variable, prior step output, declared default — or `UNRESOLVED`, which additionally surfaces as a warn-only entry in `_meta.validation.warnings`); contract-inherited entries carry a `source:` only where it says something their scope note does not (a step-binding override, or a producer positioned later in the workflow). Each output the step binding remaps carries a `destination:` naming the session-bag name it lands under, and a `provenance_note` states the output delivery mechanics. Annotations are resolved statically from declarations and document order, so the annotated payload is deterministic for a given corpus and step. Techniques are loaded one at a time. In a session with `context_mode: "persistent"`, a refetch whose composed content is byte-identical to what the session+agent already received returns a short unchanged-reference (`delivery: unchanged` + `content_hash`) instead of the full payload — see [reference delivery](#reference-delivery); `full: true` forces full content for a context that no longer holds the earlier delivery. Every fetch (either delivery path) is recorded in the session history as a `technique_fetched` event — see [Fidelity Observability](#fidelity-observability). |
| `get_resource` | `session_index`, `resource_id`, `full?` | Resource content, id, version, and `session_index` (or an unchanged-reference under persistent mode) | Loads a resource's content by its slug. `session_index` identifies the session. `resource_id` is a text-only slug. Bare slugs (e.g., `"review-mode"`) resolve within the session's workflow. Prefixed cross-workflow references (e.g., `"meta/bootstrap-protocol"`) resolve from the named workflow. An optional `#section` anchor returns only that heading section. The returned content includes the resource body, an `id` field, and a `version` field. Under `context_mode: "persistent"`, a byte-identical refetch of the same `resource_id` (including any `#section`) returns `{ delivery: "unchanged", content_hash }` instead of the body; `full: true` forces full delivery. Each fetch is recorded in the session history as a `resource_fetched` event — see [Fidelity Observability](#fidelity-observability). |

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

1. Call `discover` to learn the pre-session bootstrap procedure (inlined from `meta/bootstrap-protocol`)
2. Fetch `workflow-server://schemas/workflow`, then call `start_session({ agent_id, planning_folder? })` to get a `session_index` (defaults to the `meta` workflow when no `workflow_id` is provided). Resuming a session uses the same call shape with the same planning folder. To start a session for a different workflow, pass `workflow_id`.
3. Call `get_workflow({ session_index })` to load the workflow structure. The response begins with the technique bundle (`techniques`, `rules`, `unresolved`), followed by activity stubs and `initialActivity`. Follow the bundle for ongoing delivery policy.
4. Optionally call `list_workflows` (no session required) when matching a user goal to a workflow id outside the meta discover-session path.
5. Call `next_activity({ session_index, activity_id: initialActivity })` to transition to the first activity (returns `activity_id` and `name` only)
6. Call `get_activity({ session_index })` to load the complete activity definition. The response begins with the technique bundle for the activity's `techniques[]` (`techniques`, `rules`, `unresolved`), followed by the raw activity body.
7. Execute the steps and protocol of each technique in the bundle from step 6.
8. Call `get_resource` for each resource a technique references when needed. Call `get_technique` to load a technique that is not already in the bundle.
9. When encountering a checkpoint step, call `yield_checkpoint`. On `status: "yielded"`, yield to the orchestrator and wait to be resumed via `resume_checkpoint`. On `status: "replayed"`, apply the returned effect and continue. For loop-body checkpoints that need a per-iteration decision, pass `<baseId>#<instance>` (see [Checkpoint Enforcement](#checkpoint-enforcement)).
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
- **Activity transition** — the requested activity is a valid transition from the activity recorded in `session.json` (advisory — an out-of-graph transition warns, it is not blocked)
- **Version drift** — the workflow version hasn't changed since the session started
- **Transition condition** — when `transition_condition` is provided, it is matched by exact string equality against the declared condition text (advisory; a paraphrase warns)
- **Step completion** — when `step_manifest` is provided, validates every ungated top-level step present, in declaration order, with non-empty outputs; `when`/`condition`-gated steps may be omitted and loop-body step ids are accepted but not required
- **Technique-fetch fidelity** — when `step_manifest` is provided, a manifested technique step with no `technique_fetched` or `technique_bundled` event recorded in the session history during the activity draws a warning (advisory) — see [Fidelity Observability](#fidelity-observability)
- **Activity manifest** — when `activity_manifest` is provided, validates activity IDs exist in the workflow (advisory)
- **Seal integrity** — `.session-token` is verified against `session.json` on every read (rejects tampered state)
- **Checkpoint gate** — when `activeCheckpoint` is set in `session.json`, most tools are hard-blocked until `respond_checkpoint` clears it

Warnings do not block execution — the tool still returns its result. They enable agent self-correction. All validation warnings are captured in the execution trace.

### Enforcement Boundary

The server is a state ledger and payload composer, not an executor. Three enforcement classes cover the whole API surface:

- **Engine-enforced (hard errors or state mutation):** session identity and seal verification; the active-checkpoint gate on content tools; checkpoint resolution — option validity, minimum response time, the `autoAdvanceMs` timer, replay of recorded responses — and the application of `setVariable` effects to the variable bag; load-time structure (schema validation, per-kind step contracts, step-id uniqueness, technique resolution and composition, artifact-contract synthesis).
- **Warn-only (`_meta.validation`):** transition legality, `initialActivity`-first, `transition_condition` text match, step and activity manifests, technique-fetch fidelity, version drift.
- **Agent-interpreted (never checked by the server):** step ordering and execution; all condition evaluation — `when`, `condition`, `breakCondition`, decision branches, transition conditions; loop mechanics and iteration bounds; `actions[]` verbs; technique protocols, input bindings, and output remaps; artifact writing; rule compliance.

  Variable `defaultValue`s are **not** agent-interpreted: the server seeds them into the variable bag at session start (`variables_seeded`), and a variable `type` is warn-only validated when a checkpoint's `setVariable` effect writes the bag (a mismatch is stored as written and surfaced in `_meta.validation`; see the `respond_checkpoint` row).

The single declarative path from a workflow definition into engine-held state is a checkpoint option's `setVariable` effect. Field-by-field classification lives in the [schema guide](../schemas/README.md#enforcement-model).

Because a payload-only reader cannot see this classification, `get_activity` surfaces the relevant slice on the wire: when the current activity contains agent-interpreted constructs, the response carries an `enforcement_notes` block (also in `_meta`). An `actions` note appears when a step is `kind:action` or carries an `actions[]` list (agent-executed — the server records the step but applies no verb and sets no variable from it); an `auto_advance` note appears when a checkpoint declares `autoAdvanceMs` (the timer is server-enforced on `respond_checkpoint { auto_advance: true }`, while `blocking` is an advisory directive). An activity without these constructs carries no block.

### Checkpoint Enforcement

When a worker encounters a checkpoint step during activity execution, it calls `yield_checkpoint`.

**Replay.** Recorded responses live in `session.json#checkpointResponses`, keyed by `<activityId>-<checkpoint_id>`. A second `yield_checkpoint` for the same key returns `status: "replayed"` with the stored option and reconstituted effect; `activeCheckpoint` is left unset. Workers continue under that decision (session resume, or intentional reuse of one answer across loop iterations). They must not call `present_checkpoint` or re-yield on a replay.

**Instance-qualified ids.** A checkpoint inside a loop is defined once but may be reached many times. Passing `<baseId>#<instance>` (separator `#`) resolves the definition via the base id while giving each iteration its own response key, so iteration 2+ is prompted instead of replaying iteration 1. Use a bare id when every iteration should share one decision.

On a fresh key, the server records `activeCheckpoint` in `session.json` and returns `status: "yielded"`. **Calling `next_activity` while `activeCheckpoint` is set produces a hard error** (not a warning). Most other tools are also gated while a checkpoint is active.

The worker yields control to the orchestrator via a `<checkpoint_yield>` block. To clear the gate, the orchestrator calls `respond_checkpoint`:

```json
{ "session_index": "...", "option_id": "proceed" }
```

Three resolution modes:

- **`option_id`** — the user's selected option. Validated against the checkpoint definition. Minimum response time enforced (default 3s since checkpoint issuance).
- **`auto_advance: true`** — use the checkpoint's `defaultOption`. Only valid for checkpoints that define both `defaultOption` and `autoAdvanceMs`; the server enforces the full `autoAdvanceMs` timer. The `blocking` field is an orchestrator directive (present and wait for the user) that the server does not consult here — a checkpoint intended to block must simply not declare `defaultOption`/`autoAdvanceMs`.
- **`condition_not_met: true`** — dismiss a conditional checkpoint whose condition evaluated to false (the agent evaluates the condition; the server checks only that the field exists). Only valid when the checkpoint has a structured `condition` field — a checkpoint gated with the inline `when` expression is **not** dismissible this way.

The response includes the effects from the selected option. Enforcement is per-effect: the server applies `setVariable` to the session variable bag, records `skipActivities` in `skippedActivities`, and returns `transitionTo` without acting on it — the orchestrator enacts the transition via `next_activity`. The server clears `activeCheckpoint`, and the orchestrator relays the effects back to the worker, which then calls `resume_checkpoint({ session_index })` to proceed.

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

Each entry's `output` is a short summary of what the step produced. A step with **more than one declared output** reports a JSON object keyed by output id (e.g. `{"reference_path": "lib/x", "component_name": "x"}`); the [technique-protocol spec §7.5](technique-protocol-specification.md) is the canonical statement, and a step-bound technique's `provenance_note` cites it at point of use.

The server validates (warn-only): every ungated top-level step present, relative declaration order preserved, non-empty outputs. A step gated by `when` or `condition` may be omitted — the agent evaluated the gate and skipped it. Loop-body step ids are accepted (report one entry per iteration if useful) but never required, since the iteration count is agent-determined and may be zero. A missing manifest triggers a warning. `step.required` is a worker hint the server does not consult.

The manifest is also cross-checked against fidelity observability: a manifested technique step whose technique was neither fetched nor delivered inline via a bundling activity during the activity draws a warning (see [Fidelity Observability](#fidelity-observability)).

### Fidelity Observability

The server records every content fetch in the session history (`session.json#history`):

- `get_technique` appends a `technique_fetched` event — the resolved technique id, the bound `step_id` when one was supplied, and the session's `agentId`, under the activity current at fetch time. Both delivery paths record: an unchanged-reference answer in persistent context mode is still a fetch.
- `get_activity` appends a `technique_bundled` event per step technique it delivers inline for a bundling activity (resolved technique id, `step_id`, agent) — see [Hybrid Technique Bundling](#hybrid-technique-bundling). Kept distinct from `technique_fetched` so the event stream separates agent-initiated fetches from server-pushed bundle deliveries. Both delivery paths record, as for fetches.
- `get_resource` appends a `resource_fetched` event (resource ref + agent). Observability only — the server cannot know which resources an activity requires, so no validation reads these events.

`next_activity` reads the `technique_fetched` and `technique_bundled` events when validating a `step_manifest`: a manifested technique step with no delivery recorded during the current activity visit (a loop-back revisit needs its own fetches) warns in `_meta.validation`. A step is covered by a step-bound fetch, by any fetch in the activity that resolved to the same technique operation — so one fetch covers several manifested steps bound to the same operation — or by an inline bundle delivery. The check is advisory, like all manifest validation: it surfaces silent degradation (steps reported complete without their technique content ever being loaded) without blocking execution.

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

### Reference Delivery

Full delivery on every call is the default: in disposable-worker topologies each `get_activity` lands in a fresh agent context, and the repeated bundle is load-bearing. A session in which a **single agent context** executes the whole walk can opt into reference delivery instead — content the session+agent has already received is replaced by a short marker rather than repeated.

- **Opt-in:** `start_session { context_mode: "persistent" }` (also accepted by `dispatch_child` for the child session), or per call via `get_activity { bundle: "reference" }`. The per-call opt-in exists only on `get_activity`; `get_technique` and `get_resource` delta mode follow the session's `context_mode`.
- **Ledger:** the server records a per-agent hash of every `get_activity` bundle technique, rules block, `activity_rules` block, full `get_technique` payload, full `get_resource` payload, and `get_workflow` orchestrator ops bundle it delivers (in `session.json#deliveredContent`, keyed by `agentId`). Recording happens in every mode, so a per-call `bundle: "reference"` can refer back to content delivered under the default full mode. Content keys are namespaced by delivery channel (`bundle:*`, `technique:*`, `activity_rules:*`, `workflow_bundle:*`, `resource:*`) so a marker only ever references content delivered in that same channel.
- **`get_workflow` ops-bundle slimming:** under `context_mode: "persistent"`, the orchestrator ops bundle (above the `---` separator) is content-keyed under `workflow_bundle:<hash>`; on a resume where this agent already holds it, the whole bundle collapses to a single `{ delivery: "unchanged", content_hash }` marker while the post-separator workflow summary stays full. Fresh/default sessions always receive the ops bundle in full.
- **`get_activity` reference mode:** the response carries `bundle_mode: reference` plus a `bundle_note`; each bundle technique whose composed content is byte-identical to a prior delivery collapses to `{ delivery: "unchanged", content_hash }`, as do the `rules` and `activity_rules` blocks. Techniques new to the activity (or whose content changed) arrive in full, and within a full eagerly-inlined `step_techniques` entry the shared contract/rules blocks may themselves be markers (see Block-level delivery below). The activity body itself is always delivered.
- **`get_technique` delta mode:** active when the session's `context_mode` is `"persistent"`; a byte-identical refetch returns `delivery: unchanged` + `content_hash` instead of the composed technique. Step-bound provenance annotations (`source:`/`destination:`) are part of the composed content; they are static per corpus and step, so a same-step refetch stays byte-identical and collapses, while fetching the same op from a *different* step (different binding context) re-delivers in full rather than answering with a stale reference.
- **`get_resource` delta mode:** active when the session's `context_mode` is `"persistent"`; a byte-identical refetch of the same `resource_id` returns `delivery: unchanged` + `content_hash` instead of the body. The ledger key is the exact caller `resource_id`, including any `#section` anchor, so `pr-description` and `pr-description#templates` are independent slots. Fresh/default sessions always receive the full resource body.
- **Block-level delivery:** finer-grained than the whole-technique collapse above. A not-yet-seen technique's shared blocks — the contract-inherited `inherited_inputs` / `inherited_outputs` and the merged `rules` — are content-keyed individually (`technique:<block>:<hash>`). When such a block was already delivered by a sibling technique that shares the workflow contract, it collapses to a `{ delivery: "unchanged", content_hash }` marker at its position in the payload while the technique-specific core stays full. This applies on both the `get_technique` full-delivery path and each eagerly-inlined `get_activity` `step_techniques` entry. Content-keying keeps it stale-free: a block annotated with binding-seam provenance hashes differently and correctly delivers in full. `get_technique { full: true }` / `get_activity { bundle: "full" }` re-deliver every block.
- **Full-content escapes:** `get_activity { bundle: "full" }`, `get_technique { full: true }`, and `get_resource { full: true }` force full delivery — use them when the calling context no longer holds the earlier payload (e.g. it was summarized away).
- **Agent scoping:** the ledger is keyed by the session's recorded `agentId`; resuming a session under a different `agent_id` starts that agent from an empty ledger, so its first deliveries are full even in reference mode.
- **Benchmark:** to compare fresh vs persistent delivery cost on a fixed `work-package` walk, run `npm run bench:token` ([`scripts/run-token-benchmark.ts`](../scripts/run-token-benchmark.ts); see [development.md](development.md#token-delivery-benchmark)).

### Hybrid Technique Bundling

Eager step-technique bundling is **automatic and corpus-wide**: `get_activity` inlines the composed content of every activity's small, ungated step-bound techniques under a `step_techniques` map, so those steps execute without a fetch round-trip. There is no per-activity opt-in — the worker's REQUIRED `context_tokens` sizes the bundle.

- **Budget:** the eager-delivery budget is a **cumulative per-activity character budget** = `context_tokens × headroomFraction × charsPerToken`, where `headroomFraction` (default 0.80) and `charsPerToken` (default 4) are server config (env-overridable: `BUNDLE_HEADROOM_FRACTION`, `BUNDLE_CHARS_PER_TOKEN`). The budget accounts for **technique body sizes only** — a technique's `resources[]` references count, but not the resolved content of those resources (resources are never inlined; see below). Ungated technique steps are inlined in document order until adding the next would overflow the budget; the remainder stay lazy.
- **What is bundled:** each ungated technique-kind step, in document order, until the cumulative budget is exhausted. A `when`/`condition` on the step itself or on an enclosing loop keeps it lazy, so bundling never delivers content for a step that may not execute. A per-activity `bundleTechniques: { maxChars: <n> }` is an explicit **per-technique size cap** layered on the budget (any single technique larger than `maxChars` stays lazy); `maxChars: 0` opts the activity out of eager bundling entirely. Everything not inlined remains a `get_technique { step_id }` fetch.
- **Resources stay lazy:** bundling inlines step **techniques only**, never their referenced resources. An inlined entry carries the technique's `resources[]` references exactly as a `get_technique` fetch does, but the worker still calls `get_resource { resource_id }` on demand for each one. Resources are frequently shared across techniques, so inlining them per-technique would duplicate content. Leaving `get_resource` lazy also preserves it as a purposeful call.
- **Response shape:** bundled entries arrive in the ops section under `step_techniques`, keyed by step id. Each entry leads with a discrete `▼ STEP <step_id> · technique <name>` arrival marker, then the step's full composition — activity-group resolution, ancestor contract, inherited-input blocks, and binding-seam provenance annotations — identical to what the step-bound `get_technique` fetch returns. A `step_techniques_note` prescribes the deliberate in-order engagement (below) and states that steps absent from the map still require a fetch, and `_meta.bundled_steps` lists the bundled step ids.
- **Intentional stepping:** the *act* of calling `get_technique` is a deliberate "I now turn to this step" beat. Inlining removes that call, so the worker substitutes for it: process inlined `step_techniques` strictly in step order and, on reaching each step, EMIT a one-line `▶ step <step_id>` begin-beat before executing it. That emitted beat carries the intentional act and **is** the stepwise observability trace for bundled steps — the worker does NOT ping the server per bundled step; the delivery-time `technique_bundled` events already record coverage.
- **Ledger interplay:** bundled entries share the `technique:<resolvedId>` ledger key with `get_technique`, so in a persistent-context session a bundled delivery collapses a later step-bound refetch to an unchanged-reference — and reference-mode re-delivery of the activity collapses already-delivered bundled entries to `{ delivery: "unchanged", content_hash }` markers (the `▼ STEP` marker rides along). `bundle: "full"` re-delivers everything.
- **Fidelity:** each bundled step is recorded as a `technique_bundled` history event and counts as delivery coverage for `next_activity`'s manifest fidelity check — see [Fidelity Observability](#fidelity-observability).

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
