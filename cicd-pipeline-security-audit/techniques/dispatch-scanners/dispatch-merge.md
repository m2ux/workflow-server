---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 7
  legacy_id: 7
---

## Capability

Compose the merge (M) sub-agent context and dispatch it to deduplicate, correlate, and reconcile findings.

## Protocol

### 1. Dispatch Merge

- Compose the M agent context `{$merge_prompt}` — all scanner output file paths, the verification report, the [severity rubric](../../resources/cicd-severity-rubric.md#severity-matrix), and bootstrap instructions (`start_session(session_token, agent_id)`, then `next_activity({ activity_id: 'sub-merge' })`) — and dispatch it through [harness-compat](../../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../../meta/techniques/harness-compat/spawn-agent.md)(composed_prompt: `{merge_prompt}`).
