# 🧭 Workflow Orchestration Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for AI agent workflow orchestration. Create structured, fidelity-enforced workflows that agents discover, navigate, and execute to fulfill user goals.

---

**[Site](https://m2ux.github.io/workflow-server/)** •  **[Documentation](docs/README.md)** • **[Workflows](https://github.com/m2ux/workflow-server/tree/workflows)** • **[Workspace](https://github.com/m2ux/workflow-server/tree/workspace)** • **[Deployment](https://github.com/m2ux/workflow-server/tree/docker)**

---

## 🎯 Overview

Workflow Server guides AI agents through structured, multi-step workflows. A single always-applied [rule](docs/setup.md#3-setup-cursor-workspace) bootstraps a meta-orchestration agent — from there, the agent-server conversation handles workflow discovery, session management, and step-by-step navigation.

### Why?

**pseudo-mechanical** workflow execution provides:

* Optionality to ossify repeated operations into a schematised mechanical form.
* Precision composition and delivery of procedure to avoid context rot and maximise token efficiency
* Ontological seperation of skill-like prose into procedural (technique) and non-procedural (resource)
* A corpus of pre-constructed general purpose workflow elements for software engineering

### How It Works

1. **Discover** — The agent learns which workflows exist and how to begin
2. **Start** — A session is started for the matched workflow
3. **Navigate** — The agent moves through activities in order, loading each phase’s steps and guidance as needed
4. **Execute** — Work proceeds activity by activity, pausing at checkpoints for user decisions and following the workflow's graph between phases

### Architecture

```
User Goal → Workflow → Activities → Techniques → Tools
```

- **Workflows** — define the mechanical process and outcome contract (e.g., implement a feature from issue to merged PR)
- **Activities** — are mechanical phases within a workflow (e.g., plan, implement, review, validate)
- **Techniques** — are prose-based capability definitions, with an explicit contract (inputs, outputs, procedure, rules)
- **Tools** — are the external programs or APIs a technique invokes


## 🚀 Quick Start

### Setup

See: **[setup.md](docs/setup.md)** for detailed setup instructions.

### Execute a workflow

With the server connected and target project initialised, tell the agent in your chat session what you want to do, for example:

```
Start a new work-package workflow for Issue #1000
```
```
Resume the work-package workflow for PR #1000
```

The agent matches the request to the appropriate activity and guides you through the structured phases.

### API

See [docs/api.md](docs/api.md).

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
