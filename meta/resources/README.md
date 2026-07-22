# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Markdown resources providing the bootstrap navigation primer and shared cross-workflow reference structures (such as the canonical planning-folder README guide). Agent entry Protocol lives on workflow-engine techniques ([activity-worker](../techniques/workflow-engine/activity-worker.md), [workflow-orchestrator](../techniques/workflow-engine/workflow-orchestrator.md)); spawn stubs are composed by [compose-prompt](../techniques/workflow-engine/compose-prompt.md).

Tool reference content for Atlassian, GitNexus, and state management has moved into the corresponding capability techniques' operations — each operation declares its own `tools` block and any `prose` reference content.

---

## Resource Index

| Resource ID | Resource | Purpose |
|-------------|----------|---------|
| `bootstrap-protocol` | [Bootstrap Protocol](./bootstrap-protocol.md) | Pre-session stub served by `discover` — schema fetch → `start_session` → `get_workflow`; cites [start-session](../techniques/workflow-engine/start-session.md) / [workflow-engine](../techniques/workflow-engine/TECHNIQUE.md) for folder topology and delivery policy. |
| `session-summary-template` | [Session Summary Template](./session-summary-template.md) | Skeleton for the markdown session summary composed at workflow close |
| `planning-readme` | [Planning Folder README Guide](./planning-readme.md) | Universal Template + Progress Status policy for planning-folder `README.md`; Progress inventory comes from each workflow's readme-seed profile |

### Removed

| Resource | Where the content lives now |
|----------|-----------------------------|
| `activity-worker-prompt` | [`workflow-engine::activity-worker`](../techniques/workflow-engine/activity-worker.md) (+ [compose-prompt](../techniques/workflow-engine/compose-prompt.md) stub) |
| `workflow-orchestrator-prompt` | [`workflow-engine::workflow-orchestrator`](../techniques/workflow-engine/workflow-orchestrator.md) (+ [compose-prompt](../techniques/workflow-engine/compose-prompt.md) stub) |
| GitNexus Reference | Inlined into [`gitnexus-operations`](../techniques/gitnexus-operations/TECHNIQUE.md) operations |
| Atlassian Tools | Inlined into [`atlassian-operations`](../techniques/atlassian-operations/TECHNIQUE.md) operations |
| Workflow State Format | State persistence is server-managed (no agent-facing schema resource needed). The canonical on-disk shape is defined by [`schemas/session-file.schema.json`](../../../schemas/session-file.schema.json) and is documented in [`docs/state_management_model.md`](../../../docs/state_management_model.md). |

---

## Cross-Workflow Access

Cross-workflow ids use the `meta/<resource-id>` form (e.g. `meta/bootstrap-protocol`, `meta/planning-readme`). Load via [resource-loading-via-tool](../techniques/workflow-engine/TECHNIQUE.md#resource-loading-via-tool).
