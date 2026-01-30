# Meta Workflow

> Bootstrap workflow for the workflow-server. Provides global agent rules and universal skills. The navigation API handles workflow lifecycle operations.

## Overview

The Meta workflow contains **global configuration** consumed by all workflows:
- `rules.toon` - Agent behavioral guidelines
- Universal skills for common patterns

**Workflow lifecycle is handled by the Navigation API**, not by activities in this workflow.

## Navigation API

| Tool | Purpose |
|------|---------|
| `start-workflow` | Start any workflow by ID |
| `resume-workflow` | Resume from saved state token |
| `advance-workflow` | Complete steps, respond to checkpoints, transition |
| `end-workflow` | End workflow early, proceed to final activity |

### Workflow Lifecycle

```
start-workflow { workflow_id: "work-package" }
       ↓
   NavigationResponse { position, availableActions, state }
       ↓
advance-workflow { state, action: "complete_step", step_id: "..." }
       ↓
   NavigationResponse { position, availableActions, state }
       ↓
     ... continue until complete: true ...
```

## Rules

`rules.toon` defines global agent guidelines:

| Section | Priority | Description |
|---------|----------|-------------|
| `workflow-bootstrap` | critical | Bootstrap sequence for workflow execution |
| `navigation-api` | critical | Server-driven navigation rules |
| `effectivity-delegation` | critical | Delegation to sub-agents |
| `code-modification` | critical | Guardrails for code changes |
| `workflow-boundaries` | high | Iterative implementation rules |
| `file-restrictions` | high | File and directory restrictions |
| `documentation` | medium | Documentation standards |
| `version-control` | medium | Commit and branch standards |
| `todo-management` | low | Task tracking guidelines |

## Skills

Universal skills for agent reference:

| Skill | Description |
|-------|-------------|
| `activity-resolution` | Match user intent to workflows |
| `workflow-execution` | Navigate workflow state (now handled by navigation API) |
| `state-management` | Track and persist workflow state (via state tokens) |
| `artifact-management` | Manage planning artifacts |

## Legacy Activities

The following activities exist for backward compatibility but are superseded by the navigation API:

| Activity | Replaced By |
|----------|-------------|
| `start-workflow` | `start-workflow` tool |
| `resume-workflow` | `resume-workflow` tool |
| `end-workflow` | `end-workflow` tool |

## Usage

Agents bootstrap via the IDE rule:

```
For all workflow execution user requests use the workflow-server MCP server. 
Before use you *must* call get_rules to load agent guidelines.
```

Then follow the navigation API to execute workflows.
