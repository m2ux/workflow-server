---
metadata:
  version: 1.0.0
---

## Capability

Independent re-derivation of the high-severity findings a criteria walk produced, with severity recalibrated and the decision surface counted.

## Inputs

### audit_findings

The findings a criteria walk produced, each carrying its criteria entry, location, evidence, severity, origin and known marking.

### coverage_ledger

One row per enumeration unit the walk covered, each carrying its home, its anchor and its status.

## Outputs

### verified_findings

The recalibrated finding set: each High marked confirmed, downgraded or withdrawn with the evidence of its re-derivation, and each surviving Medium spot-confirmed. Only entries in this set are eligible to drive a fix.

### open_finding_count

Number of findings on the decision surface after recalibration — confirmed and downgraded entries, excluding withdrawn ones and those marked known.

### has_critical_finding

True when any surviving finding is `Critical` severity: a schema-invalid or structurally broken construct that must not be committed.

### has_coverage_gap

True when any row of `{coverage_ledger}` carries status `blocked`, or when any row carries status `walked` while intersecting the change surface yet omits the required `evidence` list. Rows carrying `not-applicable` are evidenced negatives and do not set it.

## Protocol

### 1. Re-Derive Every High Finding

- For each High-severity entry in `{audit_findings}`, re-derive the violation from the cited file and construct alone, refuting by default: it survives only when the re-derivation independently reproduces it against the construct the finding names
- Record for each what construct was inspected and whether the violation was reproduced

### 2. Recalibrate Severity

- Withdraw any High the re-derivation failed to reproduce; downgrade one whose evidence supports only a lesser issue; raise severity only where the re-derivation surfaces a graver problem than the original rating

### 3. Confirm the Surviving Mediums

- Spot-confirm each surviving Medium: the cited construct exists and the finding class is right. This is a confirmation, not a full re-derivation.

### 4. Cross-Check the Coverage and Count the Surface

- Check `{coverage_ledger}` against the enumeration inventory the walking operation holds — [Enumerate the Criteria Units](./audit-canon.md#1-enumerate-the-criteria-units) — and declare no inventory here
- Treat a `walked` row that reaches changed files without `evidence` as a coverage gap (same weight as `blocked`)
- Emit `{verified_findings}`, `{open_finding_count}`, `{has_critical_finding}` and `{has_coverage_gap}` at the shapes their Output declarations state

## Rules

### refute-by-default

A High finding is confirmed only when independently re-derived from the construct it cites. An unreproduced finding is withdrawn, never carried forward on the strength of the pass that raised it.

### no-originating-rationale

The re-derivation reads the cited construct and nothing else. The originating pass's reasoning is not consulted — not to follow it and not to check agreement with it — because a re-derivation that has read the argument it is testing is not independent.

### remediation-needs-a-re-derived-claim

Do not emit a remediation instruction for a row whose claim has not been re-derived. A withdrawn or unexamined finding drives no edit, whatever its original severity said.

### empty-evidence-is-a-gap

A coverage row marked `walked` without the evidence list [walked-requires-evidence](./audit-canon.md#walked-requires-evidence) demands sets `{has_coverage_gap}` true. Narrative completeness is not coverage.
