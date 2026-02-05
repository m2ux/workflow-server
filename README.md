# 🔄 Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

An [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Create your own structured workflows that agents discover, navigate, and execute to fulfill user goals.

---

**[Quick Start](#-quick-start)** • **[Schema Guide](schemas/README.md)** • **[API Reference](docs/api-reference.md)** • **[Development](docs/development.md)** • **[Workflows](https://github.com/m2ux/workflow-server/tree/workflows)** • **[Engineering](https://github.com/m2ux/workflow-server/tree/engineering)**

---

## 🎯 Overview

Workflow Server uses a **Goal → Activity → Skill → Tools** architecture to guide AI agents through structured workflows.

After initial setup of an always-applied [rule](docs/ide-setup.md), agents:
1. **Match the user's goal** to an activity via `get_activities` (returns `quick_match` patterns and `next_action` guidance)
2. **Load the primary skill** via `get_skill` to get tool orchestration patterns (execution order, state tracking, error recovery)
3. **Execute workflow activities** using skill-directed tools (`get_workflow`, `get_workflow_activity`, `get_checkpoint`, `validate_transition`)

This reduces context overhead and provides deterministic tool selection.

### Execution Model

> Problem Domain:
> ```
> User Goal (complete a work package) → Activity (start-workflow, resume-workflow, ..)
> ```
> Solution Domain:
> ```
> Skill(s) (workflow-execution) → Tool(s) (validate_transition, get_workflow_activity, get_checkpoint, ..)
> ```

### Available Workflows

| Workflow | Activities | Description |
|----------|------------|-------------|
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

Add the following to your IDE 'always-applied' rule-set (see [`docs/ide-setup.md`](docs/ide-setup.md) for details):

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must*:
1. Fetch the `workflow-server://schemas` resource to load TOON schema definitions
2. Call the `get_rules` tool to load agent guidelines

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

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
