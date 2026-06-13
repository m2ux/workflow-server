---
metadata:
  version: 1.0.0
---

## Capability

Build an ordered collection by accumulating one scalar output per work unit — in input/iteration order, optionally keyed by an iteration variable — then delegate a combine operation to aggregate the collection. Work units are dispatched in one of two scatter modes: sequential (the bound operation invoked inside a `forEach` loop, one output accumulated per iteration) or parallel ([harness-compat](./harness-compat/TECHNIQUE.md)::[spawn-concurrent](./harness-compat/spawn-concurrent.md) fan-out across N instances). Both modes yield the same ordered keyed collection and feed the same combine. Sequential mode is the `concurrency = 1` case of parallel mode; parallel mode adds concurrency and per-instance isolation, and nothing else differs.

## Inputs

### fan_out_items

The ordered list of work units. In sequential mode this is the `forEach` `over` collection (e.g. `plan.tasks`); in parallel mode each entry yields one instance prompt for the fan-out.

### scatter_mode

Selects HOW work units are dispatched: `sequential` (a `forEach` loop; the `concurrency = 1` case) or `parallel` (a `spawn-concurrent` fan-out). Selecting the mode does not change the gather contract or the combine.

### per_unit_operation

The operation invoked once per work unit. It emits one scalar output per invocation (e.g. `task_implementation` per task), which is the value accumulated into the collection.

### iteration_key

Optional. The per-unit key under which gathered outputs are addressed (e.g. `submodule_path`, `check_id`, or the loop's iteration variable), so the combine step and downstream reads can address an individual unit.

### combine_operation

The delegated operation that aggregates the gathered collection. A `group::operation` reference the caller supplies; this technique defines the contract of the combine call (it receives the gathered ordered collection), not the merge logic.

## Outputs

### gathered_results

The ordered collection (in `fan_out_items`/iteration order) of per-unit outputs, optionally keyed by `{iteration_key}`. Identical in shape across both scatter modes.

### combined_result

The output of `{combine_operation}` applied to `{gathered_results}`. Lands in the bag under the combine operation's declared output name.

## Protocol

1. Scatter, by `{scatter_mode}`:
   - Sequential: iterate `{fan_out_items}` in a `forEach` loop; invoke `{per_unit_operation}` once per unit; it emits one scalar output per iteration.
   - Parallel: build one instance prompt per `{fan_out_items}` entry from `{per_unit_operation}`; dispatch all at once via [harness-compat](./harness-compat/TECHNIQUE.md)::[spawn-concurrent](./harness-compat/spawn-concurrent.md) (a single batch); block until every instance yields or completes.
2. Gather, ordered and keyed. Accumulate each unit's output into `{gathered_results}` in input/iteration order, attaching `{iteration_key}` to each entry when supplied. Accumulation APPENDS — a per-unit scalar never overwrites the prior unit's value.
   - Sequential: append each iteration's scalar; the gather is what prevents a per-iteration scalar from clobbering the prior one.
   - Parallel: assemble `spawn-concurrent`'s in-input-order `results` into `{gathered_results}` under `{iteration_key}`. Record dispatch completeness (dispatched and returned counts) so a missing instance is detectable, and do NOT bind any instance's scalar outputs into the parent bag by name — instance outputs stay isolated until combined.
3. Combine. Invoke `{combine_operation}` with `{gathered_results}` as its input; its output is `{combined_result}`, which lands in the bag under the combine operation's declared output name (per [variable-binding](./variable-binding.md)). The combine phase is identical across modes — the caller supplies WHICH combine operation; the contract of the call is mode-independent.

## Rules

### one-gather-contract-two-scatter-modes

Sequential-loop accumulation and parallel fan-out are the same primitive. The contract — `{gathered_results}` as an ordered array with an optional key — and the combine step are mode-independent; `{scatter_mode}` selects only the dispatch mechanism. Parallel mode is sequential mode plus concurrency and isolation; sequential mode is the `concurrency = 1` case of parallel mode.

### accumulate-never-overwrite

A scalar emitted per unit — per iteration in sequential mode, per instance in parallel mode — is APPENDED to `{gathered_results}`; it never overwrites the prior unit's value. This is exactly the per-iteration accumulation a `forEach` loop needs so that a scalar-per-unit output gathers into an activity-level plural collection rather than clobbering it.

### isolation-then-combine

Parallel instance outputs are gathered into an isolated ordered collection and merged ONLY through the delegated `{combine_operation}`. Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances. Combination happens exclusively in the combine phase.

### order-is-preserved

`{gathered_results}` is in `{fan_out_items}`/iteration order — in parallel mode inherited from `spawn-concurrent`'s in-input-order collection — so the combine step and any downstream report are deterministic.

### parallelism-is-optimisation

Sequential mode is always valid for correctness; parallel mode is an optimisation that adds concurrency and isolation. Where genuine parallel fan-out is not needed, sequential mode (the `concurrency = 1` case) is the correct default.
