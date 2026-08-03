---
metadata:
  version: 1.5.0
---

## Capability

Worker for a dispatched activity — executes bound steps, yields checkpoints, and walks on to the next activity while its batch has room.

## Inputs

### session_index

Stable session index for every authenticated tool call.

### workflow_id

Workflow the worker is executing an activity for.

### activity_id

Activity id this worker's current dispatch ([dispatch-activity](./dispatch-activity.md)) or continuation ([continue-batch](./continue-batch.md)) bound — must match the activity returned by `get_activity`.

### agent_id

Worker agent identity for this dispatch.

## Protocol

### 1. Verify dispatch

- Confirm the activity `id` on the `get_activity` response whose operations bundle delivered this technique equals `{activity_id}` per [verify-dispatched-activity](./TECHNIQUE.md#verify-dispatched-activity)
- Follow the operations bundle and delivery notes on that same response (`step_techniques_note`, `resources_note`, reference-mode notes)
- Read `may_continue` from `_meta.batch` on that response — this context's standing against its bound ([batch-ends-where-the-server-says](#batch-ends-where-the-server-says))

### 2. Load resources

- Load resources per [resource-loading-via-tool](./TECHNIQUE.md#resource-loading-via-tool)
- Use [force-full-after-summarization](./TECHNIQUE.md#force-full-after-summarization) when this context no longer holds prior deliveries

### 3. Execute steps

- Read the artifact each bound artifact-path input names before the step that consumes it — the dispatch stub carries identity bindings only, never artifact content
- Execute each activity step in document order
- For `kind: technique` steps, load the bound operation on reach per [progressive-step-technique-load](./TECHNIQUE.md#progressive-step-technique-load)
- Apply each bound operation via [variable-binding](../variable-binding.md)
- Honor `when:` gates against the variable bag — operators `==`/`!=`/`>`/`<`/`>=`/`<=`, bare truthiness, unary `!`, `&&`, `||`, parentheses; C-style precedence (`()` > `!` > comparisons > `&&` > `||`); mixed `&&`/`||` at one depth requires parentheses; match the reference evaluator in `src/schema/when-expression.ts` (invalid expressions do not run the step)
- When a step reaches a checkpoint, apply [yield-checkpoint](./yield-checkpoint.md)
- When the last step completes, apply [finalize-activity](./finalize-activity.md), passing the `may_continue` read in step 1 as `batch_may_continue`

## Rules

### follow-bundled-rules

Follow the rules in [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### worker-control-plane-ban

Never call the workflow-server control-plane tools `next_activity` or `get_workflow`. The next activity of a batch reaches this context only as a continuation stub the orchestrator sends after [continue-batch](./continue-batch.md) has advanced the pointer and re-bound `{activity_id}` ([one-advance-per-activity](./continue-batch.md#one-advance-per-activity)); the commit at that boundary is the orchestrator's ([commit-after-activity](./commit-and-persist.md#commit-after-activity)). Never issue the next activity's `get_activity` on your own initiative — wait for the stub.

### one-activity-at-a-time-in-a-batch

Return each activity's `activity_complete` envelope as it finishes per [finalize-activity](./finalize-activity.md) — a batch defers nothing to its end. That lets the orchestrator advance the pointer activity by activity, so a failed resume costs one activity rather than the batch; deferred reporting leaves the pointer stale and hands a replacement worker a pointer that disagrees with what it finds, which stops it ([verify-dispatched-activity](./TECHNIQUE.md#verify-dispatched-activity)).

### session-index-on-each-call

Pass `{session_index}` on every authenticated tool call ([session-index-passes-on-each-call](./TECHNIQUE.md#session-index-passes-on-each-call)).

### agent-id-on-delivery-calls

Every `get_activity`, `get_technique` and `get_resource` call this worker makes carries `{agent_id}`, the identity its ledger is keyed on ([agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)). A first dispatch holds no prior deliveries and takes full delivery; every call after it under that same identity carries `bundle: "reference"`, whether it resumes the activity this context holds or takes the next activity of its batch, so content this context already holds arrives as unchanged markers.

### batch-ends-where-the-server-says

`_meta.batch` on each `get_activity` reports how many activities this context has taken, what it has been delivered, and whether it may take another. On `may_continue: false`, finish the current activity and report it — do not ask for a further one. If you do ask, the server refuses with the payload undelivered: report that activity as needing its own dispatch and stop. The orchestrator spawns the replacement ([continue-batch](./continue-batch.md)).
