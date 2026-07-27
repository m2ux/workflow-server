# Workflow Server IDE Setup

## Recommended — example Cursor workspace

Deploy **[examples/cursor-workspace/](../examples/cursor-workspace/)** with [`scripts/deploy-cursor-workspace.sh`](../scripts/deploy-cursor-workspace.sh) (see the [README](../examples/cursor-workspace/README.md)). That installs the live layout under `~/.local/share/cursor/workspaces/<name>/` with absolute `$HOME/…` folder paths and already wires:

- MCP (`concept-rag`, `atlassian`, `gitnexus`, `workflow-server` → `http://127.0.0.1:3000/mcp` via `mcp-remote`)
- Always-applied bootstrap rule (`discover` first)
- `AGENTS.md` / `CLAUDE.md` for checkout basename and `repo: "owner/repo"`
- Multi-root folders: workspace, project, planning, work trees
- **Claude Code baseline (workspace-local only):** `scripts/claude/` hooks + rendered `.claude/settings.json`

```bash
# after install.sh (preferred)
~/.local/share/workflow-server/deploy-cursor-workspace.sh my-app
# or from a workflow-server checkout
./scripts/deploy-cursor-workspace.sh my-app
./scripts/deploy-cursor-workspace.sh   # help (repo name required)
# refresh MCP, rules, Claude hooks/settings (keeps extra MCP servers)
./scripts/deploy-cursor-workspace.sh my-app --force
```

Then ask the agent to start a workflow. Prefer this over hand-rolling MCP config or pasting rules into a single-folder project.

### What deploy writes (kickoff dir)

| Path under `~/.local/share/cursor/workspaces/<name>/` | Role |
|-------------------------------------------------------|------|
| `*.code-workspace` | Multi-root folders with absolute `$HOME/…` paths |
| `.cursor/mcp.json`, `.mcp.json` | Required MCP servers (home-path tokens expanded) |
| `.cursor/rules/`, `.claude/rules/` | Bootstrap / companion rules |
| `AGENTS.md` → `CLAUDE.md` | Target checkout + `owner/repo` placeholder |
| `scripts/claude/` | Portable hooks + `bin/sbx` (from repo [`scripts/claude/`](../scripts/claude/)) |
| `.claude/settings.json` | **Generated at deploy** from [settings.template.json](../examples/cursor-workspace/.claude/settings.template.json) — broad Bash/MCP allows, safety hooks; not committed from a live workspace |

`install.sh` places `deploy-cursor-workspace.sh`, `examples/cursor-workspace/`, and `scripts/claude/` under the install dir so deploy works without a full checkout.

Claude settings use `__HOME__` / `__WORKSPACE__` tokens in the template; deploy expands them to absolute paths. Hook commands point at the kickoff `scripts/claude/hooks/…`. Re-run with `--force` after pulling template or hook changes.

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
5. Optional (Claude in Cursor): confirm kickoff has `.claude/settings.json` and `scripts/claude/hooks/` after deploy.

If the agent skips `discover`, the rule is not loaded.

## Related

- [setup.md](../setup.md) — install (§3 Cursor workspace)
- [examples/cursor-workspace/](../examples/cursor-workspace/) — Cursor multi-root template
- [examples/cursor-workspace/README.md](../examples/cursor-workspace/README.md) — deploy flags + Claude baseline
- [scripts/deploy-cursor-workspace.sh](../scripts/deploy-cursor-workspace.sh) — deploy template with `$HOME/…` paths
- [scripts/claude/README.md](../scripts/claude/README.md) — hooks layout
- [http.md](../http.md) / [stdio.md](../stdio.md) — transports
- [api-reference.md](api-reference.md) — tools (`context_mode`, `context_tokens`, schemas)
