---
metadata:
  version: 2.0.0
---

## Capability

Project meta [gather-results](../../../meta/techniques/orchestration-patterns/gather-results.md) output plus the domain `{agent_roster}` into the audit `{dispatch_results}` shape (per-agent structured output, summary counts, crate-aware manifest).

## Inputs

### gathered_results

Ordered keyed collection from [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[gather-results](../../../meta/techniques/orchestration-patterns/gather-results.md).

### agent_roster

Domain roster used to attach crate / assignment columns to the manifest.

## Outputs

### dispatch_results

Collected results from all dispatched sub-agents.

#### per_agent_output

Per-agent structured output conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema), parsed from `{gathered_results.items}` where possible.

#### dispatch_summary

Count of agents dispatched and failures encountered.

#### dispatch_manifest

Per-agent table with `agent_id`, assigned crate, dispatched, returned, and status (from `{gathered_results.dispatch_manifest}` enriched with roster crate fields).

#### agents_dispatched

Count of agents actually dispatched and returned.

## Protocol

### 1. Project Gather Into Audit Shape

- Walk `{gathered_results.items}` in order; parse each non-null `result` into structured per-agent output when it conforms to the [output schema](../../resources/sub-agent-output-schema.md#schema).
- Build `{dispatch_results.dispatch_manifest}` by joining `{gathered_results.dispatch_manifest}` rows to `{agent_roster}` for assigned crate.
- Set `{dispatch_results.dispatch_summary}`, `{dispatch_results.agents_dispatched}`, and `{dispatch_results.per_agent_output}` from the projected rows.
- If `{gathered_results.completeness}` is not `complete`, mark the manifest `INCOMPLETE` so verification / re-dispatch can act.
