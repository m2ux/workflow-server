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

Add the following to your IDE rules (see [`docs/ide-setup.md`](docs/ide-setup.md)):

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must*:
1. Fetch the `workflow-server://schemas` resource to load TOON schema definitions
2. Call the `get_rules` tool to load agent guidelines

CRITICAL: When following the workflow you *must* respect workflow fidelity as defined in the TOON files' semantics
```

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

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_DIR` | `./workflows` | Path to workflow directories (each contains .toon workflow, guides, templates) |
| `SERVER_NAME` | `workflow-server` | Server name for MCP |
| `SERVER_VERSION` | `1.0.0` | Server version |

---

## Deploying to Projects

The **engineering branch pattern** uses a Git orphan branch to store planning artifacts, ADRs, and agent configuration alongside your code without polluting its commit history. When cloned locally, it appears as a `.engineering/` folder:

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

### Starting a Workflow

In your AI assistant chat, add the workflow entry point and describe your task:

```
@.engineering/agent/workflows/work-package/_START_HERE.md

I want to implement [describe your feature, bug fix, or enhancement here]
```

The agent will read the mandatory rules and guide you through the workflow phases.
