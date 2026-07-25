# Example Cursor workspace (workflow kick-off)

Minimal multi-root Cursor workspace you can copy and open to drive
workflow-server sessions against a project checkout under `HOST_PROJECTS_ROOT`.

It mirrors a typical layout under `~/.local/share/cursor/workspaces/<name>/`:
agent rules, MCP client config, and a `.code-workspace` that mounts the
**project**, **`.engineering`**, and local **`.worktrees`** roots for easy
navigation.

## Prerequisites

1. Install and start workflow-server ([setup.md](../../setup.md), [http.md](../../http.md)).
2. Set `HOST_PROJECTS_ROOT` in `$INSTALL/env` (example: `~/projects/dev`).
3. Have a checkout at `$HOST_PROJECTS_ROOT/<repo>` with optional `.engineering`
   and a gitignored `.worktrees/` directory (create empty if missing).
4. HTTP MCP listening at `http://127.0.0.1:3000/mcp` (or change
   [`.cursor/mcp.json`](.cursor/mcp.json)).

## Layout

```text
examples/cursor-workspace/
├── README.md                         # this file
├── AGENTS.md                         # checkout basename + optional owner/repo
├── CLAUDE.md -> AGENTS.md            # Claude Code reads the same hint
├── workflow-server.code-workspace    # four roots: kickoff + project + eng + worktrees
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
| `AGENTS.md` | Declares the checkout basename under `HOST_PROJECTS_ROOT` and optional GitHub `owner/repo` for `start_session`. |
| `workflow-server.code-workspace` | Opens four roots: this folder, `$HOST_PROJECTS_ROOT/<repo>`, `<repo>/.engineering`, and `<repo>/.worktrees`. |
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

# 2. Point AGENTS.md at your checkout basename (and optional owner/repo)

# 3. Fix multi-root paths in the .code-workspace file.
#    Defaults assume:
#      this folder         → ~/.local/share/cursor/workspaces/<name>/
#      HOST_PROJECTS_ROOT  → ~/projects/dev
#    so relative paths ../../../projects/dev/<repo>{,/.engineering,/.worktrees}
#    resolve correctly. Replace workflow-server with your <repo> basename.
#    Prefer absolute paths if your layout differs.

# 4. Ensure local worktree parent exists (gitignored on the project)
mkdir -p "$HOST_PROJECTS_ROOT/<repo>/.worktrees"

# 5. Open in Cursor
cursor workflow-server.code-workspace
# or: File → Open Workspace from File…
```

Then ask the agent to start a workflow. It should call `discover`, then
`start_session` with identity from `AGENTS.md`.

## Path assumptions

Relative folder paths in `workflow-server.code-workspace` are written for:

| Root | Default absolute path |
|------|------------------------|
| This workspace (kickoff) | `~/.local/share/cursor/workspaces/<name>/` |
| Project | `~/projects/dev/<repo>/` (`HOST_PROJECTS_ROOT/<repo>`) |
| Engineering | `~/projects/dev/<repo>/.engineering/` |
| Feature worktrees | `~/projects/dev/<repo>/.worktrees/` |

Uniform formula (every project, including workflow-server):

```text
checkout    = $HOST_PROJECTS_ROOT / <repo>
planning    = checkout / .engineering / …
target_path = checkout / .worktrees / <slug>
```

**Deprecated — do not use for source or feature trees:**

- `$INSTALL/projects/…`
- `$INSTALL/worktrees/…`

Workflow **definitions** may still live under `$INSTALL/workflows` (server catalog).
That is not the product source checkout.

If a project has no `.engineering` yet, materialise or init the eng submodule
before the engineering workspace root will resolve. Create an empty
`.worktrees/` directory (gitignored) so the worktrees root always resolves.

If your `HOST_PROJECTS_ROOT` or cursor share path differs, edit the three
non-`./` folder entries (or use absolute paths).

## Related

- [setup.md](../../setup.md) — install, IDE rule
- [docs/install-projects-worktrees.md](../../docs/install-projects-worktrees.md) — layout plan
- [docs/ide-setup.md](../../docs/ide-setup.md) — bootstrap rule text
- [http.md](../../http.md) — Docker / HTTP MCP URL
- [stdio.md](../../stdio.md) — local stdio MCP alternative
