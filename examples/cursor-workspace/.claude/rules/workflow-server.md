---
description: Workflow server integration
---

For any start workflow or create or resume work package request, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

When `discover` reports `session_scope: multi`, pass `repo` from this workspace's `AGENTS.md` on `start_session`.

If the user provides a `session_token`, pass it to subsequent workflow-server calls per their instructions.
