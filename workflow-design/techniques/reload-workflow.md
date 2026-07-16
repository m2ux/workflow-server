---
metadata:
  version: 2.0.0
---

## Capability

Load the committed workflow definition fresh as the post-commit audit baseline, bypassing any cached pre-update state.

## Protocol

### 1. Reload Workflow

- Refresh the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source the full definition for the current `{target_workflow_id}` fresh from the workflow-server context the orchestrator supplies — the executing worker sources the definition from orchestrator-provided context (fresh load each time; no direct `get_workflow` call)
- In review mode inside the multi-target `forEach`, `{target_workflow_id}` is the loop-bound current id from `{target_workflow_ids}`; reload that id only for this iteration.
