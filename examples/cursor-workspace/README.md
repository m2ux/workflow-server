# Cursor workspace Setup

Multi-root kickoff template (MCP, bootstrap rules, Claude baseline, skills, `AGENTS.md`).

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

## Rules

`rules/` is the text. `.claude/rules` points at it. Each `.cursor/rules/<name>.mdc` points at `rules/<name>.md`. Deploy expands `__WORKSPACE__` and `__HOME__` in `rules/` — `bash-composition.md` names the `sbx` launcher this way so the rule and the settings allowlist stay in step.

## Skills

`skills/` is the text. `.cursor/skills`, `.claude/skills`, and `.agents/skills` point at it. A skill the template does not carry stays in the workspace `skills/` directory across a `--force` refresh.

| Skill | Use for |
|-------|---------|
| [`workflow-canon`](skills/workflow-canon/SKILL.md) | Authoring or auditing workflow definitions against the design canon and guard suite |

## Codex

Deploy writes `.codex/config.toml`. Codex reads that file. The MCP servers in it are the set deploy writes to `mcp.json`, and the instructions are the always-apply rules.

## Scripts and config

`scripts/` holds the hook scripts and the `sbx` launcher. `config/` holds the JSON those hooks read. `.claude/hooks` points at `scripts/`. A hook loads `config/<name>.json` from the directory beside `scripts/`, after resolving links.

Deploy copies `scripts/` and `config/` into the kickoff directory and points `.claude/hooks` at `scripts/`. Workspace `.claude/settings.json` records absolute paths under `.claude/hooks` and allowlists `scripts/sbx`.

```text
scripts/                        # hook scripts and the sbx launcher
config/                         # JSON the hooks read
.claude/hooks → ../scripts
```

## See also

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh)
- [setup.md](../../setup.md) · [docs/ide-setup.md](../../docs/ide-setup.md)
