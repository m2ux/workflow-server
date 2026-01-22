# ADR: Intent → Skill → Tool Architecture

**Status:** Accepted  
**Date:** 2026-01-20  
**PR:** #2  
**Issue:** #1  

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

### Layer 1: Intents

**Purpose:** Define user goals and map them to skills.

**Location:** `prompts/intents/`

**Structure:**
- `index.json` - Quick-match patterns and intent listing
- `{intent-id}.json` - Problem description, recognition patterns, flow steps

**MCP Resources:**
- `workflow://intents` - Primary agent entry point
- `workflow://intents/{id}` - Individual intent details

### Layer 2: Skills

**Purpose:** Provide tool orchestration patterns and execution guidance.

**Location:** `prompts/skills/`

**Structure:**
- `{skill-id}.json` - Execution patterns, tool guidance, state management, error recovery

**MCP Resources:**
- `workflow://skills` - Skill listing
- `workflow://skills/{id}` - Individual skill content

### Layer 3: Tools

**Purpose:** Execute atomic operations on workflows.

**Existing tools:** `list_workflows`, `get_workflow`, `get_phase`, `get_checkpoint`, `validate_transition`, `health_check`

## Agent Interaction Flow

```
1. Agent fetches workflow://intents (via IDE rule bootstrap)
2. Agent matches user goal to intent using quick_match
3. Agent fetches workflow://intents/{id} for detailed flow
4. Agent fetches workflow://skills/{primary_skill} for tool guidance
5. Agent executes tools following skill patterns
6. Agent maintains state in memory per skill guidance
```

## Rationale

### Why Three Layers?

| Layer | Responsibility | Concern |
|-------|---------------|---------|
| Intent | What problem to solve | Problem domain |
| Skill | How to solve it | Solution domain |
| Tool | Atomic operations | Execution domain |

This separation allows:
- **Intents** to evolve independently of implementation details
- **Skills** to be reused across multiple intents
- **Tools** to remain stable while guidance improves

### Why JSON Format?

- Token-efficient for LLM consumption
- Structured for programmatic access
- Parseable by agents for dynamic behavior

### Why MCP Resources (not Prompts)?

- Resources provide read-only context (appropriate for guidance)
- Resources can be fetched on-demand
- Resources integrate with IDE rules for automatic bootstrap

## Alternatives Considered

### 1. Embed Guidance in Tool Descriptions

**Rejected:** Tool descriptions have length limits and mixing execution with guidance creates maintenance burden.

### 2. Single Skill Without Intents

**Rejected:** Agents need problem-domain matching before solution-domain execution. Intent layer provides this.

### 3. Markdown Format

**Rejected:** Less token-efficient, harder to parse programmatically, more verbose for structured data.

## Consequences

### Positive

- Consistent workflow execution across agent sessions
- Reduced context overhead (load only what's needed)
- Clear separation of concerns
- Extensible pattern for future skills/intents

### Negative

- Initial learning curve for new contributors
- Three files to maintain per capability (intent, skill, docs)
- Agents must fetch multiple resources to begin

### Neutral

- Follows pattern established by concept-rag project
- Requires IDE rule setup for bootstrap

## References

- concept-rag project: Reference implementation of Intent→Skill→Tool pattern
- MCP Resources specification: https://modelcontextprotocol.io/docs/concepts/resources
