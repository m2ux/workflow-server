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
      "args": ["/path/to/workflow-server/dist/index.js"],
      "env": {
        "WORKFLOW_DIR": "/path/to/workflow-server/workflows"
      }
    }
  }
}
```

### Claude Desktop

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": ["/path/to/workflow-server/dist/index.js"],
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
| `WORKFLOW_DIR` | `./workflows` | Path to workflow directories (each contains `workflow.toon`, `activities/`, `skills/`, `resources/`) |
| `SCHEMAS_DIR` | `./schemas` | Path to JSON Schema definitions served via the `workflow-server://schemas` MCP resource |
| `SERVER_NAME` | `workflow-server` | Server name reported by `health_check` |
| `SERVER_VERSION` | `1.0.0` | Server version reported by `health_check` |

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
