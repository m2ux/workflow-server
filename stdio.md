# Setup (stdio)

Run the workflow server from a local checkout. The IDE spawns the process over **stdio** (default transport).

For the Docker / GHCR HTTP path (no source checkout), see [http.md](http.md).

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- Git
- MCP client (Cursor, Claude Desktop, or compatible)

## 1. Install

```bash
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
npm install
git worktree add ./workflows workflows
npm run build
```

Optional host layout (same as Docker install, without starting a container):

```bash
./scripts/install.sh --install-dir=~/.local/share/workflow-server
./scripts/init-repo.sh owner/repo
```

## 2. Configure the MCP client

Point the client at the built entry point. The IDE starts the server; you do not run it separately.

### Option A — explicit workspace (legacy single-root)

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--workspace=/path/to/worktree-root",
        "--workflow-dir=/path/to/workflows"
      ]
    }
  }
}
```

Planning defaults to `<workspace>/.engineering/artifacts/planning/`.

### Option B — per-repo install layout

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--repo=owner/repo",
        "--install-dir=/home/you/.local/share/workflow-server",
        "--workflow-dir=/path/to/workflows"
      ]
    }
  }
}
```

Resolves:

- `workspaceDir` → `$INSTALL/workspace/<owner>/<repo>`
- `engineeringDir` → `$INSTALL/engineering/<owner>/<repo>`
- planning → `<engineering>/artifacts/planning/` (override with `PLANNING_SLUG`)

### Startup args

| Arg | Env | Notes |
|-----|-----|--------|
| `--workspace=PATH` | `WORKFLOW_WORKSPACE` or `WORKTREE_ROOT` | Explicit workspace / worktree root (takes precedence over `--repo`) |
| `--repo=owner/repo` | `WORKFLOW_SERVER_REPO` | Bind `$INSTALL/{workspace,engineering}/owner/repo` |
| `--install-dir=PATH` | `WORKFLOW_SERVER_INSTALL_DIR` | Install root (default `~/.local/share/workflow-server`) |
| — | `WORKFLOW_SERVER_ENGINEERING_DIR` | Override engineering root when using `--workspace` |
| `--workflow-dir=PATH` | `WORKFLOW_DIR` | Workflows directory (default `./workflows`) |
| `--transport=stdio` | `TRANSPORT` | Default; omit for stdio |

Full env table: [docs/development.md](docs/development.md#environment-variables).

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

## 4. Verify

Restart the IDE, then ask it to list available workflows.

## More detail

| Topic | Where |
|-------|--------|
| Dev commands / HTTP from source | [docs/development.md](docs/development.md) |
| Server env vars / `--repo` | [docs/development.md](docs/development.md#environment-variables) / `src/config.ts` |
| HTTP API endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Docker / GHCR HTTP setup | [http.md](http.md) (`scripts/install.sh`) |
| Per-repo engineering checkout | [`scripts/init-repo.sh`](scripts/init-repo.sh) |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
