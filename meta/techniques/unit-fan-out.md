---
metadata:
  version: 1.0.0
---

## Capability

Scatter same-context process, shell, or tool units (heterogeneous or homogeneous), wait for every unit, and gather an ordered keyed collection — one primitive for in-context unit fan-out. Activities bind this strategy as a step; unit bodies are process/shell/tool invocation specs, not nested technique Applies.

Agent-instance parallel lives in scatter-gather (parallel mode) and harness-compat spawn-concurrent. This contract covers units that run in the caller's context as processes, shells, or tools.

## Inputs

### work_units

Ordered list of work units. Each entry is a process, shell, or tool **invocation spec**: the command or tool call to run (argv, cargo op shell form, or equivalent), any per-unit resource budget, and any per-unit key the gather must preserve. Homogeneous suites share one shape; heterogeneous suites mix shapes in one ordered list. Units are not technique Protocol Applies — cargo and peer ops appear as invocation specs the activity composed into this list.

### dispatch_concurrency

Optional positive integer bounding how many units run at once. Omit or set above one when units are independent and the host can absorb the load. `dispatch_concurrency = 1` is the sequential case of the same contract.

## Outputs

### unit_results

Ordered keyed collection of per-unit outcomes in input order. Each entry carries the unit key (when supplied) and that unit's scalar or structured result. Accumulation appends — a per-unit result never overwrites a prior unit.

## Protocol

1. Scatter, by concurrency:
   - When `{dispatch_concurrency}` is greater than one (or omitted and independence holds): start the process/shell/tool units up to the concurrency bound; each unit runs in the caller's context under its own invocation spec from `{work_units}`.
   - When `{dispatch_concurrency}` is `1`, or independence / shared mutation / host limits require serial execution: run the units one at a time in input order — the same gather applies.
2. Wait-all. Block until every unit has finished. Do not short-circuit on the first failure — collect every per-unit outcome so a single pass surfaces the full set.
3. Gather, ordered and keyed. Accumulate each unit's outcome into `{unit_results}` in input order, attaching the unit key when supplied. Accumulation APPENDS.
4. When the binding activity supplies a following combine step, that step consumes `{unit_results}`; this Protocol ends at the ordered gather.

## Rules

### process-units-not-agents

Units are same-context process, shell, or tool invocations. Agent-instance scatter, isolation, and parallel batch dispatch belong to [scatter-gather](./scatter-gather.md) and [spawn-concurrent](./harness-compat/spawn-concurrent.md). Do not route agent fan-out through this contract.

### units-are-invocation-specs

Each work unit is a process/shell/tool invocation the activity listed in `{work_units}`. This Protocol does not Apply techniques or cargo ops as nested technique work; it runs the specs and gathers their outcomes.

### one-gather-contract-any-concurrency

Concurrent fan-out and sequential execution are the same primitive. The contract — `{unit_results}` as an ordered array with optional keys — is concurrency-independent; `{dispatch_concurrency}` selects only how many units run at once. Sequential mode is the `dispatch_concurrency = 1` case.

### accumulate-never-overwrite

A result emitted per unit is APPENDED to `{unit_results}`; it never overwrites the prior unit's value.

### wait-all-before-downstream

Every unit finishes before a downstream combine or consumer runs. Partial gather under early exit is outside this contract.

### order-is-preserved

`{unit_results}` is in unit-list order regardless of completion order, so combine and any downstream report are deterministic.

### concurrency-degrades-to-sequential

When the host cannot absorb the requested concurrency, or units share mutable state concurrency would race, set `{dispatch_concurrency}` to `1` (or run the suite sequentially under the same gather). Sequential execution remains correct; concurrency is an optimisation over the same contract.

### activity-owns-domain-envelope

Resource budgets, product-specific backoff, suite composition, and public I/O envelopes stay with the **binding activity** (step inputs and any following combine step). This contract owns ordered scatter, wait-all, and ordered gather only.
