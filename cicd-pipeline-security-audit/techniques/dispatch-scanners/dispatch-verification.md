---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Compose the verification (V) sub-agent context and dispatch it to produce the coverage gap report.

## Protocol

### 1. Dispatch Verification

- Compose the V agent context `{$verification_prompt}` — all scanner output file paths, the `{workflow_inventory}`, and bootstrap instructions (`start_session(session_token, agent_id)`, then `next_activity({ activity_id: 'sub-verification' })`) — and dispatch it through [harness-compat](../../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../../meta/techniques/harness-compat/spawn-agent.md)(prompt: `{verification_prompt}`).
