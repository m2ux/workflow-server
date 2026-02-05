# Orthogonality Analysis: Step vs Activity

**Date:** 2026-01-28

---

## Core Question

Is a Step ontologically distinct from an Activity, or could Steps be modeled as "lightweight Activities"?

---

## Current Model Comparison

### Step Schema

```typescript
StepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  skill: z.string().optional(),
  required: z.boolean().default(true),
  actions: z.array(ActionSchema).optional(),
});
```

### Activity Schema (simplified)

```typescript
ActivitySchema = z.object({
  id: z.string(),
  version: z.string(),  // Steps don't have version
  name: z.string(),
  description: z.string().optional(),
  problem: z.string().optional(),  // Steps don't have this
  recognition: z.array(z.string()).optional(),  // Steps don't have this
  skills: SkillsReferenceSchema,  // Steps have singular optional skill
  steps: z.array(StepSchema).optional(),  // Activities contain Steps
  checkpoints: z.array(CheckpointSchema).optional(),  // Steps don't have this
  decisions: z.array(DecisionSchema).optional(),  // Steps don't have this
  loops: z.array(LoopSchema).optional(),  // Steps don't have this
  transitions: z.array(TransitionSchema).optional(),  // Steps don't have this
  triggers: WorkflowTriggerSchema.optional(),  // Steps don't have this
  entryActions: z.array(ActionSchema).optional(),
  exitActions: z.array(ActionSchema).optional(),
  outcome: z.array(z.string()).optional(),
  // ... more fields
});
```

---

## Dimension Analysis

### 1. Structural Containment

| Entity | Can Contain | Is Contained By |
|--------|-------------|-----------------|
| Activity | Steps, Checkpoints, Decisions, Loops | Workflow |
| Step | Actions | Activity, Loop |

**Observation:** Activities are containers; Steps are leaf nodes (except for Actions).

### 2. Navigation

| Entity | Navigable? | Navigation Mechanism |
|--------|------------|---------------------|
| Activity | Yes | Transitions between activities |
| Step | No | Sequential execution within activity |

**Key Insight:** The fundamental difference is navigability. You can transition TO an Activity from another Activity. You cannot transition TO a Step—Steps execute sequentially within their containing Activity.

### 3. Control Flow

| Entity | Has Checkpoints | Has Decisions | Has Loops |
|--------|----------------|---------------|-----------|
| Activity | Yes | Yes | Yes |
| Step | No | No | No (but contained in Loops) |

**Observation:** Control flow elements (checkpoints, decisions, loops) exist at the Activity level, not the Step level.

### 4. Intent Matching

| Entity | Has problem | Has recognition | Matchable by User Goal |
|--------|-------------|-----------------|------------------------|
| Activity | Yes | Yes | Yes |
| Step | No | No | No |

**Key Insight:** Activities are the unit of intent matching. Users don't ask to execute a Step; they express goals that match to Activities.

### 5. External Definition

| Entity | Can Be External File | Has Version |
|--------|---------------------|-------------|
| Activity | Yes (via activitiesDir) | Yes |
| Step | No (always inline) | No |

**Observation:** Activities can be modularized into separate files; Steps are always inline within their Activity.

### 6. Skill Association

| Entity | Skill Reference | Cardinality |
|--------|-----------------|-------------|
| Activity | SkillsReference | primary + supporting[] |
| Step | string | optional single |

**Observation:** Activities have richer skill associations. Steps can optionally reference a specific skill for that task.

---

## Orthogonality Assessment

### Could Steps Be Modeled as Activities?

**Hypothetical Unified Model:**
```typescript
ExecutionUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['activity', 'step']),  // Discriminator
  // ... common fields
  // Activity-only fields conditional on type
});
```

**Problems with Unification:**

1. **Semantic Overload:** An Activity represents a coherent user-facing capability. A Step represents a single task. Unifying them conflates distinct semantic levels.

2. **Navigation Complexity:** If Steps could have transitions, the navigation model becomes much more complex. Currently, transitions are Activity-to-Activity only.

3. **Control Flow Nesting:** Allowing checkpoints/decisions within Steps would create arbitrary nesting depth. The current model has a clean two-level hierarchy.

4. **Intent Matching Confusion:** If Steps were matchable, the get_activities response would explode in size. Activities are the right granularity for user goal matching.

### Why Steps Should Remain Distinct

1. **Granularity Boundary:** Activities are the unit of work that users understand; Steps are implementation details.

2. **Stateful Tracking:** The state schema tracks `currentActivity` and `currentStep`. This two-level model is simpler than tracking arbitrary nesting.

3. **Transition Clarity:** "Transition to activity X" is clear. "Transition to step Y within activity X" adds complexity without clear benefit.

4. **Versioning:** Activities are versioned because they're reusable units. Steps don't need independent versioning.

---

## Alternative Consideration: Step as Micro-Activity

**Question:** Could a Step optionally expand into an Activity?

This is already partially supported:
- Loops can contain `activities: string[]` to iterate over full Activities
- This suggests the system already recognizes that sometimes you need Activity-level capabilities within a loop

**Potential Enhancement:**
- Add optional `expand: ActivityReference` to Step schema
- When present, Step execution delegates to the referenced Activity
- This would allow Steps to "call" Activities without full unification

**Verdict:** This could be valuable but is a different concern from the orthogonality question.

---

## Conclusion: Step vs Activity Orthogonality

**Assessment: Steps and Activities are suitably orthogonal.**

The distinction is justified by:

| Criterion | Step | Activity | Orthogonal? |
|-----------|------|----------|-------------|
| Navigation | Sequential only | Transition-based | ✓ |
| Control flow | None | Full | ✓ |
| Intent matching | Not matchable | Matchable | ✓ |
| Externalization | Always inline | Can be external | ✓ |
| Versioning | Not versioned | Versioned | ✓ |
| Semantic level | Implementation | User-facing | ✓ |

**Recommendation:** No changes needed. The Step/Activity distinction is well-founded.

---

## Other Orthogonality Considerations

### Checkpoint vs Decision

Already analyzed in field-analysis.md. These are orthogonal:
- Checkpoint: User-blocking decision point
- Decision: Automatic conditional branching

### Loop Types

The three loop types (forEach, while, doWhile) are standard control flow patterns with well-defined semantics.

### Action Types

The four action types (log, validate, set, emit) cover distinct concerns:
- `log`: Observability
- `validate`: Assertion
- `set`: State mutation
- `emit`: Event publication

---

## Recommendations

1. **No structural changes** to Step vs Activity relationship
2. **Consider documenting** the semantic distinction more clearly in schemas/README.md
3. **Potential future enhancement:** Allow Steps to reference Activities for delegation (low priority)
