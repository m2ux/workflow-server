---
metadata:
  version: 2.1.0
---

## Capability

Load the committed workflow definition fresh as the post-commit audit baseline, bypassing any cached pre-update state.

## Protocol

### 1. Reload Workflow

- Refresh the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source the full definition for the current `{target_workflow_id}` fresh from the workflow-server context the orchestrator supplies (fresh load each time; workers do not load full workflow definitions directly)
  >
  > When `{target_workflow_id}` is rebound across a multi-target set, reload that id only.
