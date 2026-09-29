---
metadata:
  version: 1.3.0
---

## Capability

Independent verification of High-tier audit findings, with severity recalibrated.

## Inputs

### expressiveness_findings

*(optional)* The schema-expressiveness findings, when that audit ran.

### conformance_findings

*(optional)* The convention-conformance divergences, when that audit ran.

### rule_hygiene_findings

*(optional)* The rule-hygiene findings, when that audit ran.

### enforcement_findings

*(optional)* The text-only rules the structure-backed-constraint audit found, when that audit ran.

### principle_findings

*(optional)* The design-principle classifications, when that audit ran.

### anti_pattern_findings

*(optional)* The anti-pattern catalog findings, when that audit ran.

## Outputs

### verified_findings

The recalibrated finding set after verification — each High finding marked confirmed, downgraded, or withdrawn with its re-derivation evidence, and each surviving Medium finding spot-confirmed — at the shape [Template](../resources/findings-satellite.md#template) declares.

#### artifact

`verified-findings.md`

#### audience

`human`

## Protocol

### 1. Re-Derive High Findings Adversarially

- For each High-tier finding in `{expressiveness_findings}`, `{conformance_findings}`, `{rule_hygiene_findings}`, `{enforcement_findings}`, `{principle_findings}` and `{anti_pattern_findings}`, whichever are bound, re-derive it from the cited file and construct alone, without reading the originating pass's reasoning — refute by default. A finding survives only when the adversarial re-derivation independently reproduces it against the construct it names.
- Record the re-derivation evidence for each High: the construct inspected and whether the finding was independently reproduced.

### 2. Recalibrate Severity

- Withdraw any High finding the re-derivation failed to reproduce; downgrade a High whose evidence supports only a lesser issue; raise severity only where the re-derivation surfaces a graver problem than originally rated.

### 3. Confirm Medium Findings

- Run a lighter confirmation pass over surviving Medium findings from the same sets: spot-confirm that the cited construct exists and the finding class is right. No full adversarial re-derivation.

### 4. Assemble Verified Findings

- Assemble `{verified_findings}` from the recalibrated Highs and confirmed Mediums, at the shape [Template](../resources/findings-satellite.md#template) declares

## Rules

### refute-by-default

A High finding is confirmed only when independently re-derived from the construct it cites; an unreproduced finding is withdrawn, never carried into remediation on the strength of the originating pass alone.

### survivors-drive-fixes

Only findings that survive this pass — confirmed Highs and confirmed Mediums — are eligible to drive fixes.
