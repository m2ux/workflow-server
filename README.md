# 🔄 Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Create your own structured workflows that agents discover, navigate, and execute to fulfill user goals.

---

**[Quick Start](#-quick-start)** • **[Schema Guide](schemas/README.md)** • **[API Reference](docs/api-reference.md)** • **[Development](docs/development.md)** • **[Workflows](https://github.com/m2ux/workflow-server/tree/workflows)** • **[Engineering](https://github.com/m2ux/workflow-server/tree/engineering)**

---

## 🎯 Overview

Workflow Server guides AI agents through structured, multi-step workflows. A single always-applied [IDE rule](docs/ide-setup.md) bootstraps the agent — from there, the server handles workflow discovery, session management, and step-by-step navigation.

### How It Works

1. **Discover** — The agent lists available workflows and selects one that matches the user's goal
2. **Start session** — The server returns behavioral rules for the workflow and an opaque session token that tracks workflow state across all subsequent calls
3. **Navigate** — Skills loaded from the server tell the agent which tools to call and in what order. The session token carries workflow context so individual tools need minimal parameters
4. **Execute** — The agent works through activities (phases of a workflow), with checkpoints for user decisions and transitions governing the flow between activities

### Architecture

```
User Goal → Workflow → Activity → Skill → Tools
                         ↑                   |
                         └───────────────────┘
                           (transitions)
```

- **Workflows** define the overall process (e.g., implement a feature from issue to merged PR)
- **Activities** are phases within a workflow (e.g., plan, implement, review, validate)
- **Skills** provide tool orchestration patterns — which tools to call, in what order, what state to track
- **Tools** are the MCP operations the agent invokes, all correlated by the session token

### Available Workflows

| Workflow | Activities | Description |
|----------|------------|-------------|
| `work-package` | 14 | Single work package from issue to merged PR |
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

# Set up workflow data (worktree for orphan branch)
git worktree add ./workflows workflows

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
        "WORKFLOW_DIR": "/path/to/workflow-server/workflows"
      }
    }
  }
}
```

Restart your MCP client. See [SETUP.md](SETUP.md) for other IDEs.

### Deploy to Your Project

To set up the engineering branch pattern in your own project:

```bash
curl -O https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

This creates a `.engineering/` folder with workflows and artifact directories. See [SETUP.md](SETUP.md#deploying-to-projects) for options and details.

### Setup IDE Rule

Add the following to your IDE 'always-applied' rule-set (see [`docs/ide-setup.md`](docs/ide-setup.md) for details):

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must*:
1. Fetch the `workflow-server://schemas` resource to load TOON schema definitions
2. Call the `start_session` tool to load agent guidelines and obtain a session token

CRITICAL: When following the workflow you *must* respect workflow fidelity as defined in the TOON files' semantics
```

### Execute a Workflow

Tell the agent what you want to do using natural language:

**Start a workflow:**
```
Start a new work-package workflow for implementing user authentication
```
```
Begin a work-package workflow for issue #42
```

**Resume a workflow:**
```
Resume the work-package workflow we were working on
```
```
Continue the authentication work package from where we left off
```

**End a workflow:**
```
End the current work-package workflow
```
```
Complete the work package and clean up
```

The agent matches your request to the appropriate activity and guides you through the structured phases.

## Engineering layout

The `.engineering/` directory holds engineering artifacts and workflow-related assets.

### Directory structure

- `artifacts/planning/` — Work package plans and specifications
- `history/` — Project history and change logs
- `scripts/` — Utility scripts

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
