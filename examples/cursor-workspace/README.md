# Example Cursor workspace (workflow kick-off)

Minimal multi-root Cursor workspace you can copy and open to drive
workflow-server sessions against a target `owner/repo`.

It mirrors a typical layout under `~/.local/share/cursor/workspaces/<name>/`:
agent rules, MCP client config, and a `.code-workspace` that mounts the
install-root **engineering** and **workspace** trees next to this folder.

## Prerequisites

1. Install and start workflow-server ([setup.md](../../setup.md), [http.md](../../http.md)).
2. Deploy engineering into the target project and run `init-repo.sh owner/repo`
   ([setup.md §2](../../setup.md)).
3. HTTP MCP listening at `http://127.0.0.1:3000/mcp` (or change
   [`.cursor/mcp.json`](.cursor/mcp.json)).

## Layout

```text
examples/cursor-workspace/
├── README.md                         # this file
├── AGENTS.md                         # target owner/repo hint for start_session
├── CLAUDE.md -> AGENTS.md            # Claude Code reads the same hint
├── workflow-server.code-workspace    # multi-root: this dir + eng + sessions
├── .cursor/
│   ├── mcp.json                      # mcp-remote → workflow-server HTTP
│   └── rules/
│       ├── workflow-server.mdc       # always-on: call discover first
│       └── concept-rag.mdc           # optional companion MCP rule
└── .claude/
    ├── settings.example.json         # optional Claude Code permissions template
    └── rules/
        ├── workflow-server.md
        └── concept-rag.md
```

| Path | Role |
|------|------|
| `AGENTS.md` | Declares the target `owner/repo`. Pass that value as `repo` on `start_session` when the server uses install multi-root. |
| `workflow-server.code-workspace` | Opens three roots: this folder, `$INSTALL/engineering/<owner>/<repo>`, and `$INSTALL/workspace/<owner>/<repo>`. |
| `.cursor/mcp.json` | Connects Cursor to the running HTTP server via `npx mcp-remote`. |
| `.cursor/rules/*.mdc` | Always-applied IDE rules (bootstrap + optional concept-rag). |
| `.claude/rules/*` | Same rules for Claude Code. |
| `.claude/settings.example.json` | Template allow-list for workflow-server MCP tools (copy to `settings.local.json` locally; do not commit secrets). |

## Use it

```bash
# 1. Copy somewhere stable (XDG data home is a good default)
mkdir -p ~/.local/share/cursor/workspaces
cp -a examples/cursor-workspace \
  ~/.local/share/cursor/workspaces/my-project

cd ~/.local/share/cursor/workspaces/my-project

# 2. Point AGENTS.md at your repo
#    e.g. m2ux/workflow-server

# 3. Fix multi-root paths in the .code-workspace file.
#    Defaults assume:
#      this folder  → ~/.local/share/cursor/workspaces/<name>/
#      install dir  → ~/.local/share/workflow-server/
#    so relative paths ../../../.local/share/workflow-server/{engineering,workspace}/owner/repo
#    resolve correctly. Replace owner/repo with your slug.

# 4. Open in Cursor
cursor workflow-server.code-workspace
# or: File → Open Workspace from File…
```

Then ask the agent to start a workflow. It should call `discover`, then
`start_session` with `repo` from `AGENTS.md`.

## Path assumptions

Relative folder paths in `workflow-server.code-workspace` are written for:

| Root | Default absolute path |
|------|------------------------|
| This workspace | `~/.local/share/cursor/workspaces/<name>/` |
| Engineering | `~/.local/share/workflow-server/engineering/<owner>/<repo>/` |
| Feature worktrees (“sessions”) | `~/.local/share/workflow-server/workspace/<owner>/<repo>/` |

If your install dir or cursor share path differs, edit the two non-`./` folder
entries (or use absolute paths).

## Related

- [setup.md](../../setup.md) — install, init-repo, IDE rule
- [docs/ide-setup.md](../../docs/ide-setup.md) — bootstrap rule text
- [http.md](../../http.md) — Docker / HTTP MCP URL
- [stdio.md](../../stdio.md) — local stdio MCP alternative
