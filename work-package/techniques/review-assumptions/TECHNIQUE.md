---
metadata:
  version: 3.1.0
---

## Capability

The assumption lifecycle a work package runs on: what an assumption is, the categories it is classified into, and the log that holds its outcome.

## Inputs

### assumption_source

The work the assumptions are drawn from — the design decision, the plan, the analysis, or the change under construction.

### assumption_categories

The categories an assumption is classified into.

### assumptions_log

*(optional)* The existing assumptions [log](../../resources/assumptions-review.md#assumptions-log-template), if one exists

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with review outcomes — grows as the work progresses



## Rules

### elevate-implicit

Make implicit decisions explicit — assumptions should be elevated for validation

### assembled-entries-carry-their-evidence

An assembled open-assumption entry carries the partial evidence reconcile and challenge produced in its technical context, and resolves reversibility through [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[reversibility-signal](../../../meta/techniques/gitnexus-operations/reversibility-signal.md) where the assumption names a known symbol.

### assumptions-log-is-the-record

Every assumption's category, agent position and resolution status lives in the assumptions log, so a later reader settles an outcome from the log rather than from the transcript that produced it.
