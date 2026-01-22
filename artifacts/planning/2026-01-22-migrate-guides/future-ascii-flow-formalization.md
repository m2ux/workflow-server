# Future Work Package: Formalize ASCII Flow Diagrams

**Status:** Deferred
**Predecessor:** WP-006 (Migrate Guides)
**Priority:** Medium

---

## Problem Statement

Workflow guides contain ASCII-formatted flow diagrams that visually represent processes, decision trees, and state transitions. These are informative for humans but not parseable or executable by agents.

**Current State:**
- ASCII diagrams embedded in guide prose
- Agents must visually parse to understand flow logic
- No validation of flow structure
- Cannot programmatically traverse or execute

**Desired State:**
- Flow diagrams converted to structured TOON elements
- Validated by Zod schemas
- Agents can programmatically access flow steps
- Consistent with workflow phase/step patterns

---

## Scope

### Guides with ASCII Flows

| Guide | Diagram Type | Description |
|-------|--------------|-------------|
| requirements-elicitation | Box loop | Question iteration with checkpoint |
| implementation-analysis | Arrow sequence | Phase transitions (4 steps) |
| plan | Arrow sequence | Planning phase transitions |
| architecture-review | Status lifecycle | RFC → Accepted → Deprecated/Superseded |
| workflow-retrospective | Box decision | Message counting and categorization |
| strategic-review | Tree hierarchy | Nested audit steps |

### Deliverables

1. **Flow Schema** (`flow.schema.ts`)
   - Zod schema for flow elements
   - Support: sequence, forEach, while, conditional, decision
   - Steps with actions, conditions, transitions

2. **Guide Schema Extension**
   - Add optional `flows[]` array to guide schema
   - Flows reference steps, checkpoints, transitions

3. **Flow Conversion**
   - Convert each ASCII diagram to structured TOON
   - Validate against schema
   - Preserve original as comment/documentation

4. **Tests**
   - Schema validation tests
   - Flow parsing tests

---

## Proposed Schema

```typescript
// flow.schema.ts
import { z } from 'zod';

const BranchSchema = z.object({
  condition: z.string(),
  next: z.string(),
});

const FlowStepSchema = z.object({
  id: z.string(),
  action: z.string(),
  description: z.string().optional(),
  next: z.string().optional(),
  decision: z.object({
    branches: z.array(BranchSchema),
    default: z.string().optional(),
  }).optional(),
});

const FlowSchema = z.object({
  id: z.string(),
  type: z.enum(['sequence', 'forEach', 'while', 'conditional', 'stateMachine']),
  description: z.string().optional(),
  // Loop configuration
  over: z.string().optional(),
  condition: z.string().optional(),
  // Steps
  steps: z.array(FlowStepSchema),
  // Completion
  onComplete: z.object({
    checkpoint: z.string().optional(),
    next: z.string().optional(),
    action: z.string().optional(),
  }).optional(),
});

export const GuideFlowsSchema = z.array(FlowSchema);
```

---

## Example Conversion

### Before (ASCII)

```
┌─────────────────────────────────────┐
│ For each question category:         │
│                                     │
│   1. Ask ONE question               │
│   2. Wait for response              │
│   3. User answers OR says "skip"    │
│   4. Record answer (if given)       │
│   5. Move to next question          │
│                                     │
│ After all categories:               │
│   🛑 CHECKPOINT: Requirements       │
└─────────────────────────────────────┘
```

### After (TOON)

```toon
flows[1]:
  - id: elicitation-loop
    type: forEach
    description: For each question category
    over: questionCategories
    steps[5]:
      - id: ask
        action: Ask ONE question
        next: wait
      - id: wait
        action: Wait for response
        next: respond
      - id: respond
        action: User answers OR says "skip"
        decision:
          branches[2]:
            - condition: answered
              next: record
            - condition: skipped
              next: next-question
      - id: record
        action: Record answer (if given)
        next: next-question
      - id: next-question
        action: Move to next question
    onComplete:
      checkpoint: requirements-confirmation
```

---

## Implementation Tasks

| # | Task | Estimate |
|---|------|----------|
| 1 | Define `flow.schema.ts` with Zod | 1h |
| 2 | Extend guide schema with optional `flows[]` | 30m |
| 3 | Convert requirements-elicitation flow | 1h |
| 4 | Convert implementation-analysis flow | 30m |
| 5 | Convert plan flow | 30m |
| 6 | Convert architecture-review lifecycle | 1h |
| 7 | Convert workflow-retrospective flow | 1h |
| 8 | Convert strategic-review hierarchy | 1h |
| 9 | Add schema validation tests | 1h |
| 10 | Update guide loader to parse flows | 1h |

**Total Estimate:** ~8-10h

---

## Success Criteria

- [ ] `flow.schema.ts` defined and tested
- [ ] All 6 ASCII diagrams converted to structured TOON
- [ ] Flows validate against Zod schema
- [ ] Guide loader parses flows correctly
- [ ] Original ASCII preserved as documentation comments
- [ ] Agents can programmatically access flow steps

---

## Dependencies

- WP-006 must be complete (guides migrated to TOON format)
- Guide loader infrastructure in place
- Guide schema established

---

## References

- WP-006: Migrate Guides to Local Workflows Branch
- TOON Specification v2.0
- Existing workflow phase/step schema patterns
