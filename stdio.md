# Setup — stdio

Transport-specific steps for a **local checkout** where the IDE spawns the server over stdio (default transport).  
Shared sequence: **[setup.md](setup.md)** (layout, target project, IDE rule, day-two).

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- Git
- MCP client (Cursor, Claude Desktop, or compatible)

## 1. Build from source

```bash
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
npm install
git worktree add ./workflows workflows
npm run build
```

Optional: same host layout as Docker (without starting a container):

```bash
./scripts/install.sh --install-dir=~/.local/share/workflow-server
```

Then continue with [setup.md §2](setup.md#2-init-a-target-repo) for each target repo (deploy engineering, place basename checkout under `$HOST_PROJECTS_ROOT`).

## 2. MCP client (stdio)

The IDE starts the process; you do not run a long-lived server yourself.

**Required:** either `--repo=owner/repo` (pins one basename checkout under the projects root) **or** `--workspace=PATH` (and optional engineering root via env).  
`--install-dir` alone is not enough — the process exits without a workspace or repo binding.

### Recommended: install multi-root (matches Docker + projects root)

Point workspace + engineering at your `HOST_PROJECTS_ROOT` (default `~/projects/dev`; basename checkouts you manage):

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--install-dir=/home/you/.local/share/workflow-server",
        "--workspace=/home/you/projects/dev",
        "--workflow-dir=/path/to/workflows"
      ],
      "env": {
        "WORKFLOW_SERVER_ENGINEERING_DIR": "/home/you/projects/dev",
        "HOST_PROJECTS_ROOT": "/home/you/projects/dev",
        "WORKFLOW_SERVER_INSTALL_DIR": "/home/you/.local/share/workflow-server"
      }
    }
  }
}
```

Pass `repo: "owner/your-project"` on `start_session`. Planning lands under  
`$HOST_PROJECTS_ROOT/your-project/.engineering/artifacts/planning/` (basename checkout).

Optional: pin one repo for the whole process with `--repo=owner/your-project` instead of multi-root.

### Alternative: explicit workspace (legacy single-root)

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--workspace=/path/to/your/checkout",
        "--workflow-dir=/path/to/workflows"
      ]
    }
  }
}
```

For a split engineering tree, also set env  
`WORKFLOW_SERVER_ENGINEERING_DIR=/path/to/engineering/checkout`  
(planning then uses `artifacts/planning` under that root).

`--transport=stdio` is the default (omit, or set `TRANSPORT=stdio`).

Developer-only process flags: [docs/development.md](docs/development.md#environment-variables).

## 3. Verify

There is no HTTP listener under stdio — the IDE owns the process.

| Check | How |
|-------|-----|
| Build | `npm run typecheck` (and `npm run build` if `dist/` is stale) |
| Paths | `--repo` + `--install-dir`, or `--workspace`, plus readable `--workflow-dir` |
| MCP load | Restart the IDE (or reload MCP servers); the workflow-server entry shows as connected with no spawn error |
| Smoke | `discover`, then `start_session` (`list_workflows` alone is not enough) |

If the server fails to start, check the MCP client log for the `node …/dist/index.js` stderr (missing workspace/repo, bad `WORKFLOW_DIR`, etc.).

Then finish shared steps in [setup.md](setup.md) (**§2** target project if needed, **§3** IDE rule, **§4** day-two).

## stdio-only references

| Topic | Where |
|-------|--------|
| Dev commands / HTTP from source | [docs/development.md](docs/development.md) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) / `src/config.ts` |
| Shared setup | [setup.md](setup.md) |
| Docker / HTTP transport | [http.md](http.md) |
