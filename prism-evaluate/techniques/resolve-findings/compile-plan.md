---
metadata:
  version: 1.1.0
---

## Capability

Compile the collected per-finding decisions into the mitigation plan and verify every finding has a corresponding plan entry.

## Outputs

### mitigation_plan_path

The written `MITIGATION-PLAN.md` path.

### accepted_count

How many findings carry an accepted or modified disposition.

## Protocol

### 1. Compile the Plan

- Compile `{mitigation_plan}` into `{output_path}` per the [Mitigation Plan Template](../../resources/mitigation-plan-template.md#mitigation-plan-template), populating `{mitigation_plan.summary_table}`, `{mitigation_plan.detailed_mitigations}`, and `{mitigation_plan.implementation_priority}` from `{accepted_mitigations}`.
- Record `{mitigation_plan_path}` as the path the document was written to.

### 2. Verify Coverage

- Verify every finding in `{evaluation_findings}` has an entry in `{mitigation_plan}`.
- Count the accepted and modified dispositions into `{accepted_count}`.
