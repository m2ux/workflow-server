# Work Package: Schema Documentation

## Overview

Augment the repository documentation by adding comprehensive README files for the JSON schemas used by the workflow server. Each schema folder will have its own local README explaining the schema structure, usage, and providing examples.

## Scope

### In Scope

- Create `schemas/README.md` documenting all JSON schemas
- Document the relationship between TypeScript schemas (Zod) and generated JSON schemas
- Provide practical examples for each schema type
- Explain validation and usage patterns

### Out of Scope

- Changes to the schemas themselves
- API documentation updates
- TypeScript source code documentation

## Deliverables

| Deliverable | Path | Description |
|-------------|------|-------------|
| Schema README | `schemas/README.md` | Comprehensive documentation for all JSON schemas |

## Schema Overview

The project has three JSON schemas generated from Zod TypeScript definitions:

1. **workflow.schema.json** - Defines the structure of workflow definitions including phases, steps, checkpoints, decisions, and loops
2. **condition.schema.json** - Defines conditional expressions used for branching logic
3. **state.schema.json** - Defines workflow execution state for tracking progress

### Generation Pipeline

```
src/schema/*.schema.ts (Zod) → scripts/generate-schemas.ts → schemas/*.schema.json
```

## Implementation Tasks

1. [x] Analyze existing schemas
2. [ ] Create schemas/README.md with:
   - Schema overview and purpose
   - Individual schema documentation
   - Property reference tables
   - Usage examples
   - Validation guidance

## Status

**Status**: In Progress
**Started**: 2026-01-22
