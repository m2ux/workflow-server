---
metadata:
  version: 1.3.0
---

## Capability

Independent High-tier audit-finding verification before remediation.

## Outputs

### verified_findings

The recalibrated finding set after verification — each High finding marked confirmed, downgraded, or withdrawn with its re-derivation evidence, and each surviving Medium finding spot-confirmed.

#### artifact

`verified-findings.md`

#### audience

`human`

## Protocol

### 1. Re-Derive High Findings Adversarially

- For each High-tier finding, re-derive it from the cited file and construct alone, without reading the originating pass's reasoning — refute by default. A finding survives only when the adversarial re-derivation independently reproduces it against the construct it names.
- Record the re-derivation evidence for each High: the construct inspected and whether the finding was independently reproduced.

### 2. Recalibrate Severity

- Withdraw any High finding the re-derivation failed to reproduce; downgrade a High whose evidence supports only a lesser issue; raise severity only where the re-derivation surfaces a graver problem than originally rated.

### 3. Confirm Medium Findings

- Run a lighter confirmation pass over surviving Medium findings: spot-confirm that the cited construct exists and the finding class is right. No full adversarial re-derivation.

## Rules

### refute-by-default

A High finding is confirmed only when independently re-derived from the construct it cites; an unreproduced finding is withdrawn, never carried into remediation on the strength of the originating pass alone.

### verify-before-remediation

Verification precedes remediation. Only findings that survive this pass — confirmed Highs and confirmed Mediums — are eligible to drive fixes.
