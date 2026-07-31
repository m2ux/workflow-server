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

`.claude/rules/` and `.cursor/rules/` deploy verbatim except for `__WORKSPACE__`
and `__HOME__`, which expand to absolute paths. Use them when a rule must name a
path that also appears in the settings allowlist — `bash-composition.md` names
the `sbx` launcher this way so the two stay in step.

## Skills

`.claude/skills/` deploys one directory per skill, under the same placeholder
expansion as the rules. A skill the template does not carry stays in the
workspace across a `--force` refresh, so deploying never removes locally added
skills.

| Skill | Use for |
|-------|---------|
| [`workflow-canon`](.claude/skills/workflow-canon/SKILL.md) | Authoring or auditing workflow definitions against the design canon and guard suite |

## See also

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh)
- [scripts/claude/README.md](../../scripts/claude/README.md)
- [setup.md](../../setup.md) · [docs/ide-setup.md](../../docs/ide-setup.md)
