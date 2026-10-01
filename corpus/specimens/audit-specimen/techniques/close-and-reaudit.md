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

### unit_ledger

The ledger row for every inventory id, from the walk that produced the findings.

## Outputs

### reaudit_finding_count

The number of findings the re-audit records.

### reaudit_ledger

One row per inventory id after the fix. Each row names the unit, `walked` or `not-applicable`, and the result of applying it again.

### claim_report

The three claims, shaped by [Template](../resources/claim-report.md#template).

#### artifact

`audit-specimen-report.md`

#### audience

`human`

## Protocol

### 1. Close

- Delete `It does not use inline content.` from `techniques/subject.md` `## Capability`. Leave the sentence that states what the technique does. Record the specimen round count as `1`.

### 2. Re-audit

- Apply again every unit `{unit_ledger}` marks `walked`, to the whole subject file. Write `{reaudit_ledger}` in the ledger's row shape. Write `{reaudit_finding_count}` as the number of finding rows.

### 3. Report

- Write `{claim_report}` with `{units_listed}`, `{units_used}`, `{unit_ledger}`, `{audit_findings}`, `{reaudit_ledger}`, and `{reaudit_finding_count}`.
