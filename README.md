# 🧭 Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Create structured, fidelity-enforced workflows that agents discover, navigate, and execute to fulfill user goals.

---

**[Docs Site](https://m2ux.github.io/workflow-server/)** • **[Quick Start](#-quick-start)** • **[Architecture](docs/architecture.md)** • **[Schemas](schemas/README.md)** • **[API](docs/api-reference.md)** • **[Workflow Fidelity](docs/workflow-fidelity.md)** • **[Development](docs/development.md)** • **[Docs Map](docs/documentation-system.md)** • **[Workflows](https://github.com/m2ux/workflow-server/tree/workflows)** • **[Engineering](https://github.com/m2ux/workflow-server/tree/engineering)**

---

## 🎯 Overview

Workflow Server guides AI agents through structured, multi-step workflows. A single always-applied [IDE rule](docs/ide-setup.md) bootstraps the agent — from there, the server handles workflow discovery, session management, and step-by-step navigation.

### How It Works

1. **Discover** — The agent calls `discover` to learn available workflows and the bootstrap procedure
2. **Start session** — `start_session` returns a session token; `get_workflow` returns the workflow structure, the workflow's `techniques.workflow` bundled under `techniques` and `rules`, and the `initialActivity` ID
3. **Navigate** — `next_activity` advances the session to the next activity; `get_activity` returns the activity's full definition (steps, checkpoints, transitions) along with the activity's bundled techniques — the workflow's inherited `techniques.activity` plus the activity's own `techniques[]` — under `techniques` and `rules`. `get_resource` lazy-loads reference material referenced by a technique
4. **Execute** — The agent works through activities, with checkpoints for user decisions and transitions governing the flow between activities

### Architecture

```
User Goal → Workflow → Activities → Techniques → Tools
```

- **Workflows** define the overall process (e.g., implement a feature from issue to merged PR)
- **Activities** are phases within a workflow (e.g., plan, implement, review, validate)
- **Techniques** are markdown definitions of a capability, with optional rules
- **Tools** are the operations the agent invokes


## 🚀 Quick Start

### Initialise Workflow Server

Pick a setup path:

| Path | Guide |
|------|--------|
| **Docker / HTTP** (GHCR image, no server checkout) | [http.md](http.md) |
| **stdio** (local checkout; IDE spawns the process) | [stdio.md](stdio.md) |

### Initialise target project

From the **root of the project repo** you want the workflow server to operate on (not this server repo), run:

```bash
curl -O https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

That creates `.engineering/` in that project (planning artifacts, history, scripts, and workflow data) so sessions can bind a workspace and write run output. Options: [`scripts/deploy.sh`](scripts/deploy.sh) `--help`.

### Execute a workflow

With the server connected and target project initialised, tell the agent in your chat session what you want to do, for example:

```
Start a new work-package workflow for Issue #1000
```
```
Resume the work-package workflow for PR #1000
```

The agent matches the request to the appropriate activity and guides you through the structured phases.

### MCP Tools

The server registers 17 MCP tools across five concerns. See [docs/api-reference.md](docs/api-reference.md) for full signatures.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
