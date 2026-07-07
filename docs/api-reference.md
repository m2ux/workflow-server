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
| `start_session` | `agent_id`, `workflow_id?`, `planning_slug?`, `parent_planning_slug?`, `context_mode?` | `session_index`, `planning_slug`, workflow info | Starts a new session or resumes an existing one, optionally with a parent for nested-workflow dispatch. **Fresh sessions default to the `meta` workflow** when no `workflow_id` is provided. `agent_id` sets the recorded agent identity in `session.json`, distinguishing orchestrator from worker calls in the trace. `planning_slug` is a single-segment slug for the planning folder under `<workspace>/.engineering/artifacts/planning/<slug>/`; it determines where `session.json` and the sealed `.session-token` live and deterministically derives the 6-character base32 `session_index`. When `planning_slug` is omitted, the server mints a transitional slug. To **resume** a session, pass the same `planning_slug` again — the server loads the existing `session.json`, verifies the seal, and returns the same `session_index`. For **nested dispatch**, also pass `parent_planning_slug`; the server snapshots the parent's `session.json` (seal-verified) under the child's `parentSession` field for trace correlation and recursive parent traversal. `context_mode` declares the session's delivery context model: `"persistent"` opts into [reference delivery](#reference-delivery); omitted (or `"fresh"`) delivers full content on every call — the correct mode when disposable workers each execute in a fresh context. On resume, a supplied `context_mode` overwrites the recorded value. Fresh sessions start with the variable bag seeded from the workflow's declared `defaultValue`s, recorded as a `variables_seeded` history event (resumes never re-seed — the mutated bag is preserved); `dispatch_child` seeds each child's bag from the child workflow's own declarations the same way. Server restarts are transparent because state lives in `session.json` rather than in an agent-held token. |
| `get_workflow_status` | `session_index` | `status` (active/blocked/completed), `current_activity`, `completed_activities`, `last_checkpoint` info, `workflow`, and `parent` context | Checks the status of the current workflow session. `session_index` identifies the session. The returned `status` is one of `active`, `blocked`, or `completed`. `current_activity` names the activity the agent is executing. `completed_activities` lists all finished activities (from `session.json`). `last_checkpoint` contains the most recent checkpoint details. `workflow` reflects the current workflow metadata. If the session was created with a `parent_planning_slug`, the `parent` field contains the parent's session info derived from the `parentSession` snapshot. |

### Workflow Tools

All require `session_index`. The workflow is determined from `session.json` (recorded at `start_session`). Each response includes the `session_index` and a validation result in `_meta`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_index` | The technique bundle, then lightweight workflow metadata | Loads the workflow structure for the current session. The response begins with the technique bundle — the resolved orchestrator techniques (the workflow's `techniques.workflow` plus the core orchestrator techniques), delivered as `techniques`, `rules`, and `unresolved`. A `---` separator precedes the workflow body, which is lightweight metadata: orchestrator `rules` (the flattened `rules.workflow` + `rules.universal`), `variables`, `initialActivity`, and activity stubs (id, name, required). Per-activity step detail and the worker-facing `rules.activity` / `techniques.activity` are delivered to workers via `get_activity`. The bundle gives the orchestrator immediate access to the techniques and rules it needs without separate `get_technique` calls. |
| `next_activity` | `session_index`, `activity_id`, `transition_condition?`, `step_manifest?`, `activity_manifest?` | `activity_id`, `name`, and trace token in `_meta` | Transitions from the current activity to the next activity in the workflow. This is the orchestrator's tool — it validates the transition (advisory: an out-of-graph transition warns in `_meta.validation`, it is not blocked), advances `session.json` (writing `session.json` and resealing `.session-token` atomically), and records the trace, but does NOT return the activity definition. `session_index` identifies the session. `activity_id` is the next activity to transition to — for the first call, use the `initialActivity` value from `get_workflow`; for subsequent calls, use an activity ID from the `transitions` field of the current activity's response. The optional `transition_condition` records the condition that triggered this transition; the server checks it against the declared condition text by exact string equality (warn-only — a paraphrase or `when`-spelling variant warns). The optional `step_manifest` provides a structured summary of completed steps from the previous activity, validated for completeness and order, and cross-checked (warn-only) against the `technique_fetched` events recorded during the activity — see [Fidelity Observability](#fidelity-observability). The optional `activity_manifest` provides an advisory summary of all completed activities. The returned `activity_id` and `name` confirm the transition target. A `trace_token` in `_meta` captures the mechanical trace for the completed activity. **Hard gate:** Calling `next_activity` while a blocking checkpoint is active (`activeCheckpoint` set in `session.json`) produces a hard error. |
| `get_activity` | `session_index`, `bundle?` | The activity technique bundle, the workflow's inherited `activity_rules`, then the complete activity definition | Loads the complete activity definition for the current activity in the session. This is the worker's tool — call it after the orchestrator has called `next_activity` to transition. The response begins with the technique bundle, delivered as `techniques`, `rules`, and `unresolved`, separated from the activity body by `---`. The bundle resolves the workflow's `techniques.activity` (technique references inherited by EVERY activity) plus the activity's own `techniques[]` plus the core worker techniques — mirroring how `rules.activity` is inherited. The server then injects `activity_rules` — the workflow's `rules.activity` plus the dual-audience `rules.universal`, the worker-facing rules inherited by EVERY activity (workflow `rules.workflow` are orchestrator-only and never appear here). `session_index` identifies the session and determines the current activity from `session.json` (no `activity_id` parameter is needed). The activity body includes all steps, checkpoints, loops, decisions, transitions, rules, and the activity's `techniques` references — everything needed to execute the activity. `bundle` overrides the delivery mode for the bundle and `activity_rules`: `"reference"` activates [reference delivery](#reference-delivery) for this call, `"full"` forces full delivery; when omitted, the mode follows the session's `context_mode` (`"persistent"` → reference, otherwise full). |
| `yield_checkpoint` | `session_index`, `checkpoint_id` | Status, `checkpoint_handle`, and instructions | Yields execution to the orchestrator at a checkpoint step. `session_index` identifies the session and must have an active activity. `checkpoint_id` identifies the checkpoint to yield (must match a checkpoint defined in the current activity). The server records the active checkpoint in `session.json` (`activeCheckpoint`) and returns a one-shot opaque `checkpoint_handle` the worker yields to the orchestrator via a `<checkpoint_yield>` block. **Hard gate:** Cannot yield a new checkpoint while another checkpoint is already active in `session.json`. |
| `resume_checkpoint` | `session_index`, `checkpoint_handle` | Status and recorded effects | Resumes execution after the orchestrator resolves a checkpoint. `session_index` identifies the session and `checkpoint_handle` is the one-shot handle issued by `yield_checkpoint`. The server validates that the checkpoint has been resolved (i.e., `activeCheckpoint` is cleared in `session.json`) before allowing the worker to proceed, and returns the recorded variable effects. **Hard gate:** Cannot resume if `activeCheckpoint` is still set. |
| `present_checkpoint` | `checkpoint_handle` | Full checkpoint definition | Used by the orchestrator to load full checkpoint details from a worker's yielded `checkpoint_handle`. The server decodes the handle, looks up the active checkpoint recorded in `session.json`, and returns the checkpoint definition including the message to present to the user, available options with their effects, and auto-advance configuration. |
| `respond_checkpoint` | `checkpoint_handle`, `option_id?`, `auto_advance?`, `condition_not_met?` | Resolution status and any defined `effect` | Used by the orchestrator to resolve a yielded checkpoint. Exactly one resolution mode must be provided: `option_id` records the user's selected option (validated against the checkpoint definition, with a minimum response time enforced), `auto_advance` uses the checkpoint's `defaultOption` (only valid for non-blocking checkpoints after `autoAdvanceMs` elapses), or `condition_not_met` dismisses a conditional checkpoint whose condition evaluated to false (only valid when the checkpoint has a `condition` field). The returned `effect` contains the state changes defined by the selected option, with per-effect enforcement: the server applies `setVariable` to the session variable bag (validated against the declared variable `type` warn-only — a mismatch is stored as written and surfaced in `_meta.validation`; `{name}` template passthroughs are exempt), records `skipActivities` in the session's `skippedActivities` bookkeeping, and returns `transitionTo` for the orchestrator to enact via `next_activity` (selecting the option does not itself move the session). The server clears `activeCheckpoint` from `session.json` and records the response under `checkpointResponses`. |

### Technique Tools

All require `session_index`. The workflow is determined from `session.json`.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_technique` | `session_index`, `step_id?`, `full?` | Fully composed technique as YAML | Loads a single composed technique within the current workflow or activity. If called before `next_activity` (no current activity in session), it loads the workflow's first declared technique (the first entry of the workflow's `techniques.workflow`). If called during an activity, it resolves the technique reference from the activity definition; with `step_id`, it loads the technique assigned to that step; without `step_id`, the activity's first declared technique (the first entry of the activity's `techniques[]`). The returned technique is fully **composed**: it inherits its ancestor techniques' base contract recursively (inputs/outputs/rules merged; the ancestor's `Initial`/`Final` protocol blocks wrap the descendant protocol and the server renumbers). A step-bound fetch (`step_id` supplied) also annotates the binding seam: each of the technique's own inputs carries a `source:` stating where its value comes from under the name-match convention (step-binding value, workflow variable, prior step output, declared default — or `UNRESOLVED`, which additionally surfaces as a warn-only entry in `_meta.validation.warnings`); contract-inherited entries carry a `source:` only where it says something their scope note does not (a step-binding override, or a producer positioned later in the workflow). Each output the step binding remaps carries a `destination:` naming the session-bag name it lands under, and a `provenance_note` states the output delivery mechanics. Annotations are resolved statically from declarations and document order, so the annotated payload is deterministic for a given corpus and step. Techniques are loaded one at a time. In a session with `context_mode: "persistent"`, a refetch whose composed content is byte-identical to what the session+agent already received returns a short unchanged-reference (`delivery: unchanged` + `content_hash`) instead of the full payload — see [reference delivery](#reference-delivery); `full: true` forces full content for a context that no longer holds the earlier delivery. Every fetch (either delivery path) is recorded in the session history as a `technique_fetched` event — see [Fidelity Observability](#fidelity-observability). |
| `get_resource` | `session_index`, `resource_id` | Resource content, id, version, and `session_index` | Loads a resource's full content by its slug. `session_index` identifies the session. `resource_id` is a text-only slug. Bare slugs (e.g., `"review-mode"`) resolve within the session's workflow. Prefixed cross-workflow references (e.g., `"meta/bootstrap-protocol"`) resolve from the named workflow. The returned content includes the resource body, an `id` field, and a `version` field. Each fetch is recorded in the session history as a `resource_fetched` event — see [Fidelity Observability](#fidelity-observability). |

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
- **Activity transition** — the requested activity is a valid transition from the activity recorded in `session.json` (advisory — an out-of-graph transition warns, it is not blocked)
- **Version drift** — the workflow version hasn't changed since the session started
- **Transition condition** — when `transition_condition` is provided, it is matched by exact string equality against the declared condition text (advisory; a paraphrase warns)
- **Step completion** — when `step_manifest` is provided, validates every ungated top-level step present, in declaration order, with non-empty outputs; `when`/`condition`-gated steps may be omitted and loop-body step ids are accepted but not required
- **Technique-fetch fidelity** — when `step_manifest` is provided, a manifested technique step with no `technique_fetched` event recorded in the session history during the activity draws a warning (advisory) — see [Fidelity Observability](#fidelity-observability)
- **Activity manifest** — when `activity_manifest` is provided, validates activity IDs exist in the workflow (advisory)
- **Seal integrity** — `.session-token` is verified against `session.json` on every read (rejects tampered state)
- **Checkpoint gate** — when `activeCheckpoint` is set in `session.json`, most tools are hard-blocked until `respond_checkpoint` clears it

Warnings do not block execution — the tool still returns its result. They enable agent self-correction. All validation warnings are captured in the execution trace.

### Enforcement Boundary

The server is a state ledger and payload composer, not an executor. Three enforcement classes cover the whole API surface:

- **Engine-enforced (hard errors or state mutation):** session identity and seal verification; the active-checkpoint gate on content tools; checkpoint resolution — option validity, minimum response time, the `autoAdvanceMs` timer, replay of recorded responses — and the application of `setVariable` effects to the variable bag; load-time structure (schema validation, per-kind step contracts, step-id uniqueness, technique resolution and composition, artifact-contract synthesis).
- **Warn-only (`_meta.validation`):** transition legality, `initialActivity`-first, `transition_condition` text match, step and activity manifests, technique-fetch fidelity, version drift.
- **Agent-interpreted (never checked by the server):** step ordering and execution; all condition evaluation — `when`, `condition`, `breakCondition`, decision branches, transition conditions; loop mechanics and iteration bounds; `actions[]` verbs; variable types and defaults; technique protocols, input bindings, and output remaps; artifact writing; rule compliance.

The single declarative path from a workflow definition into engine-held state is a checkpoint option's `setVariable` effect. Field-by-field classification lives in the [schema guide](../schemas/README.md#enforcement-model).

### Checkpoint Enforcement

When a worker encounters a checkpoint step during activity execution, it calls `yield_checkpoint`. The server records `activeCheckpoint` in `session.json` and returns a one-shot `checkpoint_handle`. **Calling `next_activity` while `activeCheckpoint` is set produces a hard error** (not a warning). Most other tools are also gated while a checkpoint is active.

The worker yields the `checkpoint_handle` to the orchestrator. To clear the gate, the orchestrator calls `respond_checkpoint` using the handle:

```json
{ "checkpoint_handle": "...", "option_id": "proceed" }
```

Three resolution modes:

- **`option_id`** — the user's selected option. Validated against the checkpoint definition. Minimum response time enforced (default 3s since checkpoint issuance).
- **`auto_advance: true`** — use the checkpoint's `defaultOption`. Only valid for checkpoints that define both `defaultOption` and `autoAdvanceMs`; the server enforces the full `autoAdvanceMs` timer. The `blocking` field is an orchestrator directive (present and wait for the user) that the server does not consult here — a checkpoint intended to block must simply not declare `defaultOption`/`autoAdvanceMs`.
- **`condition_not_met: true`** — dismiss a conditional checkpoint whose condition evaluated to false (the agent evaluates the condition; the server checks only that the field exists). Only valid when the checkpoint has a structured `condition` field — a checkpoint gated with the inline `when` expression is **not** dismissible this way.

The response includes the effects from the selected option. Enforcement is per-effect: the server applies `setVariable` to the session variable bag, records `skipActivities` in `skippedActivities`, and returns `transitionTo` without acting on it — the orchestrator enacts the transition via `next_activity`. The server clears `activeCheckpoint`, and the orchestrator relays the effects back to the worker, which then calls `resume_checkpoint({ session_index, checkpoint_handle })` to proceed.

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

The server validates (warn-only): every ungated top-level step present, relative declaration order preserved, non-empty outputs. A step gated by `when` or `condition` may be omitted — the agent evaluated the gate and skipped it. Loop-body step ids are accepted (report one entry per iteration if useful) but never required, since the iteration count is agent-determined and may be zero. A missing manifest triggers a warning. `step.required` is a worker hint the server does not consult.

The manifest is also cross-checked against fidelity observability: a manifested technique step whose technique was never fetched during the activity draws a warning (see [Fidelity Observability](#fidelity-observability)).

### Fidelity Observability

The server records every content fetch in the session history (`session.json#history`):

- `get_technique` appends a `technique_fetched` event — the resolved technique id, the bound `step_id` when one was supplied, and the session's `agentId`, under the activity current at fetch time. Both delivery paths record: an unchanged-reference answer in persistent context mode is still a fetch.
- `get_resource` appends a `resource_fetched` event (resource ref + agent). Observability only — the server cannot know which resources an activity requires, so no validation reads these events.

`next_activity` reads the `technique_fetched` events when validating a `step_manifest`: a manifested technique step with no fetch recorded during the current activity visit (a loop-back revisit needs its own fetches) warns in `_meta.validation`. A step is covered by a step-bound fetch or by any fetch in the activity that resolved to the same technique operation — so one fetch covers several manifested steps bound to the same operation. The check is advisory, like all manifest validation: it surfaces silent degradation (steps reported complete without their technique content ever being loaded) without blocking execution.

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

- **Opt-in:** `start_session { context_mode: "persistent" }` (also accepted by `dispatch_child` for the child session), or per call via `get_activity { bundle: "reference" }`. The per-call opt-in exists only on `get_activity`; `get_technique` delta mode follows the session's `context_mode`.
- **Ledger:** the server records a per-agent hash of every `get_activity` bundle technique, rules block, `activity_rules` block, and full `get_technique` payload it delivers (in `session.json#deliveredContent`, keyed by `agentId`). Recording happens in every mode, so a per-call `bundle: "reference"` can refer back to content delivered under the default full mode. `get_workflow`'s orchestrator bundle is outside the ledger and always delivered in full.
- **`get_activity` reference mode:** the response carries `bundle_mode: reference` plus a `bundle_note`; each bundle technique whose composed content is byte-identical to a prior delivery collapses to `{ unchanged: true, content_hash }`, as do the `rules` and `activity_rules` blocks. Techniques new to the activity (or whose content changed) arrive in full. The activity body itself is always delivered.
- **`get_technique` delta mode:** active when the session's `context_mode` is `"persistent"`; a byte-identical refetch returns `delivery: unchanged` + `content_hash` instead of the composed technique. Step-bound provenance annotations (`source:`/`destination:`) are part of the composed content; they are static per corpus and step, so a same-step refetch stays byte-identical and collapses, while fetching the same op from a *different* step (different binding context) re-delivers in full rather than answering with a stale reference.
- **Full-content escapes:** `get_activity { bundle: "full" }` and `get_technique { full: true }` force full delivery — use them when the calling context no longer holds the earlier payload (e.g. it was summarized away).
- **Agent scoping:** the ledger is keyed by the session's recorded `agentId`; resuming a session under a different `agent_id` starts that agent from an empty ledger, so its first deliveries are full even in reference mode.

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
