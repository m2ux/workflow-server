# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Markdown resources providing the bootstrap navigation primer and prompt templates for sub-agent dispatch.

Tool reference content for Atlassian, GitNexus, and state management has moved into the corresponding capability skills' operations — each operation declares its own `tools` block and any `prose` reference content.

---

## Resource Index

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `00` | [Bootstrap Protocol](00-bootstrap-protocol.md) | Pre-session navigation primer — load schemas, then `start_session({ workflow_id: "meta", agent_id: "orchestrator" })` and save the returned `session_index`. | The agent at a blank-slate prompt |
| `01` | [Activity Worker Prompt](01-activity-worker-prompt.md) | Template prompt for spawning an activity-worker sub-agent | `workflow-engine::dispatch-activity` |
| `02` | [Workflow Orchestrator Prompt](02-workflow-orchestrator-prompt.md) | Template prompt for spawning a workflow-orchestrator sub-agent | Meta dispatch-client-workflow activity |

### Removed in v5/v6

| Resource | Where the content lives now |
|----------|-----------------------------|
| GitNexus Reference | Inlined into [`gitnexus-operations`](../skills/06-gitnexus-operations.toon) operations |
| Atlassian Tools | Inlined into [`atlassian-operations`](../skills/05-atlassian-operations.toon) operations |
| Workflow State Format | State persistence is server-managed (no agent-facing schema resource needed). The canonical on-disk shape is defined by [`schemas/session-file.schema.json`](../../../schemas/session-file.schema.json) and is documented in [`docs/state_management_model.md`](../../../docs/state_management_model.md). |

---

## Cross-Workflow Access

Any workflow can load these resources via:

```javascript
get_resource({ session_index, resource_id: "meta/00" })   // Bootstrap protocol
get_resource({ session_index, resource_id: "meta/01" })   // Activity worker prompt
get_resource({ session_index, resource_id: "meta/02" })   // Workflow orchestrator prompt
```

Skills declare lightweight `_resources` array entries (e.g., `"meta/activity-worker-prompt"`) — the loader returns these as references; full content is fetched on demand via `get_resource`.
