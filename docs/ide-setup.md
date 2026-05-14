# Workflow Server IDE Setup

This guide explains how to configure your IDE so that the agent connects to the workflow server correctly on every workflow request.

## Bootstrap Rule

Add the following to your IDE's "always-applied" rule set (Cursor rule, Claude Code project rule, etc.):

```
For any start workflow, create work package, or resume work package request, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

If the user provides a `session_token`, pass it to subsequent workflow-server calls per their instructions.
```

The rule wires natural-language requests ("start a work package", "resume the workflow", "begin a workflow") into the server's bootstrap procedure. The agent always calls `discover` first — which returns the server name, version, and the full bootstrap sequence — before doing anything else.

## What the Bootstrap Returns

`discover` returns:

- **Server name and version** — confirms which workflow server the agent is talking to.
- **Bootstrap procedure** — the canonical tool-calling sequence the agent must follow (`list_workflows` → `start_session` → `get_workflow` → `next_activity` → `get_activity`, with checkpoint discipline rules layered in).
- **Available workflows** — workflow IDs, titles, and tags. The agent matches the user's request against these.

Because `discover` is the entry point, the procedure stays in sync with the server. You do not need to maintain a separate copy of the protocol in your IDE rules — the rule above only has to enforce "call `discover` first."

## Schema Awareness (Optional)

The server also exposes the JSON Schemas for `workflow`, `activity`, `skill`, `condition`, and `state` via an MCP resource at `workflow-server://schemas`. Agents that want to author or validate workflow definitions locally can fetch this resource on startup. See [schemas/README.md](../schemas/README.md) for the schema reference.

## Verifying the Connection

After configuring the rule:

1. Restart your MCP client.
2. Ask the agent to `list available workflows`. It should call `list_workflows` (no session token required) and return the workflow inventory.
3. Ask the agent to `start a work-package workflow`. It should first call `discover`, then proceed with `list_workflows`, `start_session`, and `get_workflow`.

If the agent skips `discover`, your rule has not been picked up — re-check the IDE's rule configuration.

## Related

- [README.md](../README.md) — project overview and quick-start.
- [SETUP.md](../SETUP.md) — full installation and MCP client configuration.
- [API Reference](api-reference.md) — tool roster, parameters, and session lifecycle.
- [Workflow Fidelity](workflow-fidelity.md) — enforcement layers and what the bootstrap procedure protects against.
