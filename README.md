# 🔄 MCP Workflow Orchestration Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Enables agents to discover, navigate, and execute structured workflows.

---

**[Quick Start](#-quick-start)** • **[API Reference](docs/api-reference.md)** • **[Development](docs/development.md)**

---

## 🎯 Overview

Workflow Server uses an **Intent → Skill → Tool** architecture to guide AI agents through structured workflows.

After initial setup of an always-applied [rule](prompts/ide-setup.md), agents:
1. **Match the user's goal** to an [intent](prompts/intents/index.json)
2. **Follow the [skill](prompts/skills/workflow-execution.json) workflow** which orchestrates the right tool sequence
3. **Execute phases** with state management and checkpoint handling

This reduces context overhead and provides deterministic tool selection.

Problem Domain:
```
User Goal (complete a work package) → Intent (start-workflow,..)
```
Solution Domain:
```
Skill (execute-workflow) → Tools(get-transition,..)
```

### Intents

| Intent | Description |
|--------|-----------|
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

Restart your MCP client. See [SETUP.md](SETUP.md) for other IDEs.

### Setup IDE Rule

Add the following to your IDE 'always-applied' rule-set:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* fetch the `workflow://intents` resource.
```

Start executing workflows!

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
