---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Load the committed workflow definition fresh from the workflow-server as the post-commit audit baseline, bypassing any cached pre-update state.

## Protocol

### 1. Reload Workflow

- Load the full definition for `{target_workflow_id}` fresh from the workflow-server via `list_workflows` and `get_workflow` — do not reuse cached pre-update state
