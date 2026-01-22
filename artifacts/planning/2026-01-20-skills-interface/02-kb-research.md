# Research: Skills Interface

## Knowledge Base Research

### Sources Consulted

| Source | Relevance |
|--------|-----------|
| Design Patterns (Gang of Four) | State pattern, Strategy pattern for behavior encapsulation |
| Designing Data-Intensive Applications (Kleppmann) | Interface design principles, API ergonomics |
| Software Development, Design, and Coding (Dooley) | Design patterns catalog, interface design |

### Key Insights

#### 1. State Pattern Applicability

The workflow-execution skill guides agents through state transitions. The State pattern is relevant:

- **Context**: Agent maintains workflow state
- **State objects**: Phases represent discrete states
- **Transitions**: Condition-based transitions between phases

**Application**: The skill should teach agents to:
- Track current state (phase, step, checkpoint)
- Evaluate conditions for transitions
- Apply effects from checkpoint responses

#### 2. Interface Design Principle

From Kleppmann's *Designing Data-Intensive Applications*:

> "Design systems in a way that minimizes opportunities for error. Well-designed abstractions, APIs, and admin interfaces make it easy to do 'the right thing' and discourage 'the wrong thing'."

**Application**: The skill should:
- Make tool selection obvious ("when X, use tool Y")
- Prevent incorrect tool sequences through clear execution patterns
- Provide recovery guidance for common errors

#### 3. Encapsulation Pattern

From design patterns literature:

- **Encapsulate what varies**: Workflow logic varies per workflow; skill provides stable interpretation pattern
- **Program to interface**: Skill defines interface to workflow execution; agent doesn't need to know implementation details

**Application**: The skill encapsulates:
- Tool orchestration patterns (stable across workflows)
- Interpretation rules for Zod-based JSON schema
- State management guidance

## Web Research

### MCP Protocol Resources vs Tools

From MCP documentation:

| Feature | Control | Purpose |
|---------|---------|---------|
| **Tools** | Model-controlled | Actions the LLM can call |
| **Resources** | Application-controlled | Passive data for context |
| **Prompts** | User-controlled | Templates for workflows |

**Skills fit as Resources because:**
- Read-only data providing context
- Agent reads skill before using tools
- No action/mutation required

### Resource Patterns

MCP supports two resource discovery patterns:

1. **Direct Resources** - Fixed URIs pointing to specific data
   - Example: `workflow://skills/workflow-execution`
   
2. **Resource Templates** - Dynamic URIs with parameters
   - Example: `workflow://skills/{skill-id}`

**Recommendation**: Use both patterns for future extensibility:
- Direct resource for listing: `workflow://skills`
- Template for individual skills: `workflow://skills/{id}`

### Related Project: intellectronica/skillz

A similar project exists that implements skills as an MCP server shim for non-Claude clients.

**Key pattern observed**: Skills as loadable context that guides agent behavior before tool usage.

## Design Recommendations

### 1. Skill Structure

Based on research, the hybrid JSON structure should:
- Minimize decision points (clear tool mapping)
- Provide recovery paths (error scenarios)
- Encode workflow interpretation rules

### 2. Bootstrap Pattern

The IDE setup file should:
- Direct agents to fetch skill resource before tool usage
- Mirror concept-rag's proven pattern
- Be discoverable via MCP server instructions

### 3. State Management

Based on State pattern research:
- Agent maintains in-memory state object
- State tracks: currentPhase, completedPhases, variables, checkpointResponses
- State updates on: phase transition, checkpoint response, variable change

## Summary of Applicable Patterns

| Pattern | Application |
|---------|-------------|
| **State Pattern** | Agent tracks workflow state, transitions between phases |
| **Strategy Pattern** | Tool selection based on current context |
| **Template Method** | Skill provides skeleton; workflow JSON fills in specifics |
| **Facade Pattern** | Skill simplifies complex workflow schema for agent consumption |

## Date

2026-01-20
