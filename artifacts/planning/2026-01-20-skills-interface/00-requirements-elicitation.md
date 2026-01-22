# Requirements Elicitation: Skills Interface

## Issue

- **GitHub Issue:** #1 - Agents lack guidance for consistent workflow tool usage
- **PR:** #2 - feat: skills interface for workflow execution guidance

## Problem Statement

Agents using workflow-server MCP tools have no structured guidance for tool selection and execution order, leading to inconsistent workflow execution across sessions.

## Elicited Requirements

### Skill Scope

Single "workflow-execution" skill that guides agents through any workflow from start to completion. The skill works with any workflow definition loaded via the existing tools.

### Loading Mechanism

- **Primary:** MCP Resource at `workflow://skills/workflow-execution`
- **Bootstrap:** IDE setup markdown file instructs agents to fetch the skill resource before using workflow tools

### Content Focus

The skill provides guidance for:
1. **Tool orchestration** - Which tools to call, in what order, with what parameters
2. **Workflow interpretation** - How to read/interpret the JSON workflow schema (phases, checkpoints, transitions, conditions)

### State Management

Agent-managed state object maintained in memory during session. The skill teaches agents to track:
- Current phase
- Completed phases
- Workflow variables
- Checkpoint responses

### JSON Structure

Hybrid structure optimized for token efficiency and agent comprehension:

```json
{
  "id": "workflow-execution",
  "capability": "...",
  "execution_pattern": {
    "start": [...],
    "per_phase": [...],
    "transitions": [...]
  },
  "tools": {
    "<tool_name>": { "when": "...", "returns": "...", "preserve": [...] }
  },
  "state": {
    "track": [...],
    "update_on": "..."
  },
  "interpretation": {
    "transitions": "...",
    "checkpoints": "...",
    "decisions": "..."
  }
}
```

### Error Handling

Include guidance for 3-5 common error scenarios:
- Invalid phase transition
- Missing workflow
- Invalid checkpoint response
- Condition evaluation failure
- Missing required variable

### File Locations

| Deliverable | Path | Format |
|-------------|------|--------|
| Skill definition | `prompts/skills/workflow-execution.json` | JSON |
| IDE setup | `prompts/ide-setup.md` | Markdown |
| MCP resource handler | `src/resources/skill-resources.ts` | TypeScript |

## Out of Scope

- Intent detection/matching (explicitly excluded)
- Changes to existing workflow schema
- Changes to existing MCP tools (only additions)
- Persistent state storage (agent manages in-session only)

## Success Criteria

- [ ] Agent can load skill via `workflow://skills/workflow-execution` resource
- [ ] Skill specifies tool selection for workflow contexts
- [ ] State management pattern is documented and usable
- [ ] Workflow progression is consistent across sessions
- [ ] IDE setup file provides bootstrap instructions
- [ ] Token-efficient JSON format (~300-400 tokens)

## Stakeholders

- **Primary:** AI agents executing workflows
- **Secondary:** Developers configuring MCP clients

## Date

2026-01-20
