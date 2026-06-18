---
metadata:
  version: 1.0.0
---

## Capability

Build an ordered collection by accumulating one scalar output per work unit — in input/iteration order, optionally keyed by an iteration variable — then delegate a combine operation to aggregate the collection. Work units are dispatched in one of two scatter modes: sequential (the bound operation invoked inside a `forEach` loop, one output accumulated per iteration) or parallel ([harness-compat](./harness-compat/TECHNIQUE.md)::[spawn-concurrent](./harness-compat/spawn-concurrent.md) fan-out across N instances). Both modes yield the same ordered keyed collection and feed the same combine. Sequential mode is the `concurrency = 1` case of parallel mode; parallel mode adds concurrency and per-instance isolation, and nothing else differs.

## Protocol

1. Scatter, by mode:
   - Sequential: iterate the work units in a `forEach` loop; invoke the per-unit operation once per unit; it emits one scalar output per iteration.
   - Parallel: build one instance prompt per work unit from the per-unit operation; dispatch all at once via [harness-compat](./harness-compat/TECHNIQUE.md)::[spawn-concurrent](./harness-compat/spawn-concurrent.md) (a single batch); block until every instance yields or completes.
2. Gather, ordered and keyed. Accumulate each unit's output into the gathered collection in input/iteration order, attaching the iteration key to each entry when supplied. Accumulation APPENDS — a per-unit scalar never overwrites the prior unit's value.
   - Sequential: append each iteration's scalar; the gather is what prevents a per-iteration scalar from clobbering the prior one.
   - Parallel: assemble `spawn-concurrent`'s in-input-order `results` into the gathered collection under the iteration key. Record dispatch completeness (dispatched and returned counts) so a missing instance is detectable, and do NOT bind any instance's scalar outputs into the parent bag by name — instance outputs stay isolated until combined.
3. Combine. Invoke the combine operation with the gathered collection as its input; its output lands in the bag under the combine operation's declared output name (per [variable-binding](./variable-binding.md)). The combine phase is identical across modes — the caller supplies WHICH combine operation; the contract of the call is mode-independent.

## Rules

### one-gather-contract-two-scatter-modes

Sequential-loop accumulation and parallel fan-out are the same primitive. The contract — the gathered collection as an ordered array with an optional key — and the combine step are mode-independent; the scatter mode selects only the dispatch mechanism. Parallel mode is sequential mode plus concurrency and isolation; sequential mode is the `concurrency = 1` case of parallel mode.

### accumulate-never-overwrite

A scalar emitted per unit — per iteration in sequential mode, per instance in parallel mode — is APPENDED to the gathered collection; it never overwrites the prior unit's value. This is exactly the per-iteration accumulation a `forEach` loop needs so that a scalar-per-unit output gathers into an activity-level plural collection rather than clobbering it.

### isolation-then-combine

Parallel instance outputs are gathered into an isolated ordered collection and merged ONLY through the delegated combine operation. Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances. Combination happens exclusively in the combine phase.

### order-is-preserved

The gathered collection is in work-unit/iteration order — in parallel mode inherited from `spawn-concurrent`'s in-input-order collection — so the combine step and any downstream report are deterministic.

### parallelism-is-optimisation

Sequential mode is always valid for correctness; parallel mode is an optimisation that adds concurrency and isolation. Where genuine parallel fan-out is not needed, sequential mode (the `concurrency = 1` case) is the correct default.
