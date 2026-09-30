---
metadata:
  version: 1.12.0
---

## Capability

Worker for a dispatched activity — executes bound steps, yields checkpoints, and walks on to the next activity while its batch has room.

## Inputs

### workflow_id

Workflow the worker is executing an activity for.

### agent_id

Worker agent identity for this dispatch.

## Protocol

### 1. Verify dispatch

- Confirm the activity `id` on the `get_activity` response whose techniques bundle delivered this technique equals `{activity_id}` per `verify-dispatched-activity`
- Follow the techniques bundle and delivery notes on that same response (`step_techniques_note`, `resources_note`, reference-mode notes)
- Read `may_continue` from the `batch:` block closing that response — this context's standing against its bound (`batch-ends-where-the-server-says`)

### 2. Load resources

- Load resources per `resource-loading-via-tool`
- Use `force-full-after-summarization` when this context no longer holds prior deliveries

### 3. Take the walk position

- Open the activity at its first step
  > When `{checkpoint_reply}` is bound, this context is continuing past a gate it yielded: apply [resume-from-checkpoint](./resume-from-checkpoint.md) in place of opening at the first step. The envelope is owed either way.

### 4. Execute steps

- Execute each activity step in document order
- Read the artifact each bound artifact-path input names before the step that consumes it
- For `kind: technique` steps, load the bound technique on reach per `progressive-step-technique-load`
- Apply each bound technique via [variable-binding](../variable-binding.md)
- Honor `when:` gates against the variable bag per `gate-evaluation`, and a loop's controls per `loop-control`
- When a step reaches a checkpoint, apply [yield-checkpoint](./yield-checkpoint.md)

### 5. Finalize the activity

- When the last step completes, or a checkpoint's exit ends the activity, apply [finalize-activity](./finalize-activity.md), passing the steps this activity ran as `steps_completed`, the checkpoints it answered as `checkpoints_responded`, the artifacts it wrote as `artifacts_produced`, the `{selected_exit}` a checkpoint answer held, where one did, and the `may_continue` this context's standing reports (`batch-ends-where-the-server-says`) as `batch_may_continue`

## Rules

### follow-bundled-rules

Follow the rules in [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically. Every rule in `agent-conduct` is one a worker can honour.

### worker-control-plane-ban

Never call the workflow-server control-plane tools `next_activity` or `get_workflow` against `{session_index}` — the session this worker was dispatched for, whose pointer the orchestrator owns. A further activity arrives here the way the first one did: as a stub naming it. Until a stub names one there is no next activity to act on, so never issue its `get_activity` on your own initiative.

A workflow this worker launches is a session of its own, with no other owner: driving that one is [workflow-engine](./TECHNIQUE.md)::`handle-sub-workflow.solo-walk-the-child`.

### one-activity-at-a-time-in-a-batch

Return each activity's `activity_complete` envelope as it finishes per [finalize-activity](./finalize-activity.md) — a batch defers nothing to its end.

### agent-id-on-delivery-calls

Every `get_activity`, `get_technique` and `get_resource` call this worker makes carries `{agent_id}`, the identity its ledger is keyed on (`agent-id-scopes-delivery`). A first dispatch holds no prior deliveries and takes full delivery; every call after it under that same identity carries `bundle: "reference"`, whether it resumes the activity this context holds or takes the next activity of its batch, so content this context already holds arrives as unchanged markers.

### outlive-dispatched-children

While a step of this activity holds work still running outside this context — an agent it dispatched, a task it armed a completion signal on — the activity is not finished, so stay live until every one of them has returned.

### final-message-is-an-envelope

The last thing this context emits is the envelope this activity owes — the `checkpoint_pending` yield, or the `activity_complete` result. Anything emitted in its place ends the context with the envelope still owed, and is not an accepted result: an interim status report, a progress table, or prose describing an envelope without being one.

### verify-dispatched-activity

Before executing any step, confirm the activity `id` returned by the `get_activity` call your current stub instructed — not an earlier response this context still holds — equals the `{activity_id}` that dispatch or continuation bound. A worker carrying a batch re-checks this on every activity of the run, against the id the continuation named rather than the id the run opened with. On mismatch, STOP — execute no steps — and report a pointer mismatch (expected vs returned). Do not proceed on the wrong activity.

### progressive-step-technique-load

A step's bound technique loads as that step is reached; the whole activity is never pre-fetched. `get_technique { session_index, step_id }` serves steps not already inlined, and where `get_activity` carries `step_techniques` or a sibling `resources` map, those response notes govern — begin-beat, reuse map, lazy remainder — rather than bundling policy re-derived in prose. An inlined step is read from the bundle, never re-fetched (`fetch-costs-what-it-delivers`).

### batch-ends-where-the-server-says

Each `get_activity` response closes with a `batch:` block reporting how many activities have been delivered to this context (`activities_delivered`), what it has been delivered in characters, and whether it may take another; `_meta.batch` carries the same reading. Where `bounded` is true the two limits ride alongside those counts, and the tally is read against them. Where it is false no limit governs this scope, and none is reported. On `may_continue: false`, finish the current activity and report it — do not ask for a further one. If you do ask, the server refuses with the payload undelivered: report that activity as needing its own dispatch and stop.
