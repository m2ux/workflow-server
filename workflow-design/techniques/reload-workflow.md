---
metadata:
  version: 2.0.0
---

## Capability

Load the committed workflow definition fresh as the post-commit audit baseline, bypassing any cached pre-update state.

## Protocol

### 1. Reload Workflow

- Refresh the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source the full definition for `{target_workflow_id}` fresh from the workflow-server context the orchestrator supplies — do not reuse cached pre-update state, and do not call `get_workflow` directly (the executing worker sources the definition from orchestrator-provided context)
