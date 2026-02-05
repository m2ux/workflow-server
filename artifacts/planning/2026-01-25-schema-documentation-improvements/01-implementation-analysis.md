# Implementation Analysis

**Work Package:** Schema Expression Improvements  
**Date:** 2026-01-25  
**Issue:** [#24](https://github.com/m2ux/workflow-server/issues/24)

---

## Schema Structure Overview

| Schema | Lines | Purpose |
|--------|-------|---------|
| `workflow.schema.json` | 948 | Workflow definition (phases, steps, checkpoints, decisions, loops, transitions) |
| `condition.schema.json` | 104 | Condition expressions (simple, and, or, not) |
| `state.schema.json` | 295 | Runtime execution state tracking |

---

## Redundancy Analysis

### 1. Condition Definition Duplication (HIGH Priority)

The `condition` type is defined inline **4 times** in `workflow.schema.json`:

| Location | Lines | Description |
|----------|-------|-------------|
| `decisions[].branches[].condition` | 382-476 | Decision branch conditions |
| `loops[].condition` | 529-623 | Loop continuation conditions |
| `loops[].breakCondition` | 630-724 | Loop break conditions |
| `transitions[].condition` | 821-915 | Phase transition conditions |

**Impact:** ~95 lines × 4 = ~380 lines of duplication  
**Recommendation:** Use `$ref` to reference `condition.schema.json`

### 2. Action Definition Duplication (MEDIUM Priority)

The action object schema is duplicated **4 times**:

| Location | Lines |
|----------|-------|
| `entryActions[]` | 118-144 |
| `exitActions[]` | 146-172 |
| `steps[].actions[]` | 210-236 |
| `loops[].steps[].actions[]` | 762-788 |

**Impact:** ~27 lines × 4 = ~108 lines of duplication  
**Recommendation:** Factor into `definitions.action`

### 3. Step Definition Duplication (MEDIUM Priority)

The step object schema appears **twice**:

| Location | Lines |
|----------|-------|
| Phase-level `steps[]` | 174-244 |
| Loop-level `loops[].steps[]` | 726-796 |

**Impact:** ~70 lines duplicated  
**Recommendation:** Factor into `definitions.step`

### 4. Guide Reference Duplication (LOW Priority)

The guide object schema appears **5 times**:

| Location |
|----------|
| Phase guide |
| Step guide |
| Checkpoint guide |
| Decision guide |
| Loop step guide |

**Impact:** ~17 lines × 5 = ~85 lines of duplication  
**Recommendation:** Factor into `definitions.guide`

---

## Ontological Analysis

### Field Consistency Assessment (workflow.schema.json)

| Field | Usage | Assessment |
|-------|-------|------------|
| `id` | Unique identifier across all entities | ✅ Consistent |
| `name` | Entity name (phases, steps, checkpoints, decisions, loops) | ✅ Consistent |
| `title` | Workflow-level display name | ✅ Distinct from `name` |
| `description` | Entity description | ✅ Consistent |
| `required` | Mandatory flag (variables, phases, steps, checkpoints) | ✅ Semantically consistent |

**Conclusion:** No ontologically overlapping fields found in workflow.schema.json. Field semantics are well-defined.

### Redundancy Analysis (state.schema.json)

| Issue | Location | Problem |
|-------|----------|---------|
| Redundant prefixes | `currentPhase`, `currentStep`, etc. | "phase-", "step-" prefixes add no value |
| Redundant step context | `currentStep: "step-2-1"` | Phase number redundant when `currentPhase` exists |
| Duplicate key/value | `checkpointResponses` | Key is checkpoint ID, value also contains `checkpointId` |
| Duplicate key/value | `decisionOutcomes` | Key is decision ID, value also contains `decisionId` |
| String prefixes in history | `history[].phase/step/etc` | All use redundant string prefixes |

**Conclusion:** state.schema.json has significant redundancy that can be eliminated.

---

## Documentation Gaps

### Schema Relationships Section (schemas/README.md)

**Current State:**
- Two Mermaid diagrams appear consecutively
- No introductory text explaining what each diagram shows
- Relationship between diagrams is unclear

**Diagram 1 (State Diagram):**
- Shows workflow definition structure with phases containing steps, checkpoints, etc.
- Missing: Explanation of what this represents and how to read it

**Diagram 2 (Flowchart):**
- Shows how the three schemas interconnect
- Missing: Context about runtime vs definition-time relationships

---

## Baseline Metrics

| Metric | Current Value |
|--------|---------------|
| `workflow.schema.json` lines | 948 |
| `condition.schema.json` lines | 104 |
| `state.schema.json` lines | 295 |
| Estimated duplicated lines | ~570 |
| Duplication ratio (workflow.schema.json) | ~60% |

---

## Improvement Opportunities

| Opportunity | Type | Expected Impact |
|-------------|------|-----------------|
| Factor out condition definitions | Structural | Reduce ~380 lines |
| Factor out action definitions | Structural | Reduce ~108 lines |
| Factor out step definitions | Structural | Reduce ~70 lines |
| Factor out guide definitions | Cleanup | Reduce ~85 lines |
| Add diagram context in README | Documentation | Improved accessibility |

---

## Success Criteria

- [ ] Reduce `workflow.schema.json` from 948 lines to <600 lines (37% reduction)
- [ ] Zero duplicated type definitions
- [ ] All shared types factored into `definitions`
- [ ] Schema Relationships section has explanatory context for each diagram
- [ ] Existing workflow validation still passes
