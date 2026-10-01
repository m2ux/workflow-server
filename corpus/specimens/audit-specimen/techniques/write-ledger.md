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

- Run `python3 scripts/attest.py inventory --corpus <corpus> --engine <engine>` from this specimen. Each printed id is one unit.

### 2. Walk

- Apply every printed unit to `techniques/subject.md`, the whole file. Where the unit's own wording excludes that file, record `not-applicable` and quote the excluding wording. Otherwise record `walked` and `applied`, or `walked` and `finding:` plus the sentence.
- Write `{unit_ledger}` as one row per printed id: the id, a tab, the status, a tab, and the result.
- Write `{audit_findings}` as one row per finding: the unit id, a tab, the file, a tab, and the sentence. The capability sentence `It does not use inline content.` is an AP-41 finding.
