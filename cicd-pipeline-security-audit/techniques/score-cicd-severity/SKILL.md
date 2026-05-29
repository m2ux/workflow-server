---
name: score-cicd-severity
description: "Apply severity scoring to CI/CD pipeline findings. Uses a two-dimensional rubric: Impact (what damage can result) x Exploitability (how easily an attacker can trigger it). Calibrated against the hackerbot-claw campaign outcomes where a Pwn Request chain led to full repository takeover (Critical) and expression injection led to code execution (High)."
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

# Score Cicd Severity

## Capability

Score CI/CD pipeline vulnerabilities using Impact x Exploitability rubric calibrated against real-world attack campaigns

## Inputs

### findings

List of findings from the merge agent, each with pattern ID, source, sink, and evidence

## Protocol

### 1. Load Rubric

- Use attached [cicd-severity-rubric](../../resources/cicd-severity-rubric/SKILL.md) (cicd-severity-rubric) for the Impact x Exploitability matrix

### 2. Score Individual

- For each finding, assess Impact tier (T1-T4) based on worst-case outcome
- For each finding, assess Exploitability tier (E1-E4) based on attacker prerequisites
- Map (Impact, Exploitability) to severity level using the rubric matrix

### 3. Score Compound

- Identify compound findings (multiple patterns on same workflow)
- Apply compound severity elevation rules from the rubric
- Compound vulnerabilities receive the higher of: individual max severity, or one level above individual max

### 4. Calibrate

- Cross-check severity assignments against campaign calibration anchors
- Adjust any finding that diverges by >= 2 levels from a matching anchor
- Severity must be consistent with known campaign outcomes

## Outputs

### scored-findings

Findings with severity levels and scoring rationale

- **severity_distribution**: Count by severity level
- **scoring_rationale**: Per-finding Impact and Exploitability assessment

## Rules

### evidence-based

Every severity assignment must cite the specific Impact and Exploitability factors
