# Work Package Plan: Workflow README Diagrams

**Issue:** #29  
**PR:** #30  
**Date:** 2026-01-28

---

## Objective

Add README.md files with Mermaid flow diagrams to each workflow folder, providing human-readable visual documentation of workflow structure.

---

## Implementation Tasks

### Task 1: Create meta/README.md

**Scope:**
- Workflow overview from `workflow.toon`
- Main diagram showing 3 independent activities (no sequential flow)
- Activity detail diagrams for:
  - start-workflow (9 steps)
  - resume-workflow (9 steps)
  - end-workflow (6 steps)
- Skills summary table (3 skills)

**Diagram approach:**
- Main: Show 3 activities as independent entry points
- Details: Each activity with steps and skill references

**Estimated effort:** 30 minutes

---

### Task 2: Create work-package/README.md

**Scope:**
- Workflow overview from `workflow.toon`
- Main flow diagram showing 11 activities with transitions
- Handle complex branching:
  - issue-verification → requirements-elicitation OR implementation-analysis
  - implementation-analysis → research OR plan-prepare
  - validate → strategic-review OR implement OR plan-prepare (feedback loops)
  - strategic-review → finalize OR plan-prepare
  - post-implementation → plan-prepare (if significant changes)
- Activity detail diagrams for all 11 activities
- Skills summary table (3 workflow-specific skills)

**Diagram approach:**
- Main: Simplified flow with key decision points, under 50 connections
- Details: Each activity with steps, checkpoints, and skills

**Estimated effort:** 90 minutes (most complex workflow)

---

### Task 3: Create work-packages/README.md

**Scope:**
- Workflow overview from `workflow.toon`
- Main flow diagram showing 7 sequential activities
- Show workflow trigger to work-package
- Activity detail diagrams for:
  - scope-assessment
  - folder-setup
  - analysis
  - package-planning (with loop)
  - prioritization
  - finalize-roadmap
  - implementation (with loop and trigger)
- Skills reference (uses workflow-execution from meta)

**Diagram approach:**
- Main: Sequential flow with loops indicated
- Details: Each activity with steps, checkpoints, loops

**Estimated effort:** 45 minutes

---

## Task Order

| # | Task | Dependencies | Effort |
|---|------|--------------|--------|
| 1 | meta/README.md | None | 30m |
| 2 | work-packages/README.md | None | 45m |
| 3 | work-package/README.md | None | 90m |

**Total estimated effort:** ~3 hours

**Rationale:** Start with simpler workflows (meta, work-packages) to establish patterns, then tackle the complex work-package workflow.

---

## README Template

```markdown
# {Workflow Title}

> {Description}

## Overview

{Brief description of workflow purpose and structure}

## Workflow Flow

{Main Mermaid diagram}

## Activities

### 1. {Activity Name}

**Purpose:** {Description}
**Primary Skill:** `{skill-id}`

{Activity detail diagram}

| Step | Description |
|------|-------------|
| ... | ... |

**Checkpoints:**
- {checkpoint name}: {options}

**Transitions:**
- → {next activity} (condition)

---

## Skills Summary

| Skill | Capability | Used By |
|-------|------------|---------|
| ... | ... | ... |
```

---

## Acceptance Criteria

- [ ] Each workflow folder has README.md
- [ ] All diagrams render correctly on GitHub
- [ ] Main flow shows all activities and transitions
- [ ] Activity details show steps, checkpoints, decisions
- [ ] Skills are referenced correctly
- [ ] Diagrams stay under 50 connections (well under 100 limit)
- [ ] Consistent node shapes per element type
