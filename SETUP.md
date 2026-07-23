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

Paths are **not** hardcoded in the repo MCP configs. Project files [`.cursor/mcp.json`](.cursor/mcp.json) and [`.mcp.json`](.mcp.json) start the server via stdio and load a local `.env` (`envFile`). Create that file once per machine:

```bash
# From the workflow-server checkout
cp .env.example .env          # optional; init script seeds if missing
./scripts/init-local-env.sh  # fills absolute paths for this checkout
# optional: ./scripts/init-local-env.sh --workspace=/path/to/worktree-root
npm run build
```

Then restart the MCP client so it reloads `envFile`.

| Variable | Required | Role |
|----------|----------|------|
| `WORKFLOW_WORKSPACE` | yes* | Worktree / workspace root (`WORKTREE_ROOT` is an accepted alias) |
| `WORKFLOW_DIR` | no | Workflows directory (default `./workflows` under the install root) |
| `SCHEMAS_DIR` | no | Schemas directory (default `./schemas`) |
| `CONCEPT_RAG_ENTRY` / `CONCEPT_RAG_INDEX` | only if using concept-rag in `.mcp.json` | Paths passed as concept-rag `args` |

\* One of `WORKFLOW_WORKSPACE`, `WORKTREE_ROOT`, or CLI `--workspace` is required.

### Cursor

Prefer the project config (checked in):

- [`.cursor/mcp.json`](.cursor/mcp.json) — uses `${workspaceFolder}/dist/index.js` and `envFile: ${workspaceFolder}/.env`

Global override (optional) at `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": ["${env:WORKFLOW_SERVER_ENTRY}"],
      "env": {
        "WORKFLOW_WORKSPACE": "${env:WORKFLOW_WORKSPACE}",
        "WORKFLOW_DIR": "${env:WORKFLOW_DIR}"
      }
    }
  }
}
```

Set those shell env vars in your profile (or export them before launching Cursor from a terminal). Cursor expands `${env:NAME}` and supports `envFile` for stdio servers.

IDE MCP clients use the default **stdio** transport. For HTTP (e.g. `mcp-remote` → `http://127.0.0.1:3000/mcp`), start the server separately with the same `.env` / compose layout; see [HTTP transport](#http-transport) below.

### Claude Desktop

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

Claude Desktop does not always support `envFile` / `${workspaceFolder}`. Point at the built entry and pass the same values from your shell environment (or hardcode absolute paths only in the local desktop config, not in the repo):

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": ["/path/to/workflow-server/dist/index.js"],
      "env": {
        "WORKFLOW_WORKSPACE": "/path/to/worktree-root",
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
| `WORKFLOW_DIR` | `./workflows` | Workflows directory. Also `--workflow-dir=PATH` (CLI wins). |
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
# node dist/index.js --workspace=/path/to/worktree-root --workflow-dir=/path/to/workflows --transport=http --port=3000 --host=localhost
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

Compose bind sources and in-container paths are environment variables (defaults preserve the previous layout). Use the same local `.env` as MCP (`./scripts/init-local-env.sh`) or export the vars before `docker compose up`:

| Variable | Default | Role |
|----------|---------|------|
| `HOST_WORKTREE_ROOT` | `/var/worktrees` | Host path bound RW as the worktree root |
| `HOST_WORKFLOWS_DIR` | `./workflows` | Host path bound RO for workflow definitions |
| `HOST_SCHEMAS_DIR` | `./schemas` | Host path bound RO for JSON schemas |
| `HOST_PORT` | `3000` | Host port published to the container |
| `CONTAINER_WORKTREE_ROOT` | `/worktrees` | In-container worktree root (volume target + server `WORKTREE_ROOT`) |
| `CONTAINER_WORKFLOW_DIR` | `/app/workflows` | In-container workflows path (volume target + server `WORKFLOW_DIR`) |
| `CONTAINER_SCHEMAS_DIR` | `/app/schemas` | In-container schemas path (volume target + server `SCHEMAS_DIR`) |
| `PORT` / `HOST` / `TRANSPORT` | `3000` / `0.0.0.0` / `http` | Server listen settings inside the container |

Host MCP vars (`WORKFLOW_WORKSPACE`, `WORKFLOW_DIR`, `SCHEMAS_DIR`) are separate from `CONTAINER_*` so one `.env` can drive both stdio MCP and compose without path clashes. Keep each `HOST_*` source paired with the matching `CONTAINER_*` target.

Operator migration checklist:

- Supply a required root via `--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT`.
- Default planning slug is `.engineering/artifacts/planning`; set `PLANNING_SLUG` only when the layout differs.
- Session planning bind stays on `start_session` (slug hint) under the configured root.

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
