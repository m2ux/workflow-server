---
metadata:
  version: 1.0.0
---

## Capability

Contract and rules for carrying a graph fan — the operations that open every branch a destination names, give each its own identity, run them in one turn, and retire them against the activity they converge on. Every rule here is one the context orchestrating a fan can act on, whichever of the operations it is currently in.

## Rules

### one-identity-per-branch

Each branch runs under its own identity, distinct from its siblings' and from the session's own agent. The delivery ledger and the batch bound are both keyed on the calling identity, and a scope equal to the session's own agent is exempt from the bound — so a shared or session-equal identity puts the whole fan outside it and delivers a reference marker to a context that never received the bytes. Where the graph runs one activity over a collection the rule is load-bearing twice over: the siblings share an activity id, so only the identity tells the delivery ledger and the batch bound apart. A delivery call while several activities are in flight is refused when the calling identity is omitted, equals the session agent, or already holds a sibling. A resume of the same entry, and a replacement under a fresh identity for that same entry, are admitted.

### one-commit-before-the-spawn

One commit publishes every branch's in-progress mark, made before the first branch spawns. Every branch spawns in the same turn, so one commit closes the window `dispatch-activity.dispatch-mark-reaches-the-remote` names for all of them at once; a per-branch commit would attribute one branch's in-flight edits to another, the commit deriving its paths from a working tree that cannot tell two branches' changes apart.

### repeat-a-refused-call

A refused call is repeated with the same arguments. Taking an activity records its delivery, so several branch workers taking theirs close together can meet `STALE_WRITE`: the record moved under the call, nothing was written, and the message says so. That is an ordinary outcome of concurrency rather than a fault, and a fan's acceptance does not require that no refusal appears in its log. What acceptance requires is that every branch was served, every branch's outputs landed in its own slot, and the barrier released once. Nothing retries on a caller's behalf, and nothing is half-applied, because the refused call wrote nothing.

No other group states this, because no other puts several workers on one session record at once.

### the-barrier-is-a-reading

Each retirement reports what is still outstanding and, on the last, the activity it entered. There is no barrier-met call and no join-enter call: the only call that can enter the convergence activity is the one that empties the frontier, so waiting is a reading rather than something to remember to do. A crashed and resumed orchestrator re-derives the same barrier from the session record with no extra state.

### retire-in-the-order-the-branches-opened

The branches are retired in the order the fan reported them. Each retirement is a write against one session record, and the record's own account of what is outstanding is what releases the barrier, so an order chosen anywhere else makes the release depend on which write happened to land first.

### replace-one-branch-alone

A branch whose result is not an accepted envelope (`dispatch-activity.reject-partial-worker-result`) is replaced on its own: mint a fresh identity, compose a prompt with no prior deliveries, and spawn ONE agent — not the concurrent spawn. The replacement names the same entry, which the frontier still holds, so it needs no re-binding call. The siblings that returned are untouched: their work is committed and their outputs landed on their own returns. A second failure advances nothing — the blocked moment is synced onto that branch's rows and the entry stays on the frontier, because entering the convergence activity on fewer branches than the fan opened would hand its gather a value no branch produced.

### persist-the-fan-at-convergence

One persist at convergence, naming every branch. What every fan's instances share is the session record and the planning folder, so a per-branch persist would commit a folder its siblings are still writing — and where one activity runs over a collection there is no way to attribute the change either, the instances sharing one activity id.

Where the branches also share the working tree, which is every fan whose activity does not take a checkout of its own, the same holds of their code changes: the writes land in one tree inside the concurrent turn, so they are not serialised even though the retirements are, and a commit deriving its paths from that tree's status cannot tell two branches' changes apart. An activity that materialises its own checkout splits those trees and nothing else — each instance commits into its own during its own run, and this persist still happens once, at convergence, for the record and the folder.

### a-branch-reaches-no-gate

A branch declares no checkpoint. A session holds one outstanding decision at a time and every other tool call is gated while it is held, so one branch's gate would stop its siblings mid-activity. The load refuses a branch that declares one. A branch that cannot proceed reports a completion on a blocked or abort exit its activity declares.
