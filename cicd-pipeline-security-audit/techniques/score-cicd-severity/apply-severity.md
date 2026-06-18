---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Score every finding on the Impact x Exploitability rubric: load the matrix, assess each finding's impact and exploitability tiers, and elevate compound findings.

## Protocol

### 1. Load Rubric

- Load the [Impact x Exploitability matrix](../../resources/cicd-severity-rubric.md#severity-matrix)

### 2. Score Individual

- For each finding, assess `{$impact_tier}` (T1-T4) based on worst-case outcome
- For each finding, assess `{$exploitability_tier}` (E1-E4) based on attacker prerequisites
- Map (`{impact_tier}`, `{exploitability_tier}`) to severity level using the rubric matrix

### 3. Score Compound

- Identify compound findings (multiple patterns on same workflow)
- Apply compound severity elevation from the rubric: a compound vulnerability takes the higher of its individual max severity, or one level above that max.
