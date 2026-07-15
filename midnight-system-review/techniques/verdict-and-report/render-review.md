---
metadata:
  version: 1.0.0
---

## Capability

Render the review in the canonical [review-format](../../resources/review-format.md) — verdict, per-area findings, grade tuples, blocked validations, and the Review Details accounting — producing both the report artifact and the summary text that publication posts verbatim.

## Inputs

### merge_readiness_verdict

The computed 1-5 verdict.

### verdict_rationale

The rubric audit trail behind the verdict.

### accepted_findings

The accepted findings the report presents as blocking or noteworthy, with their grade tuples.

### investigation_areas

The approved areas, ordering the report's per-area sections and the accounting table.

## Outputs

### review_report

The full review report in the canonical format, persisted for the planning record.

#### artifact

`review-report.md`

### review_summary

The rendered review text destined for the pull request — posted verbatim by the publish operation, byte-for-byte what sign-off approved.

## Protocol

### 1. Render

- Render the report per the [review-format](../../resources/review-format.md): verdict header with `{merge_readiness_verdict}` and `{verdict_rationale}`, per-area sections in `{investigation_areas}` order presenting `{accepted_findings}` with their grade tuples and anchors, observations and blocked validations noted, and the Review Details accounting table (per area: probes planned, executed, blocked; findings raised, accepted).

### 2. Reconcile and Emit

- Reconcile the accounting table against the evidence log and findings register in the planning folder — every area accounted, every finding mapped to exactly one area, totals matching — before anything is emitted; this reconciliation is what the accounting gate validates.
- Write `{review_report}` to the planning folder and emit `{review_summary}` as the exact review text (the report's publishable body, byte-for-byte).
