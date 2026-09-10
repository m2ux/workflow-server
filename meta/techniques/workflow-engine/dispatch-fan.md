---
metadata:
  version: 1.0.0
---

## Capability

Open every branch a graph destination fans, carry them in one turn, and hand back the activity they converge on.

## Inputs

### session_index

`session_index` of the session whose exit fans.

### fan_destination

The destination exactly as the graph names it — a list of members, or one activity together with the collection to run it over. Passed through unread: the server expands it, so this operation never learns which construct produced the branches and never computes a width.

### exiting_activity

The activity whose exit fans — the one this call is returning. Instance-qualified where the graph runs that activity once per element of a collection.

### exit_id

The exit that activity took. Required: an exit the graph fans has to say which destination it takes.

### agent_technique

Canonical agent technique for each branch worker — default workflow-engine::activity-worker.

### state

Current variable state for stub substitution (`session_index`, `workflow_id`, `agent_id`, …).

### planning_folder_path

*(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.

## Outputs

### convergence_activity

The activity the fan converged on, as the barrier reported it — what the run continues from.

### trace_tokens

The opaque HMAC-signed trace tokens this fan accumulated, one per `next_activity` call that returned `_meta.trace_token`.

## Protocol

1. **Progress in-progress, once for every branch.** Apply [sync-progress-status](./sync-progress-status.md) with `{planning_folder_path}` for the dispatch moment in [Progress Status call sites](../../../meta/resources/planning-readme.md#progress-status-call-sites), for each branch's rows. Then apply [version-control::commit-regular-files](../version-control/commit-regular-files.md) ONCE, with `paths` naming the planning folder `README.md` alone and a message stating which activities are entering progress — see [one-commit-before-the-spawn](#one-commit-before-the-spawn).
   > When `{planning_folder_path}` is unset, skip this phase.
2. **Enter the fan with one call.** Call `next_activity { session_index, activity_id: fan_destination, from_activity: exiting_activity, exit: exit_id, step_manifest }`; capture `_meta.trace_token`, and read `_meta.fan` for the branch list and `_meta.barrier.destination` for the activity the fan converges on. One call retires the exiting activity and opens every branch, so entering a fan cannot half-happen.
3. **Mint one identity per branch.** For each entry in the branch list, mint an identity per [one-identity-per-branch](#one-identity-per-branch).
4. **Compose one prompt per branch.** For each entry, apply [compose-prompt](./compose-prompt.md) with `{agent_technique}`, `holds_prior_deliveries: false`, and `{state}` as substitutions, passing that entry as `activity_id` and its own minted identity as `agent_id`.
5. **Spawn the batch in one turn.** Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-concurrent](../harness-compat/spawn-concurrent.md) with every composed prompt in a single response turn; the turn does not resume until every branch has returned, so joining the envelopes is a fact of the turn and nothing polls, times out or is scheduled.
6. **Retire the branches in input order.** For each entry, in the order the branch list gave them, call `next_activity { session_index, activity_id: <the destination the barrier reported>, from_activity: <that entry>, exit: <that branch's exit>, step_manifest, variables_changed, artifacts_produced }` from that branch's envelope. Each call reports what is still outstanding; the call that empties the frontier is the one that enters the convergence activity, and only that one. Accumulate `_meta.trace_token` as in step 2.
7. **Account for every branch**, per [account-every-activity](./dispatch-activity.md#account-every-activity), which names an instance where the graph runs one activity over a collection.
8. **Persist once, at convergence.** After the last branch returns and before the run continues, apply [commit-and-persist](./commit-and-persist.md) naming every branch — see [persist-the-fan-before-any-branch-returns](#persist-the-fan-before-any-branch-returns).

## Rules

### repeat-a-refused-call

A refused call is repeated with the same arguments. Taking an activity records its delivery, so several branch workers taking theirs close together can meet `STALE_WRITE`: the record moved under the call, nothing was written, and the message says so. That is an ordinary outcome of concurrency rather than a fault, and a fan's acceptance does not require that no refusal appears in its log. What acceptance requires is that every branch was served, every branch's outputs landed in its own slot, and the barrier released once. Nothing retries on a caller's behalf, and nothing is half-applied, because the refused call wrote nothing.

No other operation states this, because no other operation puts several workers on one session record at once.

### one-identity-per-branch

Each branch runs under its own identity, distinct from its siblings' and from the session's own agent. The delivery ledger and the batch bound are both keyed on the calling identity, and a scope equal to the session's own agent is exempt from the bound — so a shared or session-equal identity puts the whole fan outside it and delivers a reference marker to a context that never received the bytes. Where the graph runs one activity over a collection the rule is load-bearing twice over: the siblings share an activity id, so only the identity tells the delivery ledger and the batch bound apart.

### one-commit-before-the-spawn

One commit publishes every branch's in-progress mark, made before the first branch spawns. Every branch spawns in the same turn, so one commit closes the window [dispatch-mark-reaches-the-remote](./dispatch-activity.md#dispatch-mark-reaches-the-remote) names for all of them at once; a per-branch commit would attribute one branch's in-flight edits to another, the commit deriving its paths from a working tree that cannot tell two branches' changes apart.

### persist-the-fan-before-any-branch-returns

One persist at convergence, naming every branch. What every fan's instances share is the session record and the planning folder, so a per-branch persist would commit a folder its siblings are still writing — and where one activity runs over a collection there is no way to attribute the change either, the instances sharing one activity id.

Where the branches also share the working tree, which is every fan whose activity does not take a checkout of its own, the same holds of their code changes: the writes land in one tree inside the concurrent turn, so they are not serialised even though the retirements are, and a commit deriving its paths from that tree's status cannot tell two branches' changes apart. An activity that materialises its own checkout splits those trees and nothing else — each instance commits into its own during its own run, and this persist still happens once, at convergence, for the record and the folder.

### the-barrier-is-a-reading

Each retirement reports what is still outstanding and, on the last, the activity it entered. There is no barrier-met call and no join-enter call: the only call that can enter the convergence activity is the one that empties the frontier, so waiting is a reading rather than something to remember to do. A crashed and resumed orchestrator re-derives the same barrier from the session record with no extra state.

### replace-one-branch-alone

A branch whose result is not an accepted envelope ([reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result)) is replaced on its own: mint a fresh identity, compose a prompt with no prior deliveries, and spawn ONE agent — not the concurrent spawn. The replacement names the same entry, which the frontier still holds, so it needs no re-binding call. The siblings that returned are untouched: their work is committed and their outputs landed on their own returns. A second failure advances nothing — the blocked moment is synced onto that branch's rows and the entry stays on the frontier, because entering the convergence activity on fewer branches than the fan opened would hand its gather a value no branch produced.

### a-branch-reaches-no-gate

A branch never yields a checkpoint. A session holds one outstanding decision at a time and every other tool call is gated while it is held, so one branch's gate would stop its siblings mid-activity — and the orchestrator could not answer it anyway, the turn not resuming until every branch has returned. The load refuses a branch that declares one; the yield tool refuses a gate no definition mentions. A branch that cannot proceed reports a completion on a blocked or abort exit its activity declares.
