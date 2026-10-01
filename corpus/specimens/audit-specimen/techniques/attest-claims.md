---
metadata:
  version: 1.0.0
---

## Capability

Record the attest script's verdict on the three claim files.

## Inputs

### units_listed

Units the listing command printed for `technique.capability`.

### units_used

Units the author step applied, each with an application result.

### unit_ledger

The ledger row for every inventory id.

### audit_findings

Findings of the audit that met the planted sentence.

### reaudit_ledger

The ledger after the fix.

### reaudit_finding_count

The number of findings the re-audit records.

## Outputs

### claim_attestation

The attest script's verdict. `pass` when the three claims hold.

## Protocol

### 1. Write the files

- Under the session planning folder, write `units-listed.txt`, `units-used.tsv`, `unit-ledger.tsv`, `audit-findings.tsv`, `reaudit-ledger.tsv`, `reaudit-findings.tsv`, and `specimen-rounds.txt` from `{units_listed}`, `{units_used}`, `{unit_ledger}`, `{audit_findings}`, `{reaudit_ledger}`, and `{reaudit_finding_count}`. `specimen-rounds.txt` holds `1`. `reaudit-findings.tsv` holds one row per re-audit finding.

### 2. Attest

- Run `python3 scripts/attest.py check --corpus <corpus> --engine <engine> --baseline corpus/specimens/audit-specimen/baseline-rounds.txt --out <planning folder>` from this specimen. Write the script's stdout into `{claim_attestation}`.
