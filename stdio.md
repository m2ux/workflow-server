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

## 2. Configure the MCP client

Point the client at the built entry point. The IDE starts the server; you do not run it separately.

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

### Startup args

| Arg | Env | Notes |
|-----|-----|--------|
| `--workspace=PATH` | `WORKFLOW_WORKSPACE` or `WORKTREE_ROOT` | Required worktree root shared with the agent (recommend `~/worktrees`, same default as [http.md](http.md)) |
| `--workflow-dir=PATH` | `WORKFLOW_DIR` | Workflows directory (default `./workflows`) |
| `--transport=stdio` | `TRANSPORT` | Default; omit for stdio |

## 3. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

## 4. Verify

Restart the IDE, then ask it to list available workflows.

## More detail

| Topic | Where |
|-------|--------|
| Dev commands / HTTP from source | [docs/development.md](docs/development.md) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| HTTP API endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Docker / GHCR HTTP setup | [http.md](http.md) |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
