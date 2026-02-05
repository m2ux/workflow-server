# Research: Schema Documentation

**Work Package:** Schema Documentation  
**Date:** 2026-01-22  
**Phase:** Research

## Knowledge Base Research

The knowledge base did not contain direct resources on schema documentation or README best practices. The search returned tangentially related results on TypeScript type exploration and code documentation practices, but nothing directly applicable.

**Conclusion:** Proceed with web research findings.

## Web Research Findings

### JSON Schema Documentation Best Practices

**Sources:** json-schema.org, Medium, Theneo.io

**Key Principles:**
1. **Clear contracts** - Define data models and relationships before writing the schema
2. **Descriptive naming** - Use human-readable titles and detailed descriptions for each schema element
3. **Reusability** - Utilize `$ref` references to promote DRY principles
4. **Validation rules** - Define patterns, min/max values, and constraints
5. **Generated documentation** - Modern approaches include generating searchable documentation sites from schemas

**Documentation Structure:**
- Getting started guides and tutorials
- Real-world examples across different domains
- Schema basics and essential keywords
- Step-by-step guides for creating first schema
- Glossary of common terms

### Mermaid Diagrams for Workflow Documentation

**Sources:** GitHub Docs, Mermaid.js, Neon Docs

**Recommended Diagram Types:**
- **Flowcharts** - Basic process flows and decision trees (best for phase transitions)
- **State Diagrams** - State transitions (ideal for workflow phases)

**Best Practices:**
- Keep diagrams focused with 5-10 nodes maximum
- Constrain width to 800px for readability
- For complex workflows, break into multiple simpler diagrams
- Use fenced code blocks with `mermaid` language identifier for GitHub rendering

### State Machine Documentation Patterns

**Sources:** XState Docs, W3C SCXML

**Core Components to Document:**
1. **States (Phases)** - Different conditions/stages in the workflow
2. **Transitions** - How the workflow moves between states
3. **Events** - What triggers transitions
4. **Initial State** - Where the process begins
5. **Final State** - Terminal/completion states

**Key Concepts:**
- Transitions are deterministic: same event always produces same result from given state
- States can be atomic, compound (with children), parallel, or final
- Guard conditions can control which transition is taken

## Applicable Patterns

| Pattern | Application to Schema Docs |
|---------|---------------------------|
| Hierarchical structure | Document workflow → phases → steps → checkpoints hierarchy |
| State diagram | Mermaid state diagram showing phase transitions |
| Real-world examples | Annotated minimal workflow example |
| Field descriptions | Table of properties with types and purposes |
| Validation guidance | How to run validation scripts |

## Documentation Structure Recommendation

Based on research, the `schemas/README.md` should include:

1. **Overview** - Purpose of the schema system
2. **Schema Relationships Diagram** - Mermaid diagram showing how workflow, condition, and state connect
3. **Workflow Schema** - Structure, phases, steps, checkpoints with examples
4. **Condition Schema** - Operators and composition with examples
5. **State Schema** - Runtime tracking with examples
6. **Complete Example** - Minimal valid workflow with annotations
7. **Validation** - How to validate workflows locally

## Risks and Anti-patterns

| Risk | Mitigation |
|------|------------|
| Documentation becomes stale | Keep examples minimal and self-contained |
| Over-complex diagrams | Limit to 5-10 nodes per diagram |
| Missing edge cases | Document common patterns, link to full schema for details |
| No validation testing | Include `npm run` commands to validate examples |
