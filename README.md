# 🔄 MCP Workflow Orchestration Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Enables agents to discover, navigate, and execute structured workflows.

---

**[Quick Start](#-quick-start)** • **[Schema Guide](schemas/README.md)** • **[API Reference](docs/api-reference.md)** • **[Development](docs/development.md)**

---

## 🎯 Overview

Workflow Server uses an **Activity → Skill → Tool** architecture to guide AI agents through structured workflows.

After initial setup of an always-applied [rule](docs/ide-setup.md), agents:
1. **Match the user's goal** to an activity via `get_activities`
2. **Follow the skill workflow** via `get_skill` which orchestrates the right tool sequence
3. **Execute phases** with state management and checkpoint handling

This reduces context overhead and provides deterministic tool selection.

### Execution Model

> Problem Domain:
> ```
> User Goal (complete a work package) → Activity (start-workflow, resume-workflow, ..)
> ```
> Solution Domain:
> ```
> Skill(s) (execute-workflow) → Tool(s) (get-transition, get-phase, get-checkpoint, ..)
> ```

### Activities

| Activity | Description |
|----------|-----------|
| `start-workflow` | Begin executing a new workflow from the beginning |
| `resume-workflow` | Continue a workflow that was previously started |
| `end-workflow` | Complete and finalize an active workflow |

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

### Setup IDE Rule

Add the following to your IDE 'always-applied' rule-set:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* call the get_activities tool.
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
