---
metadata:
  version: 3.0.0
---

## Capability

The agent branches' containers and the agent roster projected into the audit dispatch shape — per-agent structured output, summary counts, and a crate-aware manifest.

## Inputs

### gathered_results

The crate-review branches as the ordered gather left them, carrying the per-id dispatch manifest and completeness verdict against the crate-review roster.

### sub_static_analysis_outputs

The static-analysis branch's container: one slot, carrying what that branch reported.

### sub_toolkit_review_outputs

The toolkit-review branch's container: one slot, carrying what that branch reported.

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
- Add the static-analysis and toolkit groups from `{sub_static_analysis_outputs}` and `{sub_toolkit_review_outputs}`, each a container of one slot. They ran as branches of their own beside the crate reviews rather than as entries of the crate-review roster, so the ordered gather does not carry them and they are read here — a group missing from this projection is a group the verification agent will report as an unscanned coverage gap.
- Build `{dispatch_results.dispatch_manifest}` by joining `{gathered_results.dispatch_manifest}` rows to `{agent_roster}` for assigned crate, with a row for each of the two groups above.
- Set `{dispatch_results.dispatch_summary}`, `{dispatch_results.agents_dispatched}`, and `{dispatch_results.per_agent_output}` from the projected rows.
- If `{gathered_results.completeness}` is not `complete`, mark the manifest `INCOMPLETE` so verification / re-dispatch can act.
