---
metadata:
  version: 1.0.0
---

## Capability

Score CI/CD pipeline vulnerabilities using a two-dimensional rubric — Impact (what damage can result) x Exploitability (how easily an attacker can trigger it) — calibrated against real-world attack campaign outcomes, such as a Pwn Request chain leading to full repository takeover (Critical) and expression injection leading to code execution (High). The operations in this set decompose that scoring into rubric-based severity assignment and campaign calibration.

## Inputs

### merged_findings

Unified [finding set](../../resources/intermediate-artifact-schemas.md#merged-findings), each finding carrying pattern ID, source, sink, and evidence.

## Outputs

### scored_findings

Findings with severity levels and scoring rationale

#### severity_distribution

Count by severity level

#### scoring_rationale

Per-finding Impact and Exploitability assessment

## Rules

### evidence-based

Every severity assignment must cite the specific Impact and Exploitability factors

### campaign-consistency

Every severity assignment must be consistent with known campaign outcomes.
