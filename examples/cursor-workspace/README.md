# Example Cursor workspace

Multi-root kickoff template (MCP, bootstrap rules, `AGENTS.md`) for workflow-server.
Mirrors `~/.local/share/cursor/workspaces/workflow-server`.

## Deploy

Requires workflow-server running ([setup.md](../../setup.md), [http.md](../../http.md)),
a product checkout under your projects root, and `$USER` set.

```bash
# from a workflow-server checkout
./scripts/deploy-cursor-workspace.sh --github=m2ux/workflow-server
./scripts/deploy-cursor-workspace.sh --help   # all flags
```

Writes absolute `/home/$USER/…` roots into
`~/.local/share/cursor/workspaces/<repo>/` (no `HOST_PROJECTS_ROOT` at Cursor launch).

| Common flag | Purpose |
|-------------|---------|
| `--github=owner/repo` | `AGENTS.md` + default repo basename |
| `--repo=NAME` | Checkout name (default `workflow-server`) |
| `--force` | Refresh; keeps any extra MCP servers |
| `--open` | Open the `.code-workspace` in Cursor |

MCP written by deploy (workflows depend on these): `concept-rag`, `atlassian`,
`gitnexus`, `workflow-server`. Deploy expands `${HOME}`, `$HOME`, `${USER}`,
`$USER`, `__USER_HOME__`, and `/home/<name>/…` on **every** MCP server entry
(command + args). Overrides: `CONCEPT_RAG_ENTRY`, `CONCEPT_RAG_INDEX`,
`GITNEXUS_BIN`.

Then ask the agent to start a workflow (`discover` → `start_session` with `repo` from `AGENTS.md`).

## Roots

Deploy script (four roots):

| Name | Path |
|------|------|
| workspace | kickoff dir (`./`) |
| project | `/home/$USER/projects/dev/<repo>` |
| planning | `…/<repo>/.engineering/artifacts/planning` |
| work trees | `…/<repo>/.worktrees` |

Template file still uses five roots via `${env:HOST_PROJECTS_ROOT}` (includes `workflows`)
if you copy manually instead of using the script.

## Template contents

- `AGENTS.md` — target `owner/repo`
- `.cursor/mcp.json` / `.mcp.json` — `concept-rag`, `atlassian`, `gitnexus`, `workflow-server`
- `.cursor/rules/` — always-on `discover` first
- `workflow-server.code-workspace` — multi-root folders

## See also

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh)
- [setup.md](../../setup.md) · [docs/ide-setup.md](../../docs/ide-setup.md)
