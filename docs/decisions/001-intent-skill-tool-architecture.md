# ADR-001: Intent → Skill → Tool Architecture

**Status:** Accepted  
**Date:** 2026-01-20  
**PR:** #2  

---

## Context

AI agents using the workflow-server MCP tools lacked structured guidance on:
1. When to use each tool
2. How to maintain workflow state across tool calls
3. How to interpret workflow definitions (transitions, checkpoints, decisions)
4. How to recover from common errors

Without guidance, agents would need to infer tool usage from schema alone, leading to inconsistent workflow execution.

## Decision

Implement a three-layer architecture for agent guidance:

```
User Goal → Intent (problem domain) → Skill (solution domain) → Tools
```

**Critical Principle:** Goals resolve to intents; intents resolve to skills. Goals NEVER resolve directly to skills. If a user goal could be served by an existing skill but no intent exists, this indicates a **design gap** - a missing intent that should be created.

### Layer 1: Intents

**Purpose:** Define user goals and map them to skills.

**Location:** `prompts/intents/`

**MCP Tools:**
- `get_intents` - Primary agent entry point (intent index)
- `get_intent { intent_id }` - Individual intent details

### Layer 2: Skills

**Purpose:** Provide tool orchestration patterns and execution guidance.

**Location:** `prompts/skills/`

**MCP Tools:**
- `list_skills` - Skill listing
- `get_skill { skill_id }` - Individual skill content

### Layer 3: Tools

**Purpose:** Execute atomic operations on workflows.

**Workflow tools:** `list_workflows`, `get_workflow`, `get_phase`, `get_checkpoint`, `validate_transition`, `health_check`

**Resource tools:** `list_guides`, `get_guide`, `list_templates`, `get_template`, `list_resources`

## Agent Interaction Flow

```
1. Agent calls get_intents (via IDE rule bootstrap)
2. Agent matches user goal to intent using quick_match
3. Agent calls get_intent { intent_id } for detailed flow
4. Agent calls get_skill { skill_id } for tool guidance
5. Agent executes tools following skill patterns
6. Agent maintains state in memory per skill guidance
```

## Rationale

| Layer | Responsibility | Concern |
|-------|---------------|---------|
| Intent | What problem to solve | Problem domain |
| Skill | How to solve it | Solution domain |
| Tool | Atomic operations | Execution domain |

This separation allows:
- **Intents** to evolve independently of implementation details
- **Skills** to be reused across multiple intents
- **Tools** to remain stable while guidance improves

## Consequences

### Positive

- Consistent workflow execution across agent sessions
- Reduced context overhead (load only what's needed)
- Clear separation of concerns
- Extensible pattern for future skills/intents
- Tool-based API is discoverable via MCP tool listing

### Negative

- Initial learning curve for new contributors
- Three files to maintain per capability (intent, skill, docs)

## References

- concept-rag project: Reference implementation of Intent→Skill→Tool pattern
- MCP Tools specification: https://modelcontextprotocol.io/docs/concepts/tools
