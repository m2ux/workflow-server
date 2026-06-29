# 🔄 Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that gives AI agents a clear, repeatable process to follow. You define that process as a workflow — an ordered set of steps for a goal. The server keeps the agent on that defined path, so these workflows are fidelity-enforced. Agents discover, navigate, and execute them to fulfill user goals.

---

**[Quick Start](#-quick-start)** • **[Architecture](docs/architecture.md)** • **[Schemas](schemas/README.md)** • **[API](docs/api-reference.md)** • **[Workflow Fidelity](docs/workflow-fidelity.md)** • **[Development](docs/development.md)** • **[Workflows](https://github.com/m2ux/workflow-server/tree/workflows)** • **[Engineering](https://github.com/m2ux/workflow-server/tree/engineering)**

---

## 🎯 Overview

Workflow Server guides AI agents through multi-step workflows, one step at a time. You add a single [IDE rule](docs/ide-setup.md) that is always applied, and it starts the agent off. From there the server takes over: it helps the agent find a workflow, tracks the session, and walks it through the steps.

### How It Works

1. **Discover** — The agent calls `discover` to learn available workflows and the bootstrap procedure
2. **Start session** — `start_session` returns a session token. `get_workflow` then returns the workflow structure, along with the techniques and rules it needs and the `initialActivity` ID
3. **Navigate** — `next_activity` advances the session to the next activity. `get_activity` returns that activity's full definition (steps, checkpoints, transitions), plus the techniques that activity uses. `get_resource` loads reference material a technique points to, only when it is needed
4. **Execute** — The agent works through activities, with checkpoints for user decisions and transitions governing the flow between activities

### Architecture

```
User Goal → Workflow → Activities → Techniques → Tools
```

- **Workflows** describe the whole process (e.g., implement a feature from issue to merged PR)
- **Activities** are the phases within a workflow (e.g., plan, implement, review, validate)
- **Techniques** are markdown files that describe one capability, each with optional rules
- **Tools** are the operations the agent calls

### MCP Tools at a Glance

The server registers 16 MCP tools across five concerns. See [docs/api-reference.md](docs/api-reference.md) for full signatures.

| Concern | Tools |
|---------|-------|
| Bootstrap (no session token) | `discover`, `list_workflows`, `health_check` |
| Session | `start_session`, `get_workflow_status`, `dispatch_child` |
| Workflow / activity navigation | `get_workflow`, `next_activity`, `get_activity` |
| Checkpoint flow | `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint` |
| Techniques, resources | `get_technique`, `get_resource` |
| Trace | `get_trace` |

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

Add the bootstrap rule from [`docs/ide-setup.md`](docs/ide-setup.md) to your IDE's 'always-applied' rule set. The rule tells the agent to call `discover` on every workflow request. That way, the bootstrap procedure always stays in sync with the server.

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

The agent matches your request to the right activity. It then guides you through the phases, one at a time.

## Engineering layout

The `.engineering/` directory holds your engineering artifacts and the files that support your workflows.

### Directory structure

- `artifacts/planning/` — Work package plans and specifications
- `history/` — Project history and change logs
- `scripts/` — Utility scripts

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
