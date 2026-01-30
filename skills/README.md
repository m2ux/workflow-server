# Skills

Skills provide structured guidance for agent execution patterns. They are consumed agent-side to inform how to approach specific tasks.

## Relationship to Effectivities

| Concept | Purpose | Location |
|---------|---------|----------|
| **Effectivities** | Declare capability requirements | Step definitions, agent matching |
| **Skills** | Provide execution guidance | Agent-side reference during task execution |

Skills provide the "how" while effectivities provide the "what capability is needed."

## Skill Categories

### Universal Skills (from meta/)

Applied across all workflows:

| Skill | Description |
|-------|-------------|
| `activity-resolution` | Match user intent to activities |
| `workflow-execution` | Navigate workflow state machine |
| `state-management` | Track and persist workflow state |
| `artifact-management` | Manage planning artifacts |

### Workflow-Specific Skills (from work-package/)

Applied during specific workflows:

| Skill | Description |
|-------|-------------|
| `code-review` | Rust/Substrate code review patterns |
| `test-review` | Test suite quality assessment |
| `pr-review-response` | PR comment response strategy |

## Usage

Skills are loaded via the MCP server:

```
get_skill(skill_id: "code-review")
```

The skill provides structured guidance including:
- Execution patterns
- Tool usage guidance
- State tracking requirements
- Error recovery patterns

## Migration Note

Skills were previously stored per-workflow in `{workflow}/skills/`. They are now consolidated in this top-level folder for easier agent-side consumption. The original locations remain for backward compatibility but this folder is the authoritative source.
