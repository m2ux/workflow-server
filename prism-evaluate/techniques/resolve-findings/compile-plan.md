---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Compile the collected per-finding decisions into the mitigation plan and verify every finding has a corresponding plan entry.

## Protocol

- Compile `{mitigation_plan}` into `{output_path}` using the [mitigation plan template](../../resources/mitigation-plan-template.md#mitigation-plan-template): a `{mitigation_plan.summary_table}` (ID, severity, tier, decision), `{mitigation_plan.detailed_mitigations}` grouped by tier with the full proposed text for each accepted mitigation, and a `{mitigation_plan.implementation_priority}` order.
- Verify every finding in `{evaluation_report}` has a corresponding entry in `{mitigation_plan}` (accepted, modified, or skipped).
