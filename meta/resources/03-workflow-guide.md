---
id: workflow-guide
version: 1.0.0
---

# Workflow Concepts and Tools

Foundational concepts and tool interactions.

## 1. Session Tokens

Every tool call after `start_session` requires the `session_token` parameter, which encodes the current state, workflow ID, and identity of the session.

- Tools return an updated token in their response. **Always use the most recent token.**
- Sub-agents either inherit a token from their parent or are dispatched with a new, independent client token (refer to your role-specific guide).

## 2. Shared Tools

The following tools are available across all roles (once a session is established):

| Tool | When to Use | Key Params | Returns |
|------|-------------|------------|---------|
| `get_skills` | Loading workflow-level behavioral protocols | `session_token` | Universal and workflow-level skills |
| `get_skill` | Loading a specific step's skill, or the activity's primary skill | `session_token`, optional `step_id` | Skill details and resource references |
| `get_resource` | Fetching text content for a resource reference | `session_token`, `resource_index` | Full resource text content |
| `next_activity` | Transitioning to an activity or loading activity definition | `session_token`, `activity_id`, optional `step_manifest` | Activity definition, embedded checkpoints |