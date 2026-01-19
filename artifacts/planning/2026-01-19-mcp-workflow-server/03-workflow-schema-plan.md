# WP03: Workflow Schema Design

## Overview

Design the Zod-based schema for workflow definitions, supporting phases, steps, checkpoints, decisions, loops, and transitions.

## Status: ✅ Complete

## Deliverables

### Zod Schemas

| Schema | Purpose |
|--------|---------|
| `workflow.schema.ts` | Main workflow structure |
| `condition.schema.ts` | Condition expressions (AND/OR/NOT) |
| `state.schema.ts` | Workflow execution state |

### Key Types

- **Workflow:** Top-level container with phases
- **Phase:** Named stage with steps, checkpoints, transitions
- **Step:** Individual action with optional guide reference
- **Checkpoint:** Blocking point requiring user response
- **Decision:** Branching logic with conditions
- **Loop:** Iteration over items or while condition
- **Transition:** Navigation between phases
- **Condition:** Expression for guards and decisions

### Condition DSL

Supports shallow AND/OR logic:

```typescript
// Simple comparison
{ type: 'simple', variable: 'flag', operator: '==', value: true }

// AND condition
{ type: 'and', conditions: [...] }

// OR condition  
{ type: 'or', conditions: [...] }

// NOT condition
{ type: 'not', condition: {...} }
```

### Operators

- Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=`
- String: `contains`, `startsWith`, `endsWith`
- Existence: `exists`, `notExists`

## Implementation

### Files Created

```
src/schema/
├── workflow.schema.ts    # Workflow, Phase, Step, Checkpoint, etc.
├── condition.schema.ts   # Condition DSL
└── state.schema.ts       # Execution state

src/types/
├── workflow.ts           # Generated types
├── state.ts              # Generated types
└── index.ts              # Exports

scripts/
└── generate-schemas.ts   # JSON Schema generation

schemas/
├── workflow.schema.json  # Generated
├── state.schema.json     # Generated
└── condition.schema.json # Generated
```

## Validation

Example workflow validated successfully:
- 3 phases
- Checkpoints with options
- Conditional transitions
- Loop constructs
