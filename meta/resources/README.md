# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Markdown resources providing the bootstrap navigation primer, prompt templates for sub-agent dispatch, and reference documentation for the universal skills.

Tool reference content for Atlassian and (most of) GitNexus has moved into the corresponding capability skills' operations under v5 of the meta workflow — each operation declares its own `tools` block and any `prose` reference content (e.g., the impact depth/risk table). The `gitnexus-reference` resource is retained for legacy use by client workflows that have not yet migrated to operation-focused references.

---

## Resource Index

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `00` | [Bootstrap Protocol](00-bootstrap-protocol.md) | Pre-session navigation primer — load schemas, then `start_session({ workflow_id: "meta" })`. | The agent at a blank-slate prompt |
| `01` | [Activity Worker Prompt](01-activity-worker-prompt.md) | Template prompt for spawning an activity-worker sub-agent | `workflow-engine::dispatch-activity` and the legacy workflow-orchestrator skill |
| `02` | [Workflow Orchestrator Prompt](02-workflow-orchestrator-prompt.md) | Template prompt for spawning a workflow-orchestrator sub-agent | Meta dispatch-client-workflow activity |
| `03` | [GitNexus Reference](03-gitnexus-reference.md) | Checklists, worked examples, CLI commands for GitNexus task patterns (legacy). Per-tool refs and the depth/risk table are inlined into [`gitnexus-operations`](../skills/07-gitnexus-operations.toon) operations | Legacy work-package skill `build-comprehension` |
| `05` | [Workflow State Format](05-workflow-state-format.md) | Schema reference for `workflow-state.toon` — the file `save_state` and `restore_state` operate on | [`state-management`](../skills/02-state-management.toon), [`workflow-engine`](../skills/08-workflow-engine.toon) |

> Index `04` (atlassian-tools) was removed in v5 — Atlassian tool references now live inline on each [`atlassian-operations`](../skills/06-atlassian-operations.toon) operation.

---

## Cross-Workflow Access

Any workflow can load these resources via:

```javascript
get_resource({ session_token, resource_id: "meta/00" })   // Bootstrap protocol
get_resource({ session_token, resource_id: "meta/01" })   // Activity worker prompt
get_resource({ session_token, resource_id: "meta/02" })   // Workflow orchestrator prompt
get_resource({ session_token, resource_id: "meta/03" })   // GitNexus reference (legacy)
get_resource({ session_token, resource_id: "meta/05" })   // Workflow state format
```

Skills declare lightweight `_resources` array entries (e.g., `"meta/05"`) — the loader returns these as references; full content is fetched on demand via `get_resource`.
