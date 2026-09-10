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

A graph fan's branches share one working tree and one git index, so a unit's work is a value it reports and not a commit it makes. Where each unit's work IS its commit, the destination declares `isolation: worktree`.

Each instance materialises its own checkout, names it from the instance index its delivery already carries, works there and commits there, and reports the branch it made among its outputs. Materialising is idempotent, so an instance replaced after a failure reaches a clean checkout rather than the half-finished state of the one it replaced. The activity the fan converges on reconciles the branches the container names — the ones that exist, rather than the ones a plan predicted — because after a fan nothing else holds all of them. Nothing about the arrangement goes on the collection: a work unit describes work, and an instance able to name its own checkout needs no field telling it where to stand.

The declaration buys exactly one thing from the load — the version-control operations stop being refused for that fan's activity — and the load takes it on trust, a commit's target tree being a run-time fact no rule reads. Everything else it implies is the author's to build. Session-level persistence is unaffected: the record and the planning folder are shared however the checkouts are split, so the run still persists once, at convergence.

**It is declared per member and it is uniform within one.** A list destination may carry an isolated member beside a plain one, and only the isolated member's activity may commit. Within a member it is all of the instances or none: they run the same steps, so giving some a checkout of their own and leaving others on the shared tree is one activity behaving two ways, and an instance that commits the shared tree while its siblings write it is the thing the refusal exists to prevent. Where only some units commit, give them all a worktree — the ones with nothing to commit simply do not, and a checkout is cheap beside a whole further delivery — or run the committing units as a fan of their own.

Reach for it only where per-unit attribution is the point. Isolation costs a full checkout per branch and makes the convergence responsible for a reconciliation that can conflict.

> `git worktree add` writes the repository's administrative files. Distinct worktree names and distinct branches touch distinct paths under per-ref locks, so instances materialising together is expected to hold. Where a repository is large enough that several checkouts at once is the cost that hurts, or where the race is seen to bite, the activity before the fan materialises them in one pass instead — a remedy for an observed problem rather than the shape to start from.

### a-join-gathers-the-container-not-an-index

The activity a graph fan converges on reads the branch container WHOLE and hands it to `gather-results` with the fan's own collection as `expected_ids`. It does not author a slot index: the container's order carries the correspondence the join needs, the manifest names each unit by its id, and the width is a run-time value no authored index can be checked against.
