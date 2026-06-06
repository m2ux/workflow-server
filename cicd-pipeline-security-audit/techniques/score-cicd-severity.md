---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Score CI/CD pipeline vulnerabilities using a two-dimensional rubric — Impact (what damage can result) x Exploitability (how easily an attacker can trigger it) — calibrated against real-world attack campaign outcomes, such as a Pwn Request chain leading to full repository takeover (Critical) and expression injection leading to code execution (High).

## Inputs

### findings

Unified list of findings, each with pattern ID, source, sink, and evidence

## Protocol

### 1. Load Rubric

- Use attached [cicd-severity-rubric](../resources/cicd-severity-rubric.md) (cicd-severity-rubric) for the Impact x Exploitability matrix

### 2. Score Individual

- For each finding, assess `{$impact-tier}` (T1-T4) based on worst-case outcome
- For each finding, assess `{$exploitability-tier}` (E1-E4) based on attacker prerequisites
- Map (`{$impact-tier}`, `{$exploitability-tier}`) to severity level using the rubric matrix

### 3. Score Compound

- Identify compound findings (multiple patterns on same workflow)
- Apply compound severity elevation from the rubric: a compound vulnerability takes the higher of its individual max severity, or one level above that max.

### 4. Calibrate

- Cross-check severity assignments against the campaign [calibration anchors](../resources/cicd-severity-rubric.md#calibration-anchors)
- Adjust any finding that diverges by >= 2 levels from a matching anchor
- Emit the calibrated `scored-findings`, each carrying its final severity level and scoring rationale

## Outputs

### scored-findings

Findings with severity levels and scoring rationale

#### severity-distribution

Count by severity level

#### scoring-rationale

Per-finding Impact and Exploitability assessment

## Rules

### evidence-based

Every severity assignment must cite the specific Impact and Exploitability factors

### campaign-consistency

Every severity assignment must be consistent with known campaign outcomes.
