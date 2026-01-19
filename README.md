# Workflow Server

MCP server for AI agent workflow orchestration.

## Overview

This server enables AI agents to discover, execute, and orchestrate structured workflows via the [Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io/).

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (JSON definitions, orphan branch)

## Development

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `list_workflows` | List available workflows |
| `get_workflow` | Get workflow by ID |
| `get_phase` | Get phase details |
| `get_checkpoint` | Get checkpoint details |
| `validate_transition` | Validate phase transitions |
| `health_check` | Server health status |

## License

MIT
