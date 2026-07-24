# Setup — stdio

Transport-specific steps for a **local checkout** where the IDE spawns the server over stdio (default transport).  
Shared layout, repo init, root binding, IDE rule, and verify: **[setup.md](setup.md)** (start there, then return here for §1–2).

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

Then continue with [setup.md](setup.md) **§3** (`init-repo.sh`) if you use the install-root layout.

## 2. MCP client (stdio)

The IDE starts the process; you do not run a long-lived server yourself. Point the client at `dist/index.js` and pass root-binding flags (see [setup.md §4](setup.md#4-root-binding-how-the-server-finds-paths)).

### Explicit workspace (legacy single-root)

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

### Per-repo install layout

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

`--transport=stdio` is the default (omit, or set `TRANSPORT=stdio`).

Continue with [setup.md](setup.md) **§5** (connect / restart) through **§8**.

## stdio-only references

| Topic | Where |
|-------|--------|
| Dev commands / HTTP from source | [docs/development.md](docs/development.md) |
| Env vars & flags | [docs/development.md](docs/development.md#environment-variables) / `src/config.ts` |
| Shared setup | [setup.md](setup.md) |
| Docker / HTTP transport | [http.md](http.md) |
