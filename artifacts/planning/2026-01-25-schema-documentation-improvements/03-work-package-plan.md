# Schema Expression Improvements - Implementation Plan

**Date:** 2026-01-25  
**Priority:** MEDIUM  
**Status:** Ready  
**Estimated Effort:** 4-5h agentic + 2h review

---

## Overview

### Problem Statement

The workflow schema system has evolved organically, resulting in significant code duplication within `workflow.schema.json`. The condition type definition is duplicated 4 times (~380 lines), and several other types (action, guide, step) are duplicated multiple times. Additionally, the Schema Relationships documentation section lacks explanatory context around its diagrams.

### Scope

**In Scope:**
- Factor common definitions in `workflow.schema.json` (action, guide, step)
- Reference external `condition.schema.json` to eliminate condition duplication
- Add descriptive context to Schema Relationships diagrams in `schemas/README.md`
- Update TypeScript schema types if needed
- Validate existing workflows still pass

**Out of Scope:**
- Adding new schema features or capabilities
- Changes to workflow-server runtime behavior (beyond state format changes)

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Knowledge Base Research:** [02-kb-research.md](02-kb-research.md)
- **Implementation Analysis:** [01-implementation-analysis.md](01-implementation-analysis.md)

### Key Findings Summary

**From KB Research:**
- Use `definitions` keyword (Draft-07) for reusable subschemas
- Reference with `{ "$ref": "#/definitions/name" }` for internal definitions
- Reference with `{ "$ref": "condition.schema.json" }` for external schemas

**From Implementation Analysis:**
- **Baseline:** `workflow.schema.json` = 948 lines
- **Gap:** ~570 lines of duplicated definitions (60% of file)
- **Opportunity:** Reduce to ~400 lines through factoring

---

## Proposed Approach

### Solution Design

1. **Create internal definitions** for types used only within `workflow.schema.json`:
   - `definitions.action` - action object schema
   - `definitions.guide` - guide reference schema  
   - `definitions.step` - step object schema (includes guide and action refs)

2. **Use external reference** for condition type:
   - Replace inline condition definitions with `{ "$ref": "condition.schema.json" }`
   - Keeps condition schema as authoritative source

3. **Update documentation** with descriptive context:
   - Add introduction explaining the two diagrams
   - Add specific context before each diagram

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| External $ref for condition | DRY, single source of truth | Requires validator to load multiple files | **Selected** |
| Bundle condition into workflow.schema.json | Self-contained | Duplicates condition.schema.json | Rejected |
| Keep inline, add comments | No structural change | Still 570 lines duplicated | Rejected |

---

## Implementation Tasks

### Task 1: Add internal definitions to workflow.schema.json (30-45 min)

**Goal:** Create reusable definitions for action, guide, and step types

**Deliverables:**
- `schemas/workflow.schema.json` - Add `definitions.action`, `definitions.guide`, `definitions.step`
- Replace all inline usages with `$ref` to these definitions

**Details:**
- action: used in entryActions, exitActions, steps[].actions, loops[].steps[].actions
- guide: used in phase.guide, steps[].guide, checkpoints[].guide, decisions[].guide
- step: used in phases[].steps[], loops[].steps[]

### Task 2: Replace inline conditions with external $ref (20-30 min)

**Goal:** Eliminate condition duplication by referencing condition.schema.json

**Deliverables:**
- `schemas/workflow.schema.json` - Replace 4 inline condition definitions with `{ "$ref": "condition.schema.json" }`

**Locations:**
- decisions[].branches[].condition
- loops[].condition
- loops[].breakCondition
- transitions[].condition

### Task 3: Update TypeScript schema types (15-20 min)

**Goal:** Ensure TypeScript types align with refactored JSON schemas

**Deliverables:**
- `src/schema/workflow.schema.ts` - Review and update if needed
- `src/schema/condition.schema.ts` - Review and update if needed

### Task 4: Validate schemas and existing workflows (15-20 min)

**Goal:** Confirm refactored schemas work correctly

**Deliverables:**
- Run existing validation tests
- Validate work-package workflow against refactored schema
- Fix any issues found

### Task 5: Add documentation context to Schema Relationships (20-30 min)

**Goal:** Add explanatory text around diagrams in schemas/README.md

**Deliverables:**
- `schemas/README.md` - Add introduction to Schema Relationships section
- Add context paragraph before each diagram explaining its purpose

### Task 6: Optimize state.schema.json (45-60 min)

**Goal:** Remove all redundant prefixes and duplicate keys from state values

**Redundancies Identified:**

| Field | Current | Optimized |
|-------|---------|-----------|
| `currentPhase` | `"phase-2"` | `2` |
| `currentStep` | `"step-2-1"` | `1` (context is currentPhase) |
| `completedPhases` | `["phase-1"]` | `[1]` |
| `skippedPhases` | `["phase-3"]` | `[3]` |
| `completedSteps` | `{ "phase-1": ["step-1-1"] }` | `{ "1": [1] }` |
| `checkpointResponses` key+value | key="checkpoint-1-2", value.checkpointId="checkpoint-1-2" | key="1-2" (remove redundant checkpointId field) |
| `decisionOutcomes` key+value | key="decision-7-2", value.decisionId="decision-7-2" | key="7-2" (remove redundant decisionId field) |
| `activeLoops[].loopId` | `"loop-6-1"` | `"6-1"` |
| `history[].phase` | `"phase-1"` | `1` |
| `history[].step` | `"step-1-1"` | `1` |
| `history[].checkpoint` | `"checkpoint-1-2"` | `"1-2"` |
| `history[].decision` | `"decision-7-2"` | `"7-2"` |
| `history[].loop` | `"loop-6-1"` | `"6-1"` |
| `lastError.phase` | `"phase-1"` | `1` |
| `lastError.step` | `"step-1-1"` | `1` |

**Before (current):**
```json
{
  "currentPhase": "phase-2",
  "currentStep": "step-2-1",
  "completedPhases": ["phase-1"],
  "completedSteps": { "phase-1": ["step-1-1", "step-1-2"] },
  "checkpointResponses": {
    "checkpoint-1-2": { "checkpointId": "checkpoint-1-2", "optionId": "proceed" }
  },
  "decisionOutcomes": {
    "decision-7-2": { "decisionId": "decision-7-2", "branchId": "pass" }
  }
}
```

**After (optimized):**
```json
{
  "currentPhase": 2,
  "currentStep": 1,
  "completedPhases": [1],
  "completedSteps": { "1": [1, 2] },
  "checkpointResponses": {
    "1-2": { "optionId": "proceed" }
  },
  "decisionOutcomes": {
    "7-2": { "branchId": "pass" }
  }
}
```

**Deliverables:**
- `schemas/state.schema.json` - Update all field types to use numeric/compact references
- `schemas/state.schema.json` - Remove redundant `checkpointId` from checkpointResponses value
- `schemas/state.schema.json` - Remove redundant `decisionId` from decisionOutcomes value
- `src/schema/state.schema.ts` - Update TypeScript types

### Task 7: Update workflow-server runtime for state changes (45-60 min)

**Goal:** Update any runtime code that reads/writes state to use new format

**Deliverables:**
- Review and update files that handle workflow state
- Update any state serialization/deserialization logic
- Update code that constructs checkpoint/decision keys
- Update history event construction

### Task 8: Update workflows in workflows branch (20-30 min)

**Goal:** Ensure workflows branch definitions work with refactored schemas

**Deliverables:**
- Update `workflows/` worktree with any required changes
- Validate work-package workflow against new schemas
- Update any hardcoded phase/step references if format changes

### Task 9: Create ontology review document (15-20 min)

**Goal:** Document the schema ontology analysis as a deliverable

**Deliverables:**
- `schemas/ONTOLOGY.md` - Document field definitions and relationships

---

## Success Criteria

### Functional Requirements
- [ ] All existing workflow validations pass
- [ ] Schema validation tests pass
- [ ] No runtime behavior changes

### Size/Efficiency Targets
- [ ] **workflow.schema.json:** Reduce from 948 to <450 lines (52% reduction)
- [ ] **Duplication:** Zero duplicated type definitions in workflow.schema.json
- [ ] **Definitions:** All shared types factored into `definitions`
- [ ] **state.schema.json:** All phase/step/checkpoint/decision/loop references use numeric format
- [ ] **state.schema.json:** No redundant ID fields (checkpointId, decisionId removed from values)

### Documentation Requirements
- [ ] Schema Relationships section has introductory context
- [ ] Each diagram has explanatory text
- [ ] Ontology review document created

### Measurement Strategy
**How will we validate improvements?**
- Line count comparison: `wc -l schemas/workflow.schema.json`
- Run `npm test` to verify all tests pass
- Validate work-package.json in workflows branch against schema
- Verify state format uses numeric references

---

## Testing Strategy

### Unit Tests
- Existing schema validation tests should continue to pass
- No new unit tests required (schema structure unchanged)

### Integration Tests
- Validate work-package workflow definition
- Validate any sample workflows in repository

### Manual Verification
- Review refactored schema structure for correctness
- Verify external $ref resolves correctly

---

## Dependencies & Risks

### Requires (Blockers)
- [x] Implementation analysis complete
- [x] Research on JSON Schema best practices complete

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| External $ref not supported by validator | HIGH | LOW | Test early; fallback to bundling if needed |
| TypeScript types out of sync | MEDIUM | MEDIUM | Review TS files carefully |
| Breaking change to workflow validation | HIGH | MEDIUM | Run full test suite; update workflows branch |
| State format change breaks runtime | HIGH | MEDIUM | Careful review of state handling code |
| Workflows branch out of sync | MEDIUM | HIGH | Update workflows immediately after schema changes |

---

**Status:** Ready for implementation
