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
| workflows | `…/<repo-name>/.worktrees/workflows` |
| planning | `…/<repo-name>/.engineering/artifacts/planning` |
| work trees | `…/<repo-name>/.worktrees` |

## Rules

`rules/` is the canonical copy. `.cursor/rules` and `.claude/rules` link at it,
and each `.mdc` links at the `.md` of the same name. `__WORKSPACE__` and
`__HOME__` expand to absolute paths in that copy. Use them when a rule must name
a path that also appears in the settings allowlist — `bash-composition.md` names
the `sbx` launcher this way so the two stay in step.

## Skills

`skills/<name>` links at the template directory that versions the skill.
`.cursor/skills` and `.claude/skills` link at `skills/`. A skill the template
does not carry stays in `skills/` across a `--force` refresh.

| Skill | Use for |
|-------|---------|
| [`workflow-canon`](.claude/skills/workflow-canon/SKILL.md) | Authoring or auditing workflow definitions against the design canon and guard suite |

## See also

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh)
- [scripts/claude/README.md](../../scripts/claude/README.md)
- [setup.md](../../setup.md) · [docs/ide-setup.md](../../docs/ide-setup.md)
