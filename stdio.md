# Setup — stdio

Transport-specific steps for a **local checkout** where the IDE spawns the server over stdio (default transport).  
Shared sequence: **[setup.md](setup.md)** (layout, init-repo, IDE rule, day-two).

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

Then continue with [setup.md §2](setup.md#2-init-a-target-repo) to init each target repo.

## 2. MCP client (stdio)

The IDE starts the process; you do not run a long-lived server yourself. Point the client at the built entry and the install root:

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--install-dir=/home/you/.local/share/workflow-server",
        "--workflow-dir=/path/to/workflows"
      ]
    }
  }
}
```

`--transport=stdio` is the default (omit, or set `TRANSPORT=stdio`).

Developer-only process flags: [docs/development.md](docs/development.md#environment-variables).

## 3. Verify

There is no HTTP listener under stdio — the IDE owns the process.

| Check | How |
|-------|-----|
| Build | `npm run typecheck` (and `npm run build` if `dist/` is stale) |
| Paths | `--install-dir` / `--workflow-dir` exist and are readable |
| MCP load | Restart the IDE (or reload MCP servers); the workflow-server entry shows as connected with no spawn error |
| Tools | In the IDE: list available workflows (`list_workflows`) |

If the server fails to start, check the MCP client log for the `node …/dist/index.js` stderr (missing workspace/install root, bad `WORKFLOW_DIR`, etc.).

Then finish shared steps in [setup.md](setup.md) (**§2** init-repo if needed, **§3** IDE rule, **§4** day-two).

## stdio-only references

| Topic | Where |
|-------|--------|
| Dev commands / HTTP from source | [docs/development.md](docs/development.md) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) / `src/config.ts` |
| Shared setup | [setup.md](setup.md) |
| Docker / HTTP transport | [http.md](http.md) |
