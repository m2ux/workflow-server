# 🔄 MCP Workflow Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Enables agents to discover, navigate, and execute structured workflows.

---

**[Quick Start](#-quick-start)** • **[MCP Tools](#-mcp-tools)** • **[Development](docs/development.md)**

---

## 🎯 Overview

This server provides workflow orchestration capabilities for AI agents:

- **Workflow Discovery** - List and retrieve available workflow definitions
- **Phase Navigation** - Access individual phases, steps, and checkpoints
- **Transition Validation** - Validate allowed state transitions
- **Guide Resources** - Access markdown documentation for each workflow step

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MCP Client (Cursor, Claude Desktop, or compatible client)

### Installation

```bash
# Clone and install
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
npm install

# Set up workflow data (worktree for orphan branch)
git worktree add ./workflow-data workflows

# Build the server
npm run build
```

### Configure MCP Client

**Cursor** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": ["/path/to/workflow-server/dist/index.js"],
      "env": {
        "WORKFLOW_DIR": "/path/to/workflow-server/workflow-data/workflows",
        "GUIDE_DIR": "/path/to/workflow-server/workflow-data/guides"
      }
    }
  }
}
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "node",
      "args": ["/path/to/workflow-server/dist/index.js"],
      "env": {
        "WORKFLOW_DIR": "/path/to/workflow-server/workflow-data/workflows",
        "GUIDE_DIR": "/path/to/workflow-server/workflow-data/guides"
      }
    }
  }
}
```

Restart your MCP client after configuration.

### Verify Installation

After restarting your MCP client, you can verify the server is working:

```
Use the workflow server to list available workflows
```

The agent should use `list_workflows` and return the available workflow definitions.

## 🛠 MCP Tools

| Tool | Description |
|------|-------------|
| `list_workflows` | List all available workflow definitions with metadata |
| `get_workflow` | Get complete workflow definition by ID |
| `get_phase` | Get details of a specific phase within a workflow |
| `get_checkpoint` | Get checkpoint details including options and effects |
| `validate_transition` | Validate if a transition between phases is allowed |
| `health_check` | Check server health and available workflows |

## 📚 MCP Resources

| Resource | Description |
|----------|-------------|
| `workflow://guides` | List all available guide documents |
| `workflow://guides/{name}` | Get content of a specific guide |

## 📖 Available Workflows

| Workflow | Phases | Description |
|----------|--------|-------------|
| `work-package` | 11 | Full work package lifecycle from issue to PR |
| `example-workflow` | 3 | Example demonstrating schema features |

## 📁 Branch Structure

| Branch | Content | Purpose |
|--------|---------|---------|
| `main` | TypeScript server code | Implementation |
| `workflows` | JSON workflows + guides | Data (orphan branch) |

This separation allows workflow definitions to evolve independently from server code, with separate versioning and commit histories.

## 📚 Documentation

| Resource | Description |
|----------|-------------|
| [Development Guide](docs/development.md) | Setup, testing, project structure |

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
