---
metadata:
  version: 1.26.0
---

## Capability

Worker for a dispatched activity — executes bound steps, yields checkpoints, and returns `steps_complete` when the activity's steps are done.

## Inputs

### workflow_id

Workflow the worker is executing an activity for.

### agent_id

Worker agent identity for this dispatch.

## Protocol

### 1. Verify Dispatch

- Confirm the activity `id` returned by the `get_activity` call the current stub instructed — not an earlier response this context still holds — equals the `{activity_id}` that dispatch or continuation bound. A worker carrying a batch re-checks this on every activity of the run, against the id the continuation named rather than the id the run opened with.
  > On mismatch, stop and report the expected id against the returned id. Execute no steps.
- Follow the techniques bundle and delivery notes on that same response (`step_techniques_note`, `resources_note`, reference-mode notes)
- Read `may_continue` from the `batch:` block closing that response. The block reports `activities_delivered`, the characters delivered, and whether this context may take another. `_meta.batch` carries the same reading.
  > - Where `bounded` is true the two limits ride alongside those counts, and the tally is read against them.
  > - Where `bounded` is false no limit governs this scope, and none is reported.

### 2. Load Resources

- Load resources per `resource-loading-via-tool`
- Use `force-full-after-summarization` when this context no longer holds prior deliveries

### 3. Take Walk Position

- Open the activity at its first step
  > When `{checkpoint_reply}` is bound, continue from the paused step.
  > A walk that reaches a gate already answered takes that answer. The steps before the gate run again.

### 4. Execute Steps

- Execute each activity step in document order
- Read the artifact each bound artifact-path input names before the step that consumes it
- For `kind: technique` steps, load the bound technique as that step is reached. `get_technique { session_index, step_id }` serves a step not already inlined.
  > - The whole activity is never pre-fetched.
  > - An inlined step is read from the bundle and is never re-fetched (`fetch-costs-what-it-delivers`).
  > - Where `get_activity` carries `step_techniques` or a sibling `resources` map, those response notes govern: begin-beat, reuse of the map, the lazy remainder.
- Read a technique step from [variable-binding](../variable-binding.md)
- Honor `when:` gates against the variable bag per `gate-evaluation`, and a loop's controls per `loop-control`
- Read a checkpoint step from [yield-checkpoint](./yield-checkpoint.md)

### 5. Return Steps Complete

- Apply `compose-steps-complete` from this response's bundle and return the envelope it composes. It reports the steps this activity ran, the gates it answered, the artifacts it wrote, the bag keys it mutated, this context's batch standing, and the activity definition and exit map this delivery carried. The destination of the exit is not read here.
  > - When the last step completes, or a checkpoint's exit ends the activity.
  > - Where a checkpoint answer held an exit, that technique includes `selected_exit`.
  > On `may_continue: false`, return this activity and stop. A further `get_activity` is refused with the payload undelivered: report that activity as needing its own dispatch and stop.

## Rules

### follow-bundled-rules

Follow the rules in [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically. Every rule in `agent-conduct` is one a worker can honour.

### worker-control-plane-ban

On `{session_index}`, this worker leaves `next_activity` and `get_workflow` uncalled.

### one-activity-at-a-time-in-a-batch

A batch returns each activity's `steps_complete` result as that activity finishes.

### agent-id-on-delivery-calls

Every `get_activity`, `get_technique` and `get_resource` call this worker makes carries `{agent_id}`. The first call under that identity takes full delivery. Every later call carries `bundle: "reference"`, so content this context already holds arrives as unchanged markers.

### outlive-dispatched-children

While a step of this activity holds work still running outside this context — an agent it dispatched, a task it armed a completion signal on — the activity is not finished, so stay live until every one of them has returned.

### final-message-is-an-envelope

The last thing this context emits is the `checkpoint_pending` yield, or the `steps_complete` result. Anything emitted in its place ends the context with that result still owed, and is not an accepted result: an interim status report, a progress table, or prose describing a result without being one.

