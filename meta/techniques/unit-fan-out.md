---
metadata:
  version: 1.0.0
---

## Capability

Scatter same-context process, shell, or tool units (heterogeneous or homogeneous), wait for every unit, gather an ordered keyed collection, then combine — one primitive for in-context unit fan-out.

Agent-instance parallel lives in scatter-gather (parallel mode) and harness-compat spawn-concurrent. This contract covers units that run in the caller's context as processes, shells, or tools.

## Inputs

### work_units

Ordered list of work units. Each entry names the process, shell, or tool invocation to run (operation reference, argv, or equivalent) and carries any per-unit key the gather must preserve. Homogeneous suites share one shape; heterogeneous suites mix shapes in one ordered list.

### dispatch_concurrency

Optional positive integer bounding how many units run at once. Omit or set above one when units are independent and the host can absorb the load. `dispatch_concurrency = 1` is the sequential case of the same contract.

### combine_hook

Caller-supplied combine hook — the operation or procedure that consumes the ordered gathered collection and produces the caller's product. The contract invokes the hook; the caller owns which combine runs and what domain envelope (budgets, backoff, product fields) surrounds it.

## Outputs

### unit_results

Ordered keyed collection of per-unit outcomes in input order. Each entry carries the unit key (when supplied) and that unit's scalar or structured result. Accumulation appends — a per-unit result never overwrites a prior unit.

### combined_result

Result of invoking `{combine_hook}` on `{unit_results}`. Lands under the combine operation's declared output name when the hook is a bound operation (per variable-binding); otherwise the caller folds `{combined_result}` into its own declared product.

## Protocol

1. Scatter, by concurrency:
   - When `{dispatch_concurrency}` is greater than one (or omitted and independence holds): start the process/shell/tool units up to the concurrency bound; each unit runs in the caller's context under its own invocation.
   - When `{dispatch_concurrency}` is `1`, or independence / shared mutation / host limits require serial execution: run the units one at a time in input order — the same gather and combine steps apply.
2. Wait-all. Block until every unit has finished. Do not short-circuit on the first failure — collect every per-unit outcome so a single pass surfaces the full set.
3. Gather, ordered and keyed. Accumulate each unit's outcome into `{unit_results}` in input order, attaching the unit key when supplied. Accumulation APPENDS.
4. Combine. Invoke `{combine_hook}` with `{unit_results}` as its input; emit `{combined_result}` from that hook. The combine phase is concurrency-independent — the caller supplies WHICH combine runs; the contract of the call does not change with concurrency.

## Rules

### process-units-not-agents

Units are same-context process, shell, or tool invocations. Agent-instance scatter, isolation, and parallel batch dispatch belong to [scatter-gather](./scatter-gather.md) and [spawn-concurrent](./harness-compat/spawn-concurrent.md). Do not route agent fan-out through this contract.

### one-gather-contract-any-concurrency

Concurrent fan-out and sequential execution are the same primitive. The contract — `{unit_results}` as an ordered array with optional keys — and the combine step are concurrency-independent; `{dispatch_concurrency}` selects only how many units run at once. Sequential mode is the `dispatch_concurrency = 1` case.

### accumulate-never-overwrite

A result emitted per unit is APPENDED to `{unit_results}`; it never overwrites the prior unit's value.

### wait-all-before-combine

Every unit finishes before combine runs. Partial gather under early exit is outside this contract.

### order-is-preserved

`{unit_results}` is in unit-list order regardless of completion order, so combine and any downstream report are deterministic.

### concurrency-degrades-to-sequential

When the host cannot absorb the requested concurrency, or units share mutable state concurrency would race, set `{dispatch_concurrency}` to `1` (or run the suite sequentially under the same gather/combine). Sequential execution remains correct; concurrency is an optimisation over the same contract.

### caller-owns-domain-envelope

Resource budgets, product-specific backoff, suite composition, and public I/O envelopes stay with the caller. This contract owns ordered scatter, wait-all, ordered gather, and the combine hook only.
