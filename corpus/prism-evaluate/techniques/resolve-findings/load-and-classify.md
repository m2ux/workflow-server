---
metadata:
  version: 2.0.0
---

## Capability

Turns the report's findings into a worklist: each one located in the target, sized by what answering it would take, and put in the order they are worked through.

## Protocol

### 1. Draw the Findings Out

- Read `{evaluation_report}` and record `{evaluation_findings}` with their IDs, severities, titles, descriptions, and the target sections they reference.

### 2. Locate Each in the Target

- Read the target at `{target_path}` and attach to each finding the text, section, or claim it disputes.  
  > Where a finding's referenced text is not in the current target, record it as unlocatable — the target may have moved on since the evaluation.

### 3. Classify and Order

- Classify each finding into its tier per [Mitigation Tiers](../../resources/mitigation-plan-template.md#mitigation-tiers), and order `{evaluation_findings}` per `tier-ordering`.
