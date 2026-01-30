# Skills

Skills provide structured guidance for agent execution patterns. They are consumed agent-side to inform how to approach specific tasks.

## Relationship to Effectivities

| Concept | Purpose | Location |
|---------|---------|----------|
| **Effectivities** | Declare capability requirements | Step definitions, agent matching |
| **Skills** | Provide execution guidance | Agent-side reference during task execution |

Skills provide the "how" while effectivities provide the "what capability is needed."

## Available Skills

### Effectivity Skills

These skills are associated with effectivities and provide guidance for sub-agents:

| Skill | Effectivity | Description |
|-------|-------------|-------------|
| `code-review` | `code-review`, `code-review_rust`, `code-review_rust_substrate` | Code review patterns and quality checks |
| `test-review` | `test-review` | Test suite quality assessment |
| `pr-review-response` | `pr-review-response` | PR comment analysis and response |

### Domain Skills

These skills provide domain-specific guidance not tied to effectivities:

| Skill | Description |
|-------|-------------|
| `artifact-management` | Initialize and manage planning artifact folders |

## Workflow Navigation

Workflow navigation is handled by the **Navigation API**, not skills:

| Tool | Purpose |
|------|---------|
| `start-workflow` | Start workflow execution |
| `resume-workflow` | Resume from saved state |
| `advance-workflow` | Complete steps, respond to checkpoints |
| `end-workflow` | End workflow early |

See `rules.toon` in `workflows/meta/` for navigation guidance.

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
