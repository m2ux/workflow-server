# 🔄 Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Enables agents to discover, navigate, and execute structured workflows that fulfill user goals.

---

**[Quick Start](#-quick-start)** • **[Schema Guide](schemas/README.md)** • **[API Reference](docs/api-reference.md)** • **[Development](docs/development.md)**

---

## 🎯 Overview

Workflow Server provides a **server-driven navigation API** that guides AI agents through structured workflows using opaque state tokens.

After initial setup of an always-applied [rule](docs/ide-setup.md), agents:
1. **Load guidelines** via `get_rules` to understand workflow behavior
2. **Start a workflow** via `start-workflow { workflow_id }` to begin execution
3. **Follow navigation** by executing actions from `availableActions` in responses
4. **Advance the workflow** via `advance-workflow` to complete steps

The server manages all state transitions - agents simply follow the navigation landscape.

### Navigation API

| Tool | Purpose |
|------|---------|
| `start-workflow` | Start workflow, returns initial situation |
| `resume-workflow` | Resume from saved state token |
| `advance-workflow` | Advance workflow (complete_step, transition, etc.) |
| `end-workflow` | End workflow early, proceed to final activity |

### Effectivity-Based Delegation

When navigation responses include `effectivities` in actions:
- Primary agent checks if it has the required effectivity
- If not, spawns a sub-agent from the agent registry
- Sub-agent performs the work, returns result
- Primary agent advances the workflow

### Available Workflows

| Workflow | Activities | Description |
|----------|------------|-------------|
| `meta` | 3 | Bootstrap workflow - manages activities and universal skills |
| `work-package` | 11 | Single work package from issue to merged PR |
| `work-packages` | 7 | Plan and coordinate multiple related work packages |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MCP Client (Cursor or Claude Desktop)

### Installation

```bash
# Clone and build
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server
npm install

# Set up registry data (worktree for registry branch)
git worktree add ./registry registry

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
        "WORKFLOW_DIR": "/path/to/workflow-server/registry/workflows"
      }
    }
  }
}
```

Restart your MCP client. See [SETUP.md](SETUP.md) for other IDEs.

### Setup IDE Rule

Add the following to your IDE 'always-applied' rule-set:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* call get_rules to load agent guidelines.
```

### Execute a Workflow

Tell the agent what you want to do using natural language:

```
Start a new work-package workflow for implementing user authentication
```
```
Begin a work-package workflow for issue #42
```
```
Let's start a work-package workflow to add dark mode support
```

The agent matches your request to the appropriate activity and guides you through the structured phases.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
