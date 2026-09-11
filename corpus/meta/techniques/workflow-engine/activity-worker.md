---
metadata:
  version: 1.7.0
---

## Capability

Worker for a dispatched activity — executes bound steps, yields checkpoints, and walks on to the next activity while its batch has room.

## Inputs

### session_index

Stable session index for every authenticated tool call.

### workflow_id

Workflow the worker is executing an activity for.

### activity_id

Activity id the worker's current dispatch or continuation bound — must match the activity returned by `get_activity`.

### effects

*(optional)* Variable updates carried by a checkpoint this context yielded and the orchestrator has since resolved. Present only on a continuation, and its presence is what distinguishes one from a first dispatch.

### agent_id

Worker agent identity for this dispatch.

## Protocol

### 1. Verify dispatch

- Confirm the activity `id` on the `get_activity` response whose operations bundle delivered this technique equals `{activity_id}` per [verify-dispatched-activity](#verify-dispatched-activity)
- Follow the operations bundle and delivery notes on that same response (`step_techniques_note`, `resources_note`, reference-mode notes)
- Read `may_continue` from the `batch:` block leading that response — this context's standing against its bound ([batch-ends-where-the-server-says](#batch-ends-where-the-server-says))

### 2. Load resources

- Load resources per [resource-loading-via-tool](./TECHNIQUE.md#resource-loading-via-tool)
- Use [force-full-after-summarization](./TECHNIQUE.md#force-full-after-summarization) when this context no longer holds prior deliveries

### 3. Execute steps

- When `{effects}` is bound, this context is continuing past a gate it yielded rather than opening the activity: apply [resume-from-checkpoint](./resume-from-checkpoint.md), then carry on from the paused step rather than the first. The remaining steps and the envelope below are owed either way — a gate pauses the walk, it does not end it
- Read the artifact each bound artifact-path input names before the step that consumes it — the dispatch stub carries identity bindings only, never artifact content
- Execute each activity step in document order
- For `kind: technique` steps, load the bound operation on reach per [progressive-step-technique-load](#progressive-step-technique-load)
- Apply each bound operation via [variable-binding](../variable-binding.md)
- Honor `when:` gates against the variable bag, evaluating each expression as the activity schema's `when` field defines it; an expression that does not parse does not run its step
- When a step reaches a checkpoint, apply [yield-checkpoint](./yield-checkpoint.md)
- When the last step completes, apply [finalize-activity](./finalize-activity.md), passing the `may_continue` read in step 1 as `batch_may_continue`

## Rules

### follow-bundled-rules

Follow the rules in [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically. Every rule in `agent-conduct` is one a worker can honour; the orchestrator's boundaries live in [orchestrator-conduct](../orchestrator-conduct.md) and are not a worker's to read.

### worker-control-plane-ban

Never call the workflow-server control-plane tools `next_activity` or `get_workflow` against `{session_index}` — the session this worker was dispatched for, whose pointer the orchestrator owns. A further activity arrives here the way the first one did: as a stub naming it. Until a stub names one there is no next activity to act on, so never issue its `get_activity` on your own initiative.

A workflow this worker launches is a session of its own, with no other owner: driving that one is [workflow-engine](./TECHNIQUE.md)::[handle-sub-workflow](./handle-sub-workflow.md)::[solo-walk-the-child](./handle-sub-workflow.md#solo-walk-the-child).

### one-activity-at-a-time-in-a-batch

Return each activity's `activity_complete` envelope as it finishes per [finalize-activity](./finalize-activity.md) — a batch defers nothing to its end. An activity finished but not yet reported is work nothing outside this context knows about, so it is lost with the context. Reporting each one as it lands is what keeps a lost context to the cost of one activity.

### agent-id-on-delivery-calls

Every `get_activity`, `get_technique` and `get_resource` call this worker makes carries `{agent_id}`, the identity its ledger is keyed on ([agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)). A first dispatch holds no prior deliveries and takes full delivery; every call after it under that same identity carries `bundle: "reference"`, whether it resumes the activity this context holds or takes the next activity of its batch, so content this context already holds arrives as unchanged markers.

### outlive-dispatched-children

While a step of this activity holds work still running outside this context — an agent it dispatched, a task it armed a completion signal on — the activity is not finished, so stay live until every one of them has returned. A completion signal armed on that work is delivered to the context that armed it, so a context that has ended leaves the signal with nowhere to land and the result it carried unread.

### final-message-is-an-envelope

The last thing this context emits is the envelope this activity owes — the `checkpoint_pending` yield, or the `activity_complete` result. Anything emitted in its place ends the context with the envelope still owed, and is not an accepted result ([reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result)).

### verify-dispatched-activity

Before executing any step, confirm the activity `id` returned by the `get_activity` call your current stub instructed — not an earlier response this context still holds — equals the `{activity_id}` that dispatch or continuation bound. A worker carrying a batch re-checks this on every activity of the run, against the id the continuation named rather than the id the run opened with. On mismatch, STOP — execute no steps — and report a pointer mismatch (expected vs returned), which is the whole of the remedy available from here. Do not proceed on the wrong activity.

### progressive-step-technique-load

A step's bound technique loads as that step is reached; the whole activity is never pre-fetched. `get_technique { session_index, step_id }` serves steps not already inlined, and where `get_activity` carries `step_techniques` or a sibling `resources` map, those response notes govern — begin-beat, reuse map, lazy remainder — rather than bundling policy re-derived in prose. An inlined step is read from the bundle; re-fetching it pays the round trip for content the response already delivered ([fetch-costs-what-it-delivers](./TECHNIQUE.md#fetch-costs-what-it-delivers)).

### batch-ends-where-the-server-says

Each `get_activity` opens with a `batch:` block reporting how many activities this context has taken, what it has been delivered, its two limits, and whether it may take another; `_meta.batch` carries the same reading. On `may_continue: false`, finish the current activity and report it — do not ask for a further one. If you do ask, the server refuses with the payload undelivered: report that activity as needing its own dispatch and stop.
