# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Markdown resources providing the bootstrap navigation primer and prompt templates for sub-agent dispatch.

Tool reference content for Atlassian, GitNexus, and state management has moved into the corresponding capability skills' operations under v5 of the meta workflow — each operation declares its own `tools` block and any `prose` reference content.

---

## Resource Index

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `00` | [Bootstrap Protocol](00-bootstrap-protocol.md) | Pre-session navigation primer — load schemas, then `start_session({ workflow_id: "meta" })`. | The agent at a blank-slate prompt |
| `01` | [Activity Worker Prompt](01-activity-worker-prompt.md) | Template prompt for spawning an activity-worker sub-agent | `workflow-engine::dispatch-activity` and the legacy workflow-orchestrator skill |
| `02` | [Workflow Orchestrator Prompt](02-workflow-orchestrator-prompt.md) | Template prompt for spawning a workflow-orchestrator sub-agent | Meta dispatch-client-workflow activity |

### Removed in v5

| Index | Resource | Where the content lives now |
|-------|----------|---------------------------|
| `03` | GitNexus Reference | Inlined into [`gitnexus-operations`](../skills/07-gitnexus-operations.toon) operations |
| `04` | Atlassian Tools | Inlined into [`atlassian-operations`](../skills/06-atlassian-operations.toon) operations |
| `05` | Workflow State Format | State persistence is now agent-managed (no schema resource needed) |

---

## Cross-Workflow Access

Any workflow can load these resources via:

```javascript
get_resource({ session_token, resource_id: "meta/00" })   // Bootstrap protocol
get_resource({ session_token, resource_id: "meta/01" })   // Activity worker prompt
get_resource({ session_token, resource_id: "meta/02" })   // Workflow orchestrator prompt
```

Skills declare lightweight `_resources` array entries (e.g., `"meta/activity-worker-prompt"`) — the loader returns these as references; full content is fetched on demand via `get_resource`.
