# Example Cursor workspace (workflow kick-off)

Copy-ready multi-root Cursor workspace that mirrors the **canonical live layout** at
`~/.local/share/cursor/workspaces/workflow-server`.

Use this as the primary IDE path: copy it, point the roots at your checkout, open
the `.code-workspace` file, then ask the agent to start a workflow. Prefer this
over hand-rolling MCP JSON or pasting bootstrap rules into a single-folder
project.

## Prerequisites

1. Install and start workflow-server ([setup.md](../../setup.md), [http.md](../../http.md)).
2. Have a product checkout (example paths below assume `~/projects/dev/<repo>`).
3. HTTP MCP listening at `http://127.0.0.1:3000/mcp` (or edit
   [`.cursor/mcp.json`](.cursor/mcp.json)).
4. Ensure `workflows/` and `.worktrees/` exist under the project when you mount
   those roots (create empty `.worktrees/` if needed; add `workflows` via
   `git worktree add ./workflows workflows` when developing the server itself).

## Layout

```text
examples/cursor-workspace/
├── README.md                         # this file
├── AGENTS.md                         # one-liner: targeted Github owner/repo
├── CLAUDE.md -> AGENTS.md
├── workflow-server.code-workspace    # five roots (see below)
├── .cursor/
│   ├── mcp.json                      # required: workflow-server via mcp-remote
│   └── rules/
│       ├── workflow-server.mdc       # alwaysApply: call discover first
│       └── concept-rag.mdc           # optional companion MCP rule
└── .claude/
    ├── settings.example.json
    └── rules/
        ├── workflow-server.md
        └── concept-rag.md
```

| Path | Role |
|------|------|
| `AGENTS.md` | One line: `The Github repo for which this workspace is targeted is owner/repo.` |
| `workflow-server.code-workspace` | Five roots: workspace, project, workflows, planning, work trees |
| `.cursor/mcp.json` | Required `workflow-server` → `http://127.0.0.1:3000/mcp` |
| `.cursor/rules/*.mdc` | Always-applied IDE rules |
| `.claude/rules/*` | Same rules for Claude Code |

### Workspace roots (canonical names)

Match the live `workflow-server` Cursor workspace folder roles:

| Name | Points at |
|------|-----------|
| `📦 workspace` | This kickoff folder (`./`) |
| `📦 project` | Product checkout root |
| `📦 workflows` | `<checkout>/workflows` |
| `📦 planning` | `<checkout>/.engineering/artifacts/planning` |
| `📦 work trees` | `<checkout>/.worktrees` |

Do **not** collapse planning + workflows + worktrees into a single `.engineering`
root — keep them as separate roots, as in the canonical workspace.

## Use it

```bash
# 1. Copy to the Cursor workspaces data dir (canonical location)
mkdir -p ~/.local/share/cursor/workspaces
cp -a examples/cursor-workspace \
  ~/.local/share/cursor/workspaces/workflow-server

cd ~/.local/share/cursor/workspaces/workflow-server

# 2. Set AGENTS.md to your Github owner/repo (one line)
#    The Github repo for which this workspace is targeted is owner/repo.

# 3. Edit workflow-server.code-workspace folder paths.
#    Defaults assume this folder lives at
#      ~/.local/share/cursor/workspaces/<name>/
#    and the checkout at
#      ~/projects/dev/<repo>/
#    so ../../../projects/dev/<repo>/{,workflows,.engineering/artifacts/planning,.worktrees}
#    resolve. Prefer absolute paths if your layout differs.

# 4. Ensure mount targets exist
mkdir -p ~/projects/dev/<repo>/.worktrees
# workflows worktree when needed:
#   (cd ~/projects/dev/<repo> && git worktree add ./workflows workflows)

# 5. Open in Cursor
cursor workflow-server.code-workspace
# or: File → Open Workspace from File…
```

When you are done, your layout should look like
`~/.local/share/cursor/workspaces/workflow-server` (this template’s destination).

Then ask the agent to start a workflow. It should call `discover`, then
`start_session` with `repo` from `AGENTS.md`.

## MCP servers

**Required:** `workflow-server` via `npx mcp-remote http://127.0.0.1:3000/mcp`
(already in [`.cursor/mcp.json`](.cursor/mcp.json)).

**Optional companions** (present in some live workspaces; omit unless you use them):

- `gitnexus` — code intelligence MCP for the target repo
- `concept-rag` — concept search (rule in `.cursor/rules/concept-rag.mdc`)
- `atlassian` — Jira/Confluence via mcp-remote

Do not commit machine-local absolute paths for optional servers into the example.

## Path assumptions

Relative folder paths in `workflow-server.code-workspace` are written for:

| Root | Default absolute path |
|------|------------------------|
| This workspace (kickoff) | `~/.local/share/cursor/workspaces/<name>/` |
| Project | `~/projects/dev/<repo>/` |
| Workflows | `~/projects/dev/<repo>/workflows/` |
| Planning | `~/projects/dev/<repo>/.engineering/artifacts/planning/` |
| Work trees | `~/projects/dev/<repo>/.worktrees/` |

```text
checkout    = ~/projects/dev/<repo>   # or your HOST_PROJECTS_ROOT
planning    = checkout / .engineering / artifacts / planning
worktrees   = checkout / .worktrees / <slug>
```

If your projects root or Cursor share path differs, edit the four non-`./`
folder entries (or use absolute paths).

## Related

- [setup.md](../../setup.md) — install + init-repo
- [docs/ide-setup.md](../../docs/ide-setup.md) — bootstrap rule text
- [http.md](../../http.md) — Docker / HTTP
- [stdio.md](../../stdio.md) — local stdio MCP alternative
