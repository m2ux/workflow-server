# Workspace

This checkout is the general-purpose workspace for workflow-server. The branch is `workspace`.

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

`components/`, `engineering/`, and `.worktrees/` are gitignored. `scripts/deploy.sh`, started from a directory, checks this branch out as `workflow-server` there and adds those worktrees when the paths are absent. `scripts/bump.sh` fast-forwards `components/main`, `components/workflows`, and `engineering` to their upstream tips.

`scripts/deploy.sh` renders machine-local Claude settings and Codex config into that checkout. It leaves the committed kickoff in place.

Relative tool links (`.cursor/rules/*.mdc`, `.claude/rules`, `.claude/hooks`, `CLAUDE.md`, and the others beside them) are committed. `.claude/settings.json` and `.codex/config.toml` stay generated, because they contain this machine's home directory and MCP command paths.
