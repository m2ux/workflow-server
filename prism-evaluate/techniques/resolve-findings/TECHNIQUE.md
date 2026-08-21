---
metadata:
  version: 2.0.0
---

## Capability

Carries each evaluation finding from a criticism to a decided change: what it would take to answer, what the user chose, and what the target ends up saying.

## Inputs

### evaluation_report

The consolidated [evaluation report](../../resources/evaluation-report-template.md#evaluation-report-template) — findings with IDs, severities, titles, descriptions, and the target sections they reference.

### current_finding

The finding under consideration, carrying its ID, severity, claim, critique, and tier.

## Outputs

### evaluation_findings

The findings drawn from `{evaluation_report}`, tier-classified and ordered for one-by-one consideration.

### accepted_mitigations

The per-finding dispositions, each `{ finding_id, finding_severity, mitigation_type, mitigation_summary, user_decision }`.

### mitigation_plan

The [mitigation plan](../../resources/mitigation-plan-template.md#mitigation-plan-template) carrying every finding's disposition.

#### artifact

`MITIGATION-PLAN.md`

#### audience

`human`

#### summary_table

Finding ID, severity, tier, and decision, one row per finding.

#### detailed_mitigations

Full change specifications, grouped by tier.

#### implementation_priority

The order the changes are applied in.

## Rules

### tier-ordering

Findings are ordered `T1` → `T2` → `T3` → `T4`, and within a tier by severity: Critical, High, Medium, Low. That order governs both the plan's `implementation_priority` and the sequence findings are considered in.

### only-accepted-changes-applied

A change reaches the target only under an `accept` or `modify` disposition. A skipped finding carries no mitigation text for a change to be made from.

### striking-a-claim-is-last-resort

A mitigation that removes a claim outright is reserved for a `T4` finding no other tier can answer, and the plan states the removal and why the claim was unanswerable. Silent removal leaves neither.
