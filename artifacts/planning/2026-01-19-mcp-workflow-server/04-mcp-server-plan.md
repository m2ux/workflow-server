# WP04: MCP Server Core

## Overview

Implement the MCP server with tools for workflow access, resource handlers for guides, and supporting infrastructure.

## Status: ✅ Complete

## Deliverables

### MCP Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_workflows` | - | List all available workflows |
| `get_workflow` | `workflow_id` | Get complete workflow definition |
| `get_phase` | `workflow_id`, `phase_id` | Get phase details |
| `get_checkpoint` | `workflow_id`, `phase_id`, `checkpoint_id` | Get checkpoint |
| `validate_transition` | `workflow_id`, `from_phase`, `to_phase` | Validate transition |
| `health_check` | - | Server health status |

### MCP Resources

| Resource | Description |
|----------|-------------|
| `workflow://guides` | List available guide documents |
| `workflow://guides/{name}` | Get specific guide content |

### Infrastructure

- **Configuration:** Environment variable support
- **Error Handling:** Result types, custom errors
- **Logging:** Structured audit logging
- **Validation:** Runtime schema validation

## Implementation

### Files Created

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── config.ts             # Configuration loading
├── errors.ts             # Custom error classes
├── result.ts             # Result type
├── logging.ts            # Audit logging
├── loaders/
│   ├── workflow-loader.ts
│   ├── guide-loader.ts
│   └── index.ts
├── tools/
│   ├── workflow-tools.ts
│   └── index.ts
└── resources/
    ├── guide-resources.ts
    └── index.ts
```

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_DIR` | `./workflow-data/workflows` | Workflow JSON path |
| `GUIDE_DIR` | `./workflow-data/guides` | Guide markdown path |
| `SERVER_NAME` | `workflow-server` | Server name |
| `SERVER_VERSION` | `1.0.0` | Server version |

## Technical Decisions

### MCP SDK Usage

Used `@modelcontextprotocol/sdk` with:
- `McpServer` for high-level API
- `StdioServerTransport` for stdio communication
- `ResourceTemplate` for dynamic resources

### Error Handling

- `Result<T, E>` type for explicit error handling
- Custom error classes: `WorkflowNotFoundError`, `WorkflowValidationError`
- Audit logging for all tool invocations

### Workflow Loading

- Load from filesystem at runtime
- Validate against Zod schema
- Cache not implemented (simple use case)
