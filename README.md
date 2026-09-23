# Workspace

This checkout is the Cursor workspace for workflow-server. The branch is `workspace`.

```text
./
├── AGENTS.md
├── rules/
├── skills/
├── scripts/
├── config/
├── workflow-server.code-workspace
├── components/
│   ├── main/                  # worktree of branch main
│   └── workflows/             # worktree of branch workflows
├── engineering/               # worktree of branch engineering
└── .worktrees/
    └── <slug>/                # one feature worktree per branch
```

`components/`, `engineering/`, and `.worktrees/` are gitignored. `scripts/install.sh`, started from a directory, checks this branch out as `workflow-server` there and adds those worktrees when the paths are absent. `scripts/bump.sh` fast-forwards `components/main`, `components/workflows`, and `engineering` to their upstream tips.

`scripts/deploy-cursor-workspace.sh workflow-server` renders machine-local Claude settings and Codex config into this checkout. It leaves the committed kickoff in place. It does not copy this tree to `~/.local/share/cursor/workspaces`. Another repo name still renders a kickoff there, using this checkout as the template.

Relative tool links (`.cursor/rules/*.mdc`, `.claude/rules`, `.claude/hooks`, `CLAUDE.md`, and the others beside them) are committed. `.claude/settings.json` and `.codex/config.toml` stay generated, because they contain this machine's home directory and MCP command paths.
