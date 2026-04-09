---
id: activity-management-tools
version: 1.0.0
---

# Activity Management MCP Tool Reference

Checklists, tool parameter details, and step-by-step procedures for interacting with the workflow-server MCP, specifically tailored for the **activity-worker** role.

---

## Contents

1. [Quick Reference](#1-quick-reference) — Core tools for activity management
2. [Session Bootstrapping](#2-session-bootstrapping) — Inheriting a workflow execution
3. [Resource Loading](#3-resource-loading) — Fetching skills and text content

---

## 1. Quick Reference

### Core Session Operations (Token Required)

Every call after `start_session` requires the `session_token` parameter, which encodes the current state, workflow ID, and identity of the session.

| Tool | When to Use | Key Params | Returns |
|------|-------------|------------|---------|
| `start_session` | Initial dispatch to inherit a session from the orchestrator | `workflow_id`, `session_token` (from orchestrator), `agent_id` | Initial `session_token` and metadata |
| `get_skills` | Loading workflow-level behavioral protocols | `session_token` | Universal and workflow-level skills |
| `get_workflow` | Loading workflow structure (typically done by orchestrator, but available to worker) | `session_token`, optional `summary` | Workflow details including `initialActivity` |
| `next_activity` | Transitioning to the first or next activity | `session_token`, `activity_id` (MUST use `initialActivity` ID from `get_workflow` on first call; transitions for subsequent calls) | Activity definition, trace token, embedded checkpoints |
| `get_skill` | Loading a specific step's skill | `session_token`, `step_id` | Skill details and resource references |
| `get_resource` | Fetching text content for a resource reference | `session_token`, `resource_index` | Full resource text content |

---

## 2. Session Bootstrapping

### When to Use

- A sub-agent being dispatched to handle a specific client workflow.

### Checklist

```
- [ ] Call `start_session` (pass existing `session_token` from the orchestrator)
- [ ] Save the returned `session_token` — it is required for all subsequent calls.
- [ ] Call `get_skills` to load the universal and workflow-level behavioral protocols.
```

### Example: Inheriting a Session

```
1. start_session({ workflow_id: "work-package", session_token: "tok_parent123...", agent_id: "worker-1" })
   → Returns session_token: "tok_worker456..."

2. get_skills({ session_token: "tok_worker456..." })
   → Returns skills like 00-session-protocol, 11-activity-worker
```

---

## 3. Resource Loading

### When to Use

- You need to read the full text of a skill or resource referenced by an index.
- A step definition declares a skill that you haven't loaded yet.

### Checklist

```
- [ ] Note the `step_id` requiring a skill, or the `resource_index` from a `_resources` list.
- [ ] Call `get_skill({ session_token, step_id })` to load the skill definition.
- [ ] For any `_resources` references inside the skill (e.g., `"04"`), call `get_resource({ session_token, resource_index: "04" })`.
- [ ] Read the returned text content directly. DO NOT attempt to read the file from disk using a shell command.
```

### Example: Loading a Step's Skill and its Resources

```
1. Step "analyze-impact" declares skill "gitnexus-operations"
2. get_skill({ session_token: "tok_worker456...", step_id: "analyze-impact" })
   → Returns skill protocol, rules, and _resources: ["04"]
3. get_resource({ session_token: "tok_worker456...", resource_index: "04" })
   → Returns the full markdown text of the gitnexus-reference resource.
```
