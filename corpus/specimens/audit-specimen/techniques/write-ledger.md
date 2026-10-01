---
metadata:
  version: 1.0.0
---

## Capability

Write a ledger row for every canon unit, and the findings of applying each walked unit to the subject.

## Outputs

### unit_ledger

One row per canon unit at this commit. Each row names the unit and is `walked` or `not-applicable`. A `not-applicable` row quotes the unit's own wording that excludes the subject file.

### audit_findings

Findings from the walked units, each naming the entry, the file, and the offending sentence.

## Protocol

### 1. Enumerate

- List every unit at this commit. Anti-pattern units are each `##` family and each `### AP-XX` entry. Principle units are each numbered `##`. Convention units are each `##` section. Guard units are each registry entry.

### 2. Walk

- Apply every unit to `techniques/subject.md`, the whole file. Where the unit's own wording excludes that file, record `not-applicable` and quote the excluding wording. Otherwise record `walked` and apply its Detect.
- Write every row into `{unit_ledger}`.
- Write each finding into `{audit_findings}`. The capability sentence `It does not use inline content.` is an AP-41 finding.
