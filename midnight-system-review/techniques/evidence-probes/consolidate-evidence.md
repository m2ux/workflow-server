---
metadata:
  version: 1.1.0
---

## Capability

Combine the per-area evidence records into the consolidated evidence log — verifying gather completeness and budget compliance, and building the per-area accounting that the final report reconciles against — and hand the aggregated candidate findings to adjudication.

## Inputs

### area_evidence_collection

The ordered collection of per-area evidence records gathered by the area-probe loop, one record per investigation area in iteration order.

### investigation_areas

The approved area list, used to verify that every planned area produced exactly one evidence record.

## Outputs

### evidence_log

The consolidated evidence base: per-area probe accounting, all evidence items with anchors, and all blocked validations.

#### artifact

`evidence-log.md`

### candidate_findings

All candidate findings aggregated across areas in area order, each tied to its area and anchors — the adjudication input.

## Protocol

### 1. Verify Gather

- Verify `{area_evidence_collection}` holds exactly one record per entry in `{investigation_areas}`, in order; a missing or duplicate area record is a hard stop — re-run that area's probes before consolidating.
- Verify every record's probe count is within `{probe_budget_per_area}`; record any overage explicitly (it signals a plan or discipline defect, not extra rigor).
- Verify every failure-class discharge on correlation-class or atomicity-class obligations: refuted entries include a P7 join-key discharge table or a P8a/P8b per-caller path anchor; inconclusive entries are explicitly marked, not relabeled as refuted.

### 2. Consolidate

- Write `{evidence_log}` to the planning folder: an accounting table (per area: probes planned, executed, blocked, candidate findings raised), followed by each area's evidence items, failure-class discharge records (confirmed/refuted/inconclusive/blocked with proof artifacts where required), and blocked validations with anchors.
- Aggregate every record's candidate findings into `{candidate_findings}`, preserving area order and anchors.
