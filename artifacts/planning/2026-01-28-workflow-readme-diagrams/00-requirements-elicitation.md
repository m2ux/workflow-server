# Requirements Elicitation: Workflow README Diagrams

**Issue:** #29 - Add README.md with Mermaid flow diagrams for each workflow  
**PR:** #30  
**Date:** 2026-01-28

---

## Problem Statement

The workflows folder contains three workflows (`meta`, `work-package`, `work-packages`) with activities and skills defined in `.toon` files. While these definitions are machine-readable and schema-validated, there is no human-friendly visual documentation that shows the workflow structure at a glance.

---

## Requirements

### R1: Diagram Detail Level
**Requirement:** Diagrams must show **detailed** content including:
- All activity steps
- Checkpoints with options
- Decision branches with conditions
- Skills (primary and supporting)
- Loops with iteration indicators

### R2: Diagram Structure
**Requirement:** Use **layered** organization:
- **Main flow diagram:** Shows activity sequence and transitions
- **Activity detail diagrams:** Sub-diagrams for each activity showing steps, checkpoints, decisions

### R3: Mermaid Diagram Type
**Requirement:** Use **Flowchart** syntax (`graph TD` or `graph LR`)
- Best suited for activity sequences
- Well-supported on GitHub

### R4: Visual Elements
**Requirement:** Include all visual elements:
- Checkpoints as decision diamonds (`{checkpoint}`)
- Skills as annotations or linked nodes
- Loops with iteration indicators
- Transition conditions as edge labels

### R5: Coverage
**Requirement:** Create README.md for each workflow:
- `meta/README.md`
- `work-package/README.md`
- `work-packages/README.md`

---

## Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| New users | Learn workflow system structure |
| Workflow designers | Understand and modify workflows |
| Developers | Implement workflow features |

---

## Scope

### In Scope
- README.md for each of 3 workflows (meta, work-package, work-packages)
- Layered structure: Main workflow flow + detailed activity sub-diagrams
- Mermaid flowchart diagrams (graph TD/LR)
- Visual elements: checkpoints as diamonds, skills as annotations, loops with indicators, condition labels
- Schema-accurate representation

### Out of Scope
- Auto-generation tooling
- Interactive diagrams
- Modifications to workflow definitions
- Skills-only standalone diagrams (skills shown within activity context)

---

## Success Criteria

| Criterion | Measure |
|-----------|---------|
| **Accuracy** | Diagrams match schema definitions exactly |
| **Completeness** | All activities, checkpoints, decisions, and transitions represented |
| **Rendering** | Mermaid renders correctly on GitHub |
| **Layered structure** | Each workflow has main diagram + activity detail diagrams |
| **Visual clarity** | Checkpoints as diamonds, conditions labeled, skills annotated |

---

## Schema Reference

Diagrams must accurately represent these schema-defined elements:

### Workflow Schema
- `id`, `title`, `description`
- `initialActivity` - starting point
- `rules` - governing constraints

### Activity Schema
- `id`, `name`, `description`
- `steps[]` - ordered execution steps
- `checkpoints[]` - blocking user decision points
- `decisions[]` - conditional branching points
- `loops[]` - iteration constructs
- `transitions[]` - navigation to other activities
- `skills.primary`, `skills.supporting[]`

### Skill Schema
- `id`, `capability`
- `flow[]` - ordered execution steps
- `tools{}` - tool definitions

---

## Diagram Conventions

### Node Shapes
```
[Activity]          Rectangle - activity node
{Checkpoint}        Diamond - checkpoint/decision
((Skill))           Circle - skill reference
[[Loop]]            Stadium - loop construct
```

### Edge Labels
```
-->|condition| Next
-->|default| Fallback
```

### Subgraph Structure
```mermaid
subgraph Activity Name
  step1 --> step2
  step2 --> checkpoint{Decision?}
end
```

---

## Deliverables

1. `workflows/meta/README.md` - Meta workflow documentation
2. `workflows/work-package/README.md` - Work package workflow documentation
3. `workflows/work-packages/README.md` - Work packages workflow documentation

Each README contains:
- Workflow overview (from workflow.toon)
- Main activity flow diagram
- Detailed activity diagrams (one per activity)
- Skills summary table
