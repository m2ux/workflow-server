---
metadata:
  version: 2.0.0
---

## Capability

Scatter work units, gather an ordered keyed collection, then combine — one gather contract over two scatter modes, one inside a worker and one owned by the graph.

## Protocol

1. Scatter, by mode:
   - **In a worker.** Iterate the work units in a `forEach` loop; invoke the per-unit operation once per unit; it emits one scalar output per iteration. The whole scatter runs in the calling context, and one delivery of the loop body's technique serves every pass.
   - **In the graph.** Bind the exit that reaches the per-unit activity to a destination naming that activity together with the collection to run it over. The run opens one worker per element, each handed its own element at the name the destination gives, and the branches converge on the activity their own exits name. The branches share the calling worker's checkout, so none of them commits; where each unit's work is its own commit, the destination declares `isolation: worktree` and the shape around it changes — see [an-isolated-fan-commits-per-branch](#an-isolated-fan-commits-per-branch).
2. Gather, ordered and keyed. Accumulate each unit's output into the gathered collection in input/iteration order, attaching the iteration key to each entry when supplied. Accumulation APPENDS — a per-unit scalar never overwrites the prior unit's value.
   - **In a worker:** append each iteration's scalar; the gather is what prevents a per-iteration scalar from clobbering the prior one.
   - **In the graph:** the container the fan lands is already the gathered collection — one dense slot per branch in collection order, each carrying its unit's id and that branch's values. Hand it whole to [orchestration-patterns](./orchestration-patterns/TECHNIQUE.md)::[gather-results](./orchestration-patterns/gather-results.md) with the fan's own collection as the expected ids.
3. Combine. Invoke the combine operation with the gathered collection as its input; its output lands in the bag under the combine operation's declared output name (per [variable-binding](./variable-binding.md)). The combine phase is identical across modes — the caller supplies WHICH combine operation; the contract of the call is mode-independent.

## Rules

### one-gather-contract-over-two-scatter-modes

Loop accumulation inside a worker and a graph fan are the same primitive. The contract — the gathered collection as an ordered array with an optional key — and the combine step are mode-independent; the scatter mode selects only where the work units run.

### accumulate-never-overwrite

A scalar emitted per unit — per iteration inside a worker, per branch under a graph fan — is APPENDED to the gathered collection; it never overwrites the prior unit's value. This is exactly the per-iteration accumulation a `forEach` loop needs so that a scalar-per-unit output gathers into an activity-level plural collection rather than clobbering it.

### isolation-then-combine

Per-unit outputs are gathered into an isolated ordered collection and merged ONLY through the delegated combine operation. They are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber. Combination happens exclusively in the combine phase. Under a graph fan the isolation is structural rather than honoured: each branch's whole reported map lands in a slot of its own under a key derived from its activity id, server-side, so the bare name does not land at all.

### order-is-preserved

The gathered collection is in work-unit order — under a graph fan the slot is the collection's own position — so the combine step and any downstream report are deterministic.

### an-isolated-fan-commits-per-branch

A graph fan's branches share one working tree and one git index, so a unit's work is a value it reports and not a commit it makes. Where each unit's work IS its commit, the destination declares `isolation: worktree` and three things move together.

The activity before the fan materialises one worktree per element and records its path and branch on that element, because `git worktree add` writes the repository's administrative files and several instances cannot do it at once. Each instance works in the checkout its element names and commits there. The activity the fan converges on reconciles the branches, because after a fan nothing else holds all of them.

The declaration buys exactly one thing from the load — the version-control operations stop being refused for that fan's activity — and the load takes it on trust, a commit's target tree being a run-time fact no rule reads. Everything else it implies is the author's to build. Session-level persistence is unaffected: the record and the planning folder are shared however the checkouts are split, so the run still persists once, at convergence.

Reach for it only where per-unit attribution is the point. Isolation costs a full checkout per branch, materialised one at a time before any work starts, and it makes the convergence responsible for a reconciliation that can conflict.

### a-join-gathers-the-container-not-an-index

The activity a graph fan converges on reads the branch container WHOLE and hands it to `gather-results` with the fan's own collection as `expected_ids`. It does not author a slot index: the container's order carries the correspondence the join needs, the manifest names each unit by its id, and the width is a run-time value no authored index can be checked against.
