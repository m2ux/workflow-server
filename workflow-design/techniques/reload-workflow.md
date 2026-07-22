---
metadata:
  version: 2.1.0
---

## Capability

Fresh post-commit workflow definition as the audit baseline.

## Protocol

### 1. Reload Workflow

- Refresh via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and load `{target_workflow_id}` from orchestrator-supplied definitions ([orchestrator-no-domain-work](../../meta/techniques/agent-conduct.md#orchestrator-no-domain-work))
  >
  > When `{target_workflow_id}` is rebound across a multi-target set, reload that id only.
