# 🧭 Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Create structured, fidelity-enforced workflows that agents discover, navigate, and execute to fulfill user goals.

---

**[Docs Site](https://m2ux.github.io/workflow-server/)** • **[Architecture](docs/architecture.md)** • **[Schemas](schemas/README.md)** • **[API](docs/api-reference.md)** • **[Workflow Fidelity](docs/workflow-fidelity.md)** • **[Development](docs/development.md)** • **[Workflows](https://github.com/m2ux/workflow-server/tree/workflows)** • **[Engineering](docs/engineering-storage.md)**

---

## 🎯 Overview

Workflow Server guides AI agents through structured, multi-step workflows. A single always-applied [IDE rule](docs/ide-setup.md) bootstraps the agent — from there, the server handles workflow discovery, session management, and step-by-step navigation.

### How It Works

1. **Discover** — The agent learns which workflows exist and how to begin
2. **Start** — A session is started for the matched workflow
3. **Navigate** — The agent moves through activities in order, loading each phase’s steps and guidance as needed
4. **Execute** — Work proceeds activity by activity, pausing at checkpoints for user decisions and following transitions between phases

### Architecture

```
User Goal → Workflow → Activities → Techniques → Tools
```

- **Workflows** — define the overall process (e.g., implement a feature from issue to merged PR)
- **Activities** — are phases within a workflow (e.g., plan, implement, review, validate)
- **Techniques** — are markdown definitions of a capability, with optional rules
- **Tools** — are the operations the agent invokes


## 🚀 Quick Start

### Setup
See: **[setup.md](setup.md)**.

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
