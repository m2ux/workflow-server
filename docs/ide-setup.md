# Workflow Server IDE Setup

## Recommended — example Cursor workspace

Deploy **[examples/cursor-workspace/](../examples/cursor-workspace/)** with [`scripts/deploy-cursor-workspace.sh`](../scripts/deploy-cursor-workspace.sh) (see the [README](../examples/cursor-workspace/README.md)). That installs the live layout under `~/.local/share/cursor/workspaces/<name>/` with absolute `/home/$USER/…` folder paths and already wires:

- MCP (`workflow-server` → `http://127.0.0.1:3000/mcp` via `mcp-remote`)
- Always-applied bootstrap rule (`discover` first)
- One-line `AGENTS.md` for `repo: "owner/repo"`
- Multi-root folders: workspace, project, planning, work trees (optional workflows root via manual template copy)

```bash
./scripts/deploy-cursor-workspace.sh --github=owner/repo
./scripts/deploy-cursor-workspace.sh --help
```

Then ask the agent to start a workflow. Prefer this over hand-rolling MCP config or pasting rules into a single-folder project.

## Bootstrap rule (reference)

The example workspace already includes this always-applied rule. If you maintain a custom client, use the same text:

```
For any start workflow, create work package, or resume work package request, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

Pass `session_index` from `start_session` on every authenticated workflow-server call.
```

That is enough. `discover` returns the live bootstrap steps (schema fetch → bind `repo` → `start_session` → `get_workflow`). Do not copy the protocol into IDE rules.

Always pass `repo: "owner/repo"` on `start_session` (from the user or workspace `AGENTS.md` / `CLAUDE.md`). Agents do not special-case server topology.

## Verify

1. Open the example workspace (or restart the MCP client after config changes).
2. Ask to start a work package (or any workflow) → the agent must call `discover`, then follow the returned bootstrap.
3. Confirm `start_session` includes `repo: "owner/repo"` (from you or workspace `AGENTS.md` / `CLAUDE.md`).
4. Optional: ask to list workflows → `list_workflows` (catalog only; not a substitute for the bootstrap smoke).

If the agent skips `discover`, the rule is not loaded.

## Related

- [setup.md](../setup.md) — install
- [examples/cursor-workspace/](../examples/cursor-workspace/) — Cursor multi-root template
- [scripts/deploy-cursor-workspace.sh](../scripts/deploy-cursor-workspace.sh) — deploy template with `/home/$USER/…` paths
- [http.md](../http.md) / [stdio.md](../stdio.md) — transports
- [api-reference.md](api-reference.md) — tools (`context_mode`, `context_tokens`, schemas)
