# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Six markdown resources providing the bootstrap navigation primer, prompt templates for sub-agent dispatch, and reference documentation for the universal skills.

---

## Resource Index

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `00` | [Bootstrap Protocol](00-bootstrap-protocol.md) | Pre-session navigation primer — load schemas, then `start_session({ workflow_id: "meta" })`. Bootstrap does NOT identify targets, scan saved sessions, or branch on resume — those run as meta activities | The agent at a blank-slate prompt |
| `01` | [Activity Worker Prompt](01-activity-worker-prompt.md) | Template prompt for spawning an activity-worker sub-agent (substitution variables: `workflow_id`, `activity_id`, `session_token`, `agent_id`) | [`workflow-orchestrator`](../skills/10-workflow-orchestrator.toon) — `dispatch-activity` phase |
| `02` | [Workflow Orchestrator Prompt](02-workflow-orchestrator-prompt.md) | Template prompt for spawning a workflow-orchestrator sub-agent (substitution variables: `workflow_id`, `session_token`, `agent_id`) | [Dispatch Client Workflow](../activities/README.md#03-dispatch-client-workflow) — `compose-orchestrator-prompt` step |
| `03` | [GitNexus Reference](03-gitnexus-reference.md) | Checklists, pattern tables, examples, and CLI commands for GitNexus workflows (explore, impact, debug, refactor) | [`gitnexus-operations`](../skills/07-gitnexus-operations.toon) |
| `04` | [Atlassian Tools](04-atlassian-tools.md) | Complete reference for Atlassian MCP server tools (Jira and Confluence) — parameters, when-to-use, and return shapes | [`atlassian-operations`](../skills/06-atlassian-operations.toon) |
| `05` | [Workflow State Format](05-workflow-state-format.md) | Schema reference for `workflow-state.toon` — the file `save_state` and `restore_state` operate on. Top-level fields, state-object fields, stale-token handling | [`state-management`](../skills/02-state-management.toon), [`activity-worker`](../skills/09-activity-worker.toon), [`workflow-orchestrator`](../skills/10-workflow-orchestrator.toon) |

---

## Cross-Workflow Access

Any workflow can load these resources via:

```javascript
get_resource({ session_token, resource_id: "meta/00" })   // Bootstrap protocol
get_resource({ session_token, resource_id: "meta/01" })   // Activity worker prompt
get_resource({ session_token, resource_id: "meta/02" })   // Workflow orchestrator prompt
get_resource({ session_token, resource_id: "meta/03" })   // GitNexus reference
get_resource({ session_token, resource_id: "meta/04" })   // Atlassian tools
get_resource({ session_token, resource_id: "meta/05" })   // Workflow state format
```

Skills declare lightweight `_resources` array entries (e.g., `"meta/03"`) — the loader returns these as references; full content is fetched on demand via `get_resource`.

---

## Why these resources are not skills

Resources are markdown reference material consumed by agents at runtime. Skills are TOON definitions that encode protocol, rules, tools, and errors. The split is:

- **Skill** owns the procedural decisions and behavioural rules.
- **Resource** owns the lookup tables, examples, and large reference content the skill calls out to.

Conceptual guides that previously duplicated the docs (`activity-worker-guide`, `workflow-orchestrator-guide`) were removed in v4.0.0 — the docs in [docs/](../../../docs/) are the authoritative conceptual reference, and skills carry the procedural truth.
