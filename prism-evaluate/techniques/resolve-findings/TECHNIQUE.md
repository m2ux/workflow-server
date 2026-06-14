---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.3.0
  order: 2
  legacy_id: 2
---

## Capability

Classify each evaluation finding by mitigation difficulty, propose a finding-specific mitigation through structured one-by-one dialogue, compile the dispositions into a mitigation plan, and apply the accepted changes to the target.

## Inputs

### evaluation_report

The consolidated [evaluation report](../../resources/evaluation-report-template.md#evaluation-report-template) containing findings with IDs, severities, titles, descriptions, and referenced target sections.

### current_finding

The single finding under consideration, carrying its ID, severity, claim, critique, and tier.

## Outputs

### evaluation_findings

The findings extracted and tier-classified from `{evaluation_report}`, ordered for one-by-one presentation.

### accepted_mitigations

The collected per-finding decisions, each `{ finding_id, finding_severity, mitigation_type, mitigation_summary, user_decision }`.

### mitigation_plan

Comprehensive [mitigation plan](../../resources/mitigation-plan-template.md#mitigation-plan-template) with every finding's disposition.

#### artifact

`MITIGATION-PLAN.md`

#### summary_table

Finding ID, severity, tier, and decision for every finding.

#### detailed_mitigations

Full change specifications grouped by tier.

#### implementation_priority

Ordered list of changes for application.

### modified_target

The target document with the accepted mitigations applied.

## Rules

### one-finding-at-a-time

Each finding is presented individually — findings are never batched, even within one tier. The dialogue is sequential: present the finding, propose a mitigation, collect a decision, then move to the next finding.

### novel-solutions-over-deletion

For `T3` findings, the default is to propose a novel mechanism that preserves the original claim while addressing the critique; striking a claim is a last resort, reserved for `T4` findings that are absolutely non-feasible.

### preserve-claim-intent

When proposing reframing (`T2`) or a novel mitigation (`T3`), the proposed change preserves the author's intent and the claim's value while addressing the specific criticism.

### non-feasible-flagged-explicitly

A finding whose claim no mitigation can address without removing it is flagged explicitly as non-feasible with acknowledgement language, never silently struck.

### user-context-takes-precedence

Context the user provides during a `discuss` decision is incorporated into a revised proposal — the user's domain knowledge takes precedence over generic mitigation strategies.

### tier-ordering

Findings are presented and applied in tier order (`T1` → `T2` → `T3` → `T4`) and within each tier by severity (Critical → High → Medium → Low).

### only-accepted-changes-applied

Only mitigations the user accepted or modified are applied to the target; a skipped finding is never applied.
