# Example Cursor workspace (workflow kick-off)

Copy-ready multi-root Cursor workspace that mirrors the **canonical live layout** at
`~/.local/share/cursor/workspaces/workflow-server`.

Use this as the primary IDE path. Prefer
[`scripts/deploy-cursor-workspace.sh`](../../scripts/deploy-cursor-workspace.sh)
to install it under Cursor’s workspaces data dir with absolute `/home/$USER/…`
folder paths. Manual copy + `${env:HOST_PROJECTS_ROOT}` (below) remains supported.
Prefer either path over hand-rolling MCP JSON or pasting bootstrap rules into a
single-folder project.

## Prerequisites

1. Install and start workflow-server ([setup.md](../../setup.md), [http.md](../../http.md)).
2. Export **`HOST_PROJECTS_ROOT`** (written to `$INSTALL/env` by `install.sh`;
   typical value `~/projects/dev`). Checkout the product repo under
   `$HOST_PROJECTS_ROOT/<repo>` ([setup.md §2b](../../setup.md#2b-checkout-the-project)).
3. HTTP MCP listening at `http://127.0.0.1:3000/mcp` (or edit
   [`.cursor/mcp.json`](.cursor/mcp.json)).
4. Ensure `workflows/` and `.worktrees/` exist under the checkout when you mount
   those roots (create empty `.worktrees/` if needed; add `workflows` via
   `git worktree add ./workflows workflows` when developing the server itself).

## Layout

```text
examples/cursor-workspace/
├── README.md                         # this file
├── AGENTS.md                         # one-liner: targeted Github owner/repo
├── CLAUDE.md -> AGENTS.md
├── workflow-server.code-workspace    # five roots via HOST_PROJECTS_ROOT
├── .mcp.json                         # required: workflow-server via mcp-remote
├── .cursor/
│   ├── mcp.json                      # same required server (Cursor project MCP)
│   ├── skills/
│   │   └── routing-workflow-design-resources/
│   │       └── SKILL.md              # dispatcher → workflow-design resources
│   └── rules/
│       ├── workflow-server.mdc       # alwaysApply: call discover first
│       └── concept-rag.mdc           # optional companion MCP rule
└── .claude/
    ├── settings.example.json         # sanitized allow-list (no machine hooks)
    └── rules/
        ├── workflow-server.md
        └── concept-rag.md
```

| Path | Role |
|------|------|
| `AGENTS.md` | One line: `The Github repo for which this workspace is targeted is owner/repo.` |
| `workflow-server.code-workspace` | Five roots: workspace, project, workflows, planning, work trees |
| `.mcp.json` / `.cursor/mcp.json` | Required `workflow-server` → `http://127.0.0.1:3000/mcp` |
| `.cursor/skills/…/SKILL.md` | Routes workflow-design resource opens (see skill multi-root note) |
| `.cursor/rules/*.mdc` | Always-applied IDE rules |
| `.claude/settings.example.json` | Copy to `settings.local.json` locally; do not commit machine hooks |
| `.claude/rules/*` | Same rules for Claude Code |

### Workspace roots (canonical names)

Folder paths (except `./`) use Cursor’s `${env:HOST_PROJECTS_ROOT}` expansion —
the same system-wide projects root as `$INSTALL/env`. No `/home/…` or
`../../../projects/dev/…` user layout is baked in.

| Name | Points at |
|------|-----------|
| `📦 workspace` | This kickoff folder (`./`) |
| `📦 project` | `${env:HOST_PROJECTS_ROOT}/<repo>` |
| `📦 workflows` | `${env:HOST_PROJECTS_ROOT}/<repo>/workflows` |
| `📦 planning` | `${env:HOST_PROJECTS_ROOT}/<repo>/.engineering/artifacts/planning` |
| `📦 work trees` | `${env:HOST_PROJECTS_ROOT}/<repo>/.worktrees` |

The shipped file uses repo basename `workflow-server` to match this example’s
`AGENTS.md`. Replace that basename when you target another product.

Do **not** collapse planning + workflows + worktrees into a single `.engineering`
root — keep them as separate roots, as in the canonical workspace.

## Use it (recommended: deploy script)

```bash
# From a workflow-server checkout
./scripts/deploy-cursor-workspace.sh --github=m2ux/workflow-server

# Another product under the same projects root:
./scripts/deploy-cursor-workspace.sh my-app --github=acme/my-app

# Explicit user / layout (paths always under /home/$USER/…):
./scripts/deploy-cursor-workspace.sh \
  --user="$USER" \
  --projects-root="/home/$USER/projects/dev" \
  --github=m2ux/workflow-server \
  --open
```

Defaults:

| Setting | Default |
|---------|---------|
| `$USER` home paths | `/home/$USER/…` (override with `--user`) |
| Projects root | `$HOST_PROJECTS_ROOT` or `/home/$USER/projects/dev` |
| Kickoff dir | `/home/$USER/.local/share/cursor/workspaces/<repo>/` |
| Roots written | workspace · project · planning · work trees |

Re-run with `--force` to refresh rules / workspace file / the `workflow-server`
MCP entry (other MCP servers already in `mcp.json` are kept).

When you are done, your layout should look like
`~/.local/share/cursor/workspaces/workflow-server` (this template’s destination).

Then ask the agent to start a workflow. It should call `discover`, then
`start_session` with `repo` from `AGENTS.md`.

### Manual copy (optional)

```bash
# 1. Copy to the Cursor workspaces data dir (canonical location)
mkdir -p ~/.local/share/cursor/workspaces
cp -a examples/cursor-workspace \
  ~/.local/share/cursor/workspaces/workflow-server

cd ~/.local/share/cursor/workspaces/workflow-server

# 2. Set AGENTS.md to your Github owner/repo (one line)
#    The Github repo for which this workspace is targeted is owner/repo.

# 3. Load HOST_PROJECTS_ROOT from the install env (required for folder roots)
#    and launch Cursor from a shell that exports it:
set -a && . "${WORKFLOW_SERVER_INSTALL_DIR:-$HOME/.local/share/workflow-server}/env" && set +a
# Or: export HOST_PROJECTS_ROOT=~/projects/dev

# 4. If your repo basename is not workflow-server, edit the four
#    ${env:HOST_PROJECTS_ROOT}/… entries in workflow-server.code-workspace.

# 5. Ensure mount targets exist
mkdir -p "$HOST_PROJECTS_ROOT/<repo>/.worktrees"
# workflows worktree when needed:
#   (cd "$HOST_PROJECTS_ROOT/<repo>" && git worktree add ./workflows workflows)

# 6. Open in Cursor (same shell / env so ${env:HOST_PROJECTS_ROOT} resolves)
cursor workflow-server.code-workspace
# or: File → Open Workspace from File…
```

## MCP servers

**Required:** `workflow-server` via `npx mcp-remote http://127.0.0.1:3000/mcp`
in both [`.mcp.json`](.mcp.json) and [`.cursor/mcp.json`](.cursor/mcp.json)
(mirrors the live Cursor workspace pattern without machine-local paths).

**Optional companions** (often present in a live workspace; **not** shipped here):

- `gitnexus` — code intelligence MCP for the target repo
- `concept-rag` — concept search (rule stubs remain in `.cursor/rules/concept-rag.mdc`)
- `atlassian` — Jira/Confluence via mcp-remote

Add them locally if you use them. Do **not** commit absolute host paths (e.g.
`/home/…`) into this example.

## Skills

[`.cursor/skills/routing-workflow-design-resources/SKILL.md`](.cursor/skills/routing-workflow-design-resources/SKILL.md)
dispatches to workflow-design resource files. Relative markdown links match the
canonical live skill; when the five-root workspace is open, open the same paths
under **📦 workflows** as `workflow-design/resources/<name>.md`.

## Path assumptions

```text
HOST_PROJECTS_ROOT   # from $INSTALL/env — system-wide projects root
checkout             = $HOST_PROJECTS_ROOT / <repo>
planning             = checkout / .engineering / artifacts / planning
worktrees            = checkout / .worktrees / <slug>
```

| Root | Path in the example |
|------|---------------------|
| This workspace (kickoff) | `./` (copy under `~/.local/share/cursor/workspaces/<name>/`) |
| Project | `${env:HOST_PROJECTS_ROOT}/workflow-server` |
| Workflows | `${env:HOST_PROJECTS_ROOT}/workflow-server/workflows` |
| Planning | `${env:HOST_PROJECTS_ROOT}/workflow-server/.engineering/artifacts/planning` |
| Work trees | `${env:HOST_PROJECTS_ROOT}/workflow-server/.worktrees` |

If folder roots do not resolve, confirm Cursor was started with `HOST_PROJECTS_ROOT`
in its process environment (source `$INSTALL/env` in the launching shell).

## Related

- [scripts/deploy-cursor-workspace.sh](../../scripts/deploy-cursor-workspace.sh) — deploy this template
- [setup.md](../../setup.md) — install + checkout under `HOST_PROJECTS_ROOT`
- [docs/install-projects-worktrees.md](../../docs/install-projects-worktrees.md) — layout
- [docs/ide-setup.md](../../docs/ide-setup.md) — bootstrap rule text
- [http.md](../../http.md) — Docker / HTTP
- [stdio.md](../../stdio.md) — local stdio MCP alternative
