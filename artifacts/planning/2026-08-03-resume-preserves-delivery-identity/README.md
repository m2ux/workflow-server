# Resumed workers keep their delivery identity — investigation and design record

Supporting record for [#408](https://github.com/m2ux/workflow-server/issues/408). The measurements that opened the issue live in the [batched-dispatch investigation record](../2026-08-02-batched-dispatch/README.md); this folder records what the code and definitions actually do, the design chosen, and the alternatives weighed.

## What the corpus said

Of 38 gate crossings followed by another delivery, 12 were taken over by a different server-side agent identity and nine of those re-received a full payload — 677,132 characters re-delivered on identity changes, plus 1,109,551 characters on same-identity resumes that re-delivered a byte-identical payload anyway. Where the ledger engages it saves 70.3%, so roughly 780,000 of those characters are avoidable. Two of the replacement identities end in "scope-resume" and "resume-1": the orchestrator meant to resume and minted a new identity while doing it.

## Where the identity is actually lost

The forensic pass named the fault as a rule violated about a third of the time. Reading the definitions, it is not a rule being violated — it is a structure that has no other outcome available.

The meta workflow drives a client workflow from a single `while` loop in `03-dispatch-client-workflow.yaml`. The loop body is: bind `dispatch-activity`; when the worker yields, bind `present-checkpoint-to-user`; then `respond-checkpoint`; then, only when the worker reported `activity_complete`, commit and advance the activity pointer. A gate leaves `current_activity` unchanged, so the loop condition still holds and the next iteration starts where every iteration starts — at `dispatch-activity`.

`dispatch-activity` mints a worker `agent_id` in its Protocol, one per dispatch. Re-entering it after a gate therefore mints a second one for a worker that is still alive and still holding the first payload. The server sees an unseen delivery scope and hands over the whole activity again. There is no step in the loop that resumes a worker, and no declared value anywhere that carries the identity a dispatch bound — so nothing downstream *could* re-bind it even if it wanted to.

Three supporting facts, each checked against the definitions:

- `dispatch-activity` declares `worker_result` and `trace_token` as outputs. The identity it binds is mentioned only inside a Protocol phase, so it is not a bindable value.
- The one place that states the invariant is `harness-compat::continue-agent`'s `resume-preserves-delivery-scope` rule. Nothing in the meta loop reaches `continue-agent` on the gate path — the only Protocol reference to it is `dispatch-activity`'s timeout branch.
- `workflow-orchestrator` says "on `checkpoint_pending`, bubble the yield and resume the worker with resolved effects", naming a resume that has no operation behind it.

That is the whole fault: a critical constraint carried by rule text on a path that never reads it, which the canon names `structure-backed-constraints` and frames under [Encode Constraints as Structure](../../../../workflows/workflow-design/resources/design-principles.md#9-encode-constraints-as-structure).

## What the server records while it happens

Two instruments are blind to it by construction.

`dispatchKind` keys on `(scope, activity)`, so a delivery to a scope the server has met before still reads as a first arrival whenever the activity differs. A replacement identity always differs on the scope too, so it reads `fresh` either way — but the same blindness is what would corrupt the batched-dispatch saving measurement, where one identity legitimately spans several activities.

Nothing at all records the shape of the fault: one activity delivered in full, twice, to two identities, in one session. Across 124 session states there are no error events and no aborted workflows, which is exactly what a silent second delivery looks like.

## Design

### The identity becomes a declared value

`dispatch-activity` declares `worker_agent_id` on `## Outputs` — the server-side identity this dispatch bound, which the delivery ledger is keyed on. Once it is a declared output it lands in the bag like any other, and later steps can bind it.

### The gate path gets an operation

A new `workflow-engine::resume-worker` continues the worker already holding the activity: it composes the continuation stub under the bound `{worker_agent_id}` and applies `harness-compat::continue-agent`, returning the worker's next envelope as `{worker_result}`. It mirrors `dispatch-activity`'s shape — compose, invoke the harness op, return the envelope unchanged — so the loop reads as spawn-or-resume rather than spawn-or-spawn-again.

`compose-prompt` gains `workflow-engine::resume-from-checkpoint` as a third value of `{agent_technique}`, with its own entry-tool line. Identity binding then has exactly one home for both stubs, rather than a second stub assembler that could drift from the first.

### Re-dispatch becomes structurally impossible while a worker holds the activity

In `03-dispatch-client-workflow.yaml`:

- `dispatch-activity` gains `when: !worker_agent_id`, so it cannot fire while an identity is bound.
- A `resume-yielded-worker` step binds `resume-worker` after `respond-yielded-checkpoint`, on the same `checkpoint_pending` gate, and its `{worker_result}` drives the rest of the iteration.
- `advance-activity` clears `worker_agent_id` alongside setting the next activity, because the worker that held it is finished.

A worker that gates twice therefore takes the present → respond → resume path twice, under one identity, and the loop never returns to `dispatch-activity` until the activity completes.

### The server can see the fault

`dispatchKind` reads the scope-only predicate that already sits beside it, so an arrival from a context the server has met is `resume` whatever activity it asks for. `fresh` and `resume` then mean what the ledger means by them — empty ledger versus prior deliveries to collapse — which is the discriminator the saving measurement needs.

A new `activity_redelivered` history event records a full delivery of an activity to a context that has not received it, in a session where another context already has. It carries the new identity, the identity that received it first, and the character count, so the waste is summable from the ledger. A genuine worker replacement records it too; both are worth seeing.

## Alternatives weighed

**Fold the resume into `dispatch-activity`.** One operation would decide spawn-or-resume from whether an identity is bound. Rejected: the loop would still read as a re-dispatch, `next_activity` would be re-called on a path that is not entering an activity, and the "never re-dispatch a live worker" constraint would go back to being prose inside a Protocol phase — the same failure mode being fixed.

**Add `worker_agent_id` as an input to `continue-agent`.** Rejected as insufficient on its own: `continue-agent` is not on the gate path at all, so an input there closes nothing. Its existing rule stays, because the invariant is real for every caller.

**Leave `dispatchKind` keyed on the activity and add a third value for a mid-batch arrival.** Rejected: `fresh` and `resume` already name the two states the ledger has, and a third value would need every consumer taught what it means. A context the server has met is a resume of that context.

## Acceptance criteria mapping

| Criterion from #408 | Where it lands |
|---|---|
| A resumed worker carries the identity its dispatch bound; a re-request returns unchanged markers | `dispatch-activity` output, `resume-worker`, `compose-prompt` resume stub, meta loop binds |
| An arrival from a context the server has already met is not a first arrival | `dispatchKind` reads the scope-only predicate |
| A second full delivery of one activity to a new identity is recorded | `activity_redelivered` history event |
| A walk test covers yield, resume, and re-request | `tests/e2e/` walk asserting unchanged markers across a gate |
| Re-measurement shows re-delivered characters falling toward zero | After merge, over fresh runs — not carried by this change |
