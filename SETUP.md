# Setup Guide

This guide covers two scenarios:
1. **Running the workflow server** — For development or self-hosting
2. **Deploying to projects** — Setting up the engineering branch pattern in your repositories

## Prerequisites

- Node.js 18+
- npm or yarn
- MCP Client (Cursor, Claude Desktop, or compatible client)

## Installation

```bash
# Clone and install
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
npm install

# Set up workflow data (worktree for orphan branch)
git worktree add ./workflows workflows

# Build the server
npm run build
```

## MCP Client Configuration

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--workspace=/path/to/your/project"
      ],
      "env": {
        "WORKFLOW_DIR": "/path/to/workflow-server/workflows"
      }
    }
  }
}
```

`--workspace` binds the required worktree / workspace root (equivalent env binds: `WORKFLOW_WORKSPACE` or `WORKTREE_ROOT`; precedence CLI > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT`). IDE MCP clients use the default **stdio** transport. For HTTP, see [HTTP transport](#http-transport) below.

### Claude Desktop

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": [
        "/path/to/workflow-server/dist/index.js",
        "--workspace=/path/to/your/project"
      ],
      "env": {
        "WORKFLOW_DIR": "/path/to/workflow-server/workflows"
      }
    }
  }
}
```

## IDE Rules Setup

Add the bootstrap rule from [`docs/ide-setup.md`](docs/ide-setup.md) to your IDE's "always-applied" rule set. The rule tells the agent to call `discover` on every workflow request so the bootstrap procedure stays in sync with the server.

## Verify Installation

After restarting your MCP client, verify the server is working:

```
Use the workflow server to list available workflows
```

The agent should use `list_workflows` and return the available workflow definitions.

## Branch Structure

| Branch | Content | Purpose |
|--------|---------|---------|
| `main` | TypeScript server code | Implementation |
| `workflows` | JSON workflows + guides | Data (orphan branch) |

This separation allows workflow definitions to evolve independently from server code.

## Environment Variables

The server reads these environment variables at startup (see `src/config.ts`):

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_WORKSPACE` | — (required*) | Worktree / workspace root the server is bound to. Session state lives under `{root}/{PLANNING_SLUG}/`. Also accepted as `--workspace=PATH`. |
| `WORKTREE_ROOT` | — (required*) | Alias for the same required root as `WORKFLOW_WORKSPACE` (useful in containers). Precedence: `--workspace` > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT`. |
| `PLANNING_SLUG` | `.engineering/artifacts/planning` | Relative planning directory under the worktree root. Override for alternate layouts (e.g. `.engineering/planning`). |
| `WORKFLOW_DIR` | `./workflows` | Path to workflow directories (each contains `workflow.yaml`, `activities/`, `techniques/`, `resources/`) |
| `SCHEMAS_DIR` | `./schemas` | Path to JSON Schema definitions served via the `workflow-server://schemas` MCP resource |
| `SERVER_NAME` | `workflow-server` | Server name reported by `health_check` |
| `SERVER_VERSION` | `1.0.0` | Server version reported by `health_check` |
| `TRANSPORT` | `stdio` | Transport to start (`stdio` or `http`); `--transport` takes precedence |
| `PORT` | `3000` | Port the HTTP transport listens on; ignored under stdio; `--port` takes precedence |
| `HOST` | `localhost` | Host the HTTP transport binds to; ignored under stdio; `--host` takes precedence |

\* One of `--workspace`, `WORKFLOW_WORKSPACE`, or `WORKTREE_ROOT` is required. The server refuses to start without a worktree root; HTTP `GET /ready` reports not-ready when that root path is missing.

## HTTP transport

stdio is the default and is what Cursor / Claude Desktop spawn via `command` / `args`. To listen on HTTP instead:

```bash
npm run build
npm run start:http
# equivalent:
# node dist/index.js --workspace=/path/to/your/project --transport=http --port=3000 --host=localhost
```

During development, `npm run dev:http` runs the same entry point via `tsx`.

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness probe |
| `GET /ready` | Readiness probe (checks that workflow, schemas, and worktree-root / workspace directories resolve; JSON key `checks.workspaceDir` is that root) |
| `POST /mcp` | MCP Streamable HTTP (session id in response / follow-up headers) |

The HTTP transport is intended to sit behind network-level access control or a reverse proxy. It does not implement application-level authentication. See [docs/api-reference.md](docs/api-reference.md#http-endpoints) and [docs/development.md](docs/development.md).

## Agent-managed worktrees

Agents create Git worktrees and initialise `.engineering`. The server validates paths under the configured root and writes planning artifacts.

Typical sequence:

1. Identify the target repository.
2. Create a worktree under the configured root, e.g. `git worktree add /var/worktrees/run-1`.
3. Initialise `.engineering` in that worktree (submodule or deploy layout).
4. Start the server with the required root: `--workspace=...`, `WORKFLOW_WORKSPACE`, or `WORKTREE_ROOT`.
5. Call `start_session` with a planning folder slug / hint; the server resolves under `{root}/{PLANNING_SLUG}/`.
6. Run the workflow; the server writes artifacts under the derived planning path.

Container layout: see [`Dockerfile`](Dockerfile) and [`docker-compose.yml`](docker-compose.yml). Bind the host worktree root RW to `WORKTREE_ROOT` (default `/worktrees`). Planning paths derive under that root. Align container UID/GID with the host user that creates worktrees.

Operator migration checklist:

- Supply a required root via `--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`.
- Default planning slug is `.engineering/artifacts/planning`; set `PLANNING_SLUG` only when the layout differs.
- Session planning bind stays on `start_session` (slug hint) under the configured root.

Further detail: [docs/agent-managed-worktrees.md](docs/agent-managed-worktrees.md).

---

## Deploying to Projects

The **engineering branch pattern** uses either a Git orphan branch or local folder in your project repo to store planning artifacts, ADRs, and agent configuration alongside your code. The value of the orphan branch pattern in particular is to avoid polluting product commit history with engineering metadata. The `.engineering/` folder will either be a local submodule clone or a real folder (depending on the pattern selected during setup).

```
my-project/
├── src/                       # Your code (main branch)
├── ...
└── .engineering/              # Engineering branch (locally ignored)
    ├── artifacts/
    │   ├── adr/               # Architecture Decision Records
    │   ├── planning/          # Work package plans
    │   ├── reviews/           # Code reviews
    │   └── templates/         # Reusable templates
    └── agent/
        ├── workflows/         # Workflow definitions (this repo's workflows branch)
        └── metadata/          # Private metadata (optional)
```

### Quick Start

From the root of your target project:

```bash
# Download and run the deployment script
curl -O https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

This creates a `.engineering/` folder in your project containing the workflows.

### Deploy Options

| Option | Description |
|--------|-------------|
| `--external-repo <url>` | Use external repo for engineering branch |
| `--metadata-repo <url>` | Custom metadata repo |
| `--skip-metadata` | Skip private metadata submodule |
| `--keep` | Don't self-destruct after deployment |

### Updating Submodules

After deployment, use the update script to pull latest changes:

```bash
cd .engineering

# Update both workflows and metadata
./scripts/update.sh

# Update only workflows
./scripts/update.sh --workflows

# Update only metadata
./scripts/update.sh --metadata
```
