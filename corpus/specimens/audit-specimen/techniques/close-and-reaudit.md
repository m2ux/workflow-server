---
metadata:
  version: 1.0.0
---

## Capability

Remove the planted avoidance sentence and write the claim report.

## Inputs

### units_listed

Units the listing command printed for `technique.capability`.

### units_used

Units the author step loaded for the capability rewrite.

### unit_ledger

The ledger row for every canon unit.

### audit_findings

Findings of the audit that met the planted sentence.

## Outputs

### reaudit_finding_count

The number of findings the re-audit records. After this fix it is zero.

### claim_report

The three claims, shaped by [Template](../resources/claim-report.md#template).

#### artifact

`audit-specimen-report.md`

#### audience

`human`

## Protocol

### 1. Close

- Delete `It does not use inline content.` from `techniques/subject.md` `## Capability`. Leave the sentence that states what the technique does.

### 2. Re-audit

- Walk the capability paragraph again. Write `{reaudit_finding_count}` as the number of findings. No finding remains.

### 3. Report

- Write `{claim_report}` with `{units_listed}`, `{units_used}`, `{unit_ledger}`, `{audit_findings}`, and `{reaudit_finding_count}`.
