# Example Cursor workspace

Multi-root kickoff template (MCP, bootstrap rules, Claude baseline, `AGENTS.md`)
for workflow-server. Mirrors `~/.local/share/cursor/workspaces/workflow-server`.

## Deploy

Requires workflow-server running ([setup.md](../../setup.md), [http.md](../../http.md)),
a product checkout under your projects root, and `$HOME` set.

```bash
# after install.sh (preferred)
~/.local/share/workflow-server/deploy-cursor-workspace.sh workflow-server
# or from a workflow-server checkout
./scripts/deploy-cursor-workspace.sh workflow-server
~/.local/share/workflow-server/deploy-cursor-workspace.sh   # help (repo name required)
```

Writes absolute `$HOME/…` roots into
`~/.local/share/cursor/workspaces/<repo>/` (no `HOST_PROJECTS_ROOT` at Cursor launch).

| Common flag | Purpose |
|-------------|---------|
| `REPO_NAME` or `--repo=NAME` | **Required.** Checkout / workspace basename |
| `--force` | Refresh; keeps any extra MCP servers |
| `--open` | Open the `.code-workspace` in Cursor |
| (no args) | Print help |

MCP written by deploy (workflows depend on these): `concept-rag`, `atlassian`,
`gitnexus`, `workflow-server`. Deploy expands `${HOME}`, `$HOME`,
`__USER_HOME__`, and `/home/<name>/…` to `$HOME/…` on **every** MCP server
entry (command + args). Overrides: `CONCEPT_RAG_ENTRY`, `CONCEPT_RAG_INDEX`,
`GITNEXUS_BIN`.

### Claude baseline (workspace-local)

Deploy also installs a friction-reducing Claude Code baseline **only** under the
kickoff workspace (not into the product git checkout):

| Deployed path | Source |
|---------------|--------|
| `scripts/claude/` | repo [`scripts/claude/`](../../scripts/claude/) (hooks + `bin/sbx`) |
| `.claude/settings.json` | rendered from [`.claude/settings.template.json`](.claude/settings.template.json) |

`settings.json` is generated at deploy time with absolute hook paths under the
workspace dir and `$HOME/projects` permission roots. Do not commit that file
from a live workspace. Re-run deploy with `--force` to refresh hooks/settings.

Template permissions allow the four required MCP servers via wildcards
(`mcp__workflow-server__*`, `mcp__concept-rag__*`, `mcp__gitnexus__*`,
`mcp__atlassian__*`). PreToolUse hooks cover Bash safety (compound allow,
dynamic-shell block, `gh api` write prompt, curl/webfetch allow, inline-eval →
`sbx`). GitNexus Pre/Post tool hooks are not enabled in the template for now
(process overhead); the hook script remains under `scripts/claude/hooks/gitnexus/`
for optional re-enable later.

Then ask the agent to start a workflow (`discover` → `start_session` with `repo` from `AGENTS.md`).

## Roots

| Name | Path |
|------|------|
| workspace | kickoff dir (`./`) |
| project | `$HOME/projects/dev/<repo>` (or `${env:HOST_PROJECTS_ROOT}/<repo>`) |
| planning | `…/<repo>/.engineering/artifacts/planning` |
| work trees | `…/<repo>/.worktrees` |

## Template contents

- `AGENTS.md` — checkout basename + placeholder for `owner/repo`
- `.cursor/mcp.json` / `.mcp.json` — `concept-rag`, `atlassian`, `gitnexus`, `workflow-server`
- `.cursor/rules/` — always-on `discover` first
- `.claude/settings.template.json` — Claude permissions + hooks (tokens expanded at deploy)
- `workflow-server.code-workspace` — multi-root folders

## See also

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh)
- [scripts/claude/README.md](../../scripts/claude/README.md)
- [setup.md](../../setup.md) · [docs/ide-setup.md](../../docs/ide-setup.md)
