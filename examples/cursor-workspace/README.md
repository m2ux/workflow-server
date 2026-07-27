# Cursor workspace Setup

Multi-root kickoff template (MCP, bootstrap rules, Claude baseline, `AGENTS.md`).

## Deploy

Requires a checkout (repo-name) under your projects root, and `$HOME` set.

```bash
~/.local/share/workflow-server/deploy-cursor-workspace.sh <repo-name>
```
## Roots

| Name | Path |
|------|------|
| workspace | kickoff dir (`./`) |
| project | `$HOME/projects/dev/<repo>` (or `${env:HOST_PROJECTS_ROOT}/<repo-name>`) |
| planning | `…/<repo-name>/.engineering/artifacts/planning` |
| work trees | `…/<repo-name>/.worktrees` |

## See also

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh)
- [scripts/claude/README.md](../../scripts/claude/README.md)
- [setup.md](../../setup.md) · [docs/ide-setup.md](../../docs/ide-setup.md)
