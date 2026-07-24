# Workflow Server IDE Setup

## Bootstrap rule

Add this to your IDE's always-applied rules (Cursor rule, Claude Code project rule, etc.):

```
For any start workflow, create work package, or resume work package request, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

If the user provides a `session_token`, pass it to subsequent workflow-server calls per their instructions.
```

That is enough. `discover` returns the live bootstrap steps (schema fetch → `start_session` → `get_workflow`). Do not copy the protocol into IDE rules.

When `discover` reports `session_scope: multi`, pass `repo: "owner/repo"` on `start_session` (from the user or workspace `AGENTS.md` / `CLAUDE.md`).

## Verify

1. Restart the MCP client.
2. Ask to list workflows → `list_workflows`.
3. Ask to start a work-package → `discover`, then the returned bootstrap (include `repo` when multi-root).

If the agent skips `discover`, the rule is not loaded.

## Related

- [setup.md](../setup.md) — install
- [examples/cursor-workspace/](../examples/cursor-workspace/) — Cursor multi-root template
- [http.md](../http.md) / [stdio.md](../stdio.md) — transports
- [api-reference.md](api-reference.md) — tools (`context_mode`, `context_tokens`, schemas)
