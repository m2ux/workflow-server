# Setup — stdio

Transport-specific steps for a **local checkout** where the IDE spawns the server over stdio (default transport).  
Shared sequence: **[setup.md](setup.md)** (start there, then return here for §1–2).

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

Continue with [setup.md](setup.md) **§3** through **§5**.

## stdio-only references

| Topic | Where |
|-------|--------|
| Dev commands / HTTP from source | [docs/development.md](docs/development.md) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) / `src/config.ts` |
| Shared setup | [setup.md](setup.md) |
| Docker / HTTP transport | [http.md](http.md) |
