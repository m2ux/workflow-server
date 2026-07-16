# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Markdown resources providing the bootstrap navigation primer, prompt templates for sub-agent dispatch, and shared cross-workflow reference structures (such as the canonical planning-folder README guide).

Tool reference content for Atlassian, GitNexus, and state management has moved into the corresponding capability techniques' operations — each operation declares its own `tools` block and any `prose` reference content.

---

## Resource Index

| Resource ID | Resource | Purpose |
|-------------|----------|---------|
| `bootstrap-protocol` | [Bootstrap Protocol](./bootstrap-protocol.md) | Pre-session stub served by `discover` — schema fetch, `start_session` (planning_folder + `context_mode` topology), `get_workflow`; ongoing delivery policy lives in the operations bundle. |
| `activity-worker-prompt` | [Activity Worker Prompt](./activity-worker-prompt.md) | Template prompt for spawning an activity-worker sub-agent |
| `workflow-orchestrator-prompt` | [Workflow Orchestrator Prompt](./workflow-orchestrator-prompt.md) | Template prompt for spawning a workflow-orchestrator sub-agent |
| `session-summary-template` | [Session Summary Template](./session-summary-template.md) | Skeleton for the markdown session summary composed at workflow close |
| `planning-readme` | [Planning Folder README Guide](./planning-readme.md) | Canonical structure + rules for the `README.md` entry-point of any workflow's planning folder; per-workflow README templates conform to it |

### Removed in v5/v6

| Resource | Where the content lives now |
|----------|-----------------------------|
| GitNexus Reference | Inlined into [`gitnexus-operations`](../techniques/gitnexus-operations/TECHNIQUE.md) operations |
| Atlassian Tools | Inlined into [`atlassian-operations`](../techniques/atlassian-operations/TECHNIQUE.md) operations |
| Workflow State Format | State persistence is server-managed (no agent-facing schema resource needed). The canonical on-disk shape is defined by [`schemas/session-file.schema.json`](../../../schemas/session-file.schema.json) and is documented in [`docs/state_management_model.md`](../../../docs/state_management_model.md). |

---

## Cross-Workflow Access

Any workflow can load these resources via:

```javascript
get_resource({ session_index, resource_id: "meta/bootstrap-protocol" })   // Bootstrap protocol
get_resource({ session_index, resource_id: "meta/activity-worker-prompt" })   // Activity worker prompt
get_resource({ session_index, resource_id: "meta/workflow-orchestrator-prompt" })   // Workflow orchestrator prompt
```

Techniques declare lightweight `_resources` array entries (e.g., `"meta/activity-worker-prompt"`) — the loader returns these as references; full content is fetched on demand via `get_resource`.
