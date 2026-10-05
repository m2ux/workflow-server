---
metadata:
  version: 1.17.0
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

- Confirm the activity `id` returned by the `get_activity` call the current stub instructed — not an earlier response this context still holds — equals the `{activity_id}` that dispatch or continuation bound. A worker carrying a batch re-checks this on every activity of the run, against the id the continuation named rather than the id the run opened with. On mismatch, stop and report the expected id against the returned id. Execute no steps.
- Follow the techniques bundle and delivery notes on that same response (`step_techniques_note`, `resources_note`, reference-mode notes)
- Read `may_continue` from the `batch:` block closing that response. The block reports `activities_delivered`, the characters delivered, and whether this context may take another. `_meta.batch` carries the same reading. Where `bounded` is true the two limits ride alongside those counts, and the tally is read against them. Where `bounded` is false no limit governs this scope, and none is reported.

### 2. Load resources

- Load resources per `resource-loading-via-tool`
- Use `force-full-after-summarization` when this context no longer holds prior deliveries

### 3. Take the walk position

- Open the activity at its first step
  > When `{checkpoint_reply}` is bound, this context is continuing past a gate it yielded: apply [resume-from-checkpoint](./resume-from-checkpoint.md) in place of opening at the first step. The envelope is owed either way.

### 4. Execute steps

- Execute each activity step in document order
- Read the artifact each bound artifact-path input names before the step that consumes it
- For `kind: technique` steps, load the bound technique as that step is reached. The whole activity is never pre-fetched. `get_technique { session_index, step_id }` serves a step not already inlined. Where `get_activity` carries `step_techniques` or a sibling `resources` map, those response notes govern — begin-beat, reuse of the map, the lazy remainder. An inlined step is read from the bundle and is never re-fetched (`fetch-costs-what-it-delivers`).
- Apply each bound technique via [variable-binding](../variable-binding.md)
- Honor `when:` gates against the variable bag per `gate-evaluation`, and a loop's controls per `loop-control`
- When a step reaches a checkpoint, apply [yield-checkpoint](./yield-checkpoint.md)

### 5. Finalize the activity

- When the last step completes, or a checkpoint's exit ends the activity, apply [finalize-activity](./finalize-activity.md), passing the steps this activity ran as `steps_completed`, the checkpoints it answered as `checkpoints_responded`, the artifacts it wrote as `artifacts_produced`, the `{selected_exit}` a checkpoint answer held, where one did, and the `may_continue` this context's standing reports as `batch_may_continue`.
  > On `may_continue: false`, finish this activity and report it. A further `get_activity` is refused with the payload undelivered: report that activity as needing its own dispatch and stop.

## Rules

### follow-bundled-rules

Follow the rules in [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically. Every rule in `agent-conduct` is one a worker can honour.

### worker-control-plane-ban

On `{session_index}`, this worker leaves `next_activity` and `get_workflow` uncalled.

### one-activity-at-a-time-in-a-batch

A batch returns each activity's envelope as that activity finishes.

### agent-id-on-delivery-calls

Every `get_activity`, `get_technique` and `get_resource` call this worker makes carries `{agent_id}`. The first call under that identity takes full delivery. Every later call carries `bundle: "reference"`, so content this context already holds arrives as unchanged markers.

### outlive-dispatched-children

While a step of this activity holds work still running outside this context — an agent it dispatched, a task it armed a completion signal on — the activity is not finished, so stay live until every one of them has returned.

### final-message-is-an-envelope

The last thing this context emits is the envelope this activity owes — the `checkpoint_pending` yield, or the `activity_complete` result. Anything emitted in its place ends the context with the envelope still owed, and is not an accepted result: an interim status report, a progress table, or prose describing an envelope without being one.

