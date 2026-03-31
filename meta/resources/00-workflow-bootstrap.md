# Bootstrap Procedure

## Steps

1. **list_workflows** — Discover available workflows. Match the user's goal to a workflow from the returned list.
2. **start_session** — Call with the chosen `workflow_id`. Returns workflow metadata and an opaque session token.
3. **get_skills** — Call with `workflow_id` and the session token. Returns behavioral protocols (session-protocol, agent-conduct) and workflow-specific skills with rules, protocols, and referenced resources.

## Session Protocol

- Pass the `session_token` to all subsequent tool calls. The token enables server-side validation.
- Use the updated token from each response's `_meta.session_token` field for the next call.
- Treat the token as opaque — do not parse, decode, or fabricate tokens.
- Check `_meta.validation` for warnings (workflow mismatch, invalid transition, version drift).
- Token-exempt tools: `discover`, `list_workflows`, `start_session`, `health_check`.
