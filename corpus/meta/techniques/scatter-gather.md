---
metadata:
  version: 2.1.0
---

## Capability

A reusable fan-out shape: work units run inside a worker's loop or across the branches a graph fan opens, and reach one ordered keyed collection that a delegated combine folds.

## Protocol

### 1. Scatter

- **In a worker.** Iterate the work units in a `forEach` loop, invoking the per-unit operation once per unit for one scalar output per iteration. The scatter runs in the calling context, and one delivery of the loop body's technique serves every pass.
- **In the graph.** Bind the exit that reaches the per-unit activity to a destination naming that activity together with the collection to run it over. The run opens one worker per element, each handed its own element at the name the destination gives, and the branches converge on the activity their own exits name. The branches share the calling worker's checkout.

### 2. Gather

- Accumulate each unit's output into the gathered collection in work-unit order, attaching the iteration key to each entry where one is supplied. Under a graph fan the container the branches land in is already the gathered collection — one dense slot per branch, each carrying its unit's id and that branch's values, handed whole to [orchestration-patterns](./orchestration-patterns/TECHNIQUE.md)::[gather-results](./orchestration-patterns/gather-results.md) with the fan's own collection as `expected_ids`.

### 3. Combine

- Invoke the combine operation with the gathered collection as its input; its output lands in the bag under that operation's declared output name, per [variable-binding](./variable-binding.md). The caller supplies which combine operation.

## Rules

### one-gather-contract-over-two-scatter-modes

Loop accumulation inside a worker and a graph fan are the same primitive. The contract — the gathered collection as an ordered array with an optional key — and the combine step are mode-independent; the scatter mode selects only where the work units run.

### accumulate-never-overwrite

A scalar emitted per unit — per iteration inside a worker, per branch under a graph fan — is APPENDED to the gathered collection; it never overwrites the prior unit's value.

### isolation-then-combine

Per-unit outputs are gathered into an isolated ordered collection and merged ONLY through the delegated combine operation. They are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber. Under a graph fan the isolation is structural rather than honoured, the server landing each branch's whole reported map in a slot of its own — `variable-binding.a-branch-lands-under-its-own-derived-key`.

### order-is-preserved

The gathered collection is in work-unit order — under a graph fan the slot is the collection's own position — so the combine step and any downstream report are deterministic.

### a-branch-that-commits-takes-a-checkout-of-its-own

A graph fan's branches share one working tree, so a unit's work is a value it reports and not a commit it makes. Where each unit's work IS its commit, the fanned activity binds [create-worktree](/git/techniques/create-worktree.md) as its own step, and the load admits the git operations for it on that evidence — the wiring is the claim, so there is nothing to declare and nothing to take on trust.

> Reach for it only where per-unit attribution is the point: it costs a checkout per branch and makes the convergence responsible for a reconciliation that can conflict.

### an-instance-names-its-own-checkout

An instance names its worktree from the instance index its delivery already carries, so nothing is arranged before the fan opens and nothing about the arrangement goes on the collection — a work unit describes work.

### a-replaced-instance-reaches-a-clean-checkout

Materialising a worktree is idempotent, so an instance replaced after a failure reaches a clean checkout rather than the half-finished state of the one it replaced.

### a-checkout-belongs-to-an-activity-not-a-destination

Whether instances commit into checkouts of their own is a property of the activity they run, so it is settled where that activity is written and holds for every destination that fans it. An activity binding the worktree step commits into its own tree wherever it is reached; one that does not, does not. A list destination carries that activity beside one that only reports values, each keeping its own arrangement.

### a-join-gathers-the-container-not-an-index

The activity a graph fan converges on authors no slot index: the container's order carries the correspondence the join needs, the manifest names each unit by its id, and the width is a run-time value no authored index can be checked against. That activity reconciles the branches the container names, because after a fan nothing else holds all of them.
