# Work Package: Workflow System Ontology Optimization

**Date:** 2026-01-28  
**Status:** In Progress  
**Type:** Architectural Analysis

---

## Problem Statement

The workflow-server system has evolved organically, and the structural ontology (the set of entities, their fields, and relationships) may contain:
1. Non-orthogonal concepts that could be unified
2. Superfluous, redundant, or overlapping fields
3. Guidance content in resources that could be subsumed into the schema as skills

This work package aims to verify the optimality of the ontology and propose improvements where warranted.

---

## Key Questions

### 1. Element Orthogonality

**Core Question:** Is the ontology fully rationalized such that all elements are suitably orthogonal?

**Specific Concerns:**
- **Step vs Activity Instance:** Is a Step conceptually distinct from an Activity, or could Steps simply be "inline" Activities? What justifies their separation?
- **Checkpoint vs Decision:** Both represent branching logic—Checkpoints require user input, Decisions are automated. Is this distinction ontologically sound, or could they be unified with a `blocking` flag?
- **Loop with Steps vs Loop with Activities:** Loops can contain either `steps` or `activities` arrays. Is this dual capability justified or a design smell?

### 2. Field Redundancy

**Core Question:** Do elements have superfluous, redundant, or overlapping fields?

**Observed Patterns:**
- `name` vs `title`: Workflows use `title`, other entities use `name`
- `description` appears at multiple levels (workflow, activity, step)
- `problem` vs `description` in Activity—both describe what the activity does
- `recognition` patterns vs `problem` statement—overlapping intent-matching purposes
- `outcome` vs `exitActions`—both describe what happens when an activity completes

### 3. Resource Subsumption

**Core Question:** Is there scope to rationally subsume information from existing resources into activity/skill/workflow elements?

**Candidates for Subsumption:**
- `03-github-issue-creation.md` → Could become a `github-issue-creation` skill
- `04-jira-issue-creation.md` → Could become a `jira-issue-creation` skill
- Other resources that define structured processes rather than reference material

---

## Current Ontology Summary

### Core Entities

| Entity | Purpose | Contains |
|--------|---------|----------|
| **Workflow** | Top-level container | Activities, Variables, Rules |
| **Activity** | Unified execution unit | Steps, Checkpoints, Decisions, Loops, Transitions, Triggers |
| **Step** | Individual task | Actions |
| **Skill** | Agent capability description | Execution patterns, Tool definitions, Error handling |
| **Checkpoint** | User decision point | Options with Effects |
| **Decision** | Automated branch point | Branches with Conditions |
| **Loop** | Iteration construct | Steps or Activities |
| **Transition** | Activity navigation | Conditions |

### Entity Relationships

```
Workflow 1──* Activity
Workflow 1──* Variable
Activity 1──* Step
Activity 1──* Checkpoint
Activity 1──* Decision  
Activity 1──* Loop
Activity 1──* Transition
Activity *──1 Skill (primary)
Activity *──* Skill (supporting)
Step *──1 Skill (optional)
```

---

## Analysis Framework

### Orthogonality Test
For each pair of entities, ask:
1. Can they exist independently?
2. Do they serve distinct purposes?
3. Is there a case where one could substitute for the other?

### Redundancy Test
For each field, ask:
1. Is this information derivable from other fields?
2. Is this field used consistently across the codebase?
3. Could this field be merged with another without loss of expressiveness?

### Subsumption Test
For each resource, ask:
1. Does this define a repeatable process or just provide reference material?
2. Would structuring this as a Skill enable better agent execution?
3. What would be lost by converting from prose to structured skill?

---

## Preliminary Observations

### Step vs Activity
- **Steps** are always inline, sequential, within an Activity
- **Activities** can be external files, have transitions, checkpoints
- **Key difference:** Activities are navigable (via transitions), Steps are not
- **Consideration:** Steps might be "micro-activities" but the navigation distinction seems fundamental

### Resources vs Skills
The GitHub and Jira issue creation guides currently exist as:
1. Resources (`resources/03-github-issue-creation.md`, `resources/04-jira-issue-creation.md`)
2. Guides in agent-resources (`workflows/work-package/github-issue-creation.guide.md`)

These contain:
- Structured processes (MCP tool sequences)
- Decision trees (issue type selection)
- Templates and anti-patterns

This content seems well-suited to the Skill schema which has:
- `execution_pattern` for tool sequences
- `tools` for detailed tool guidance
- `errors` for recovery strategies
- `flow` for ordered steps

---

## Next Steps

1. **Detailed Field Analysis:** Create a comprehensive field mapping across all entities
2. **Usage Analysis:** Examine how each field is actually used in existing workflows
3. **Subsumption Prototype:** Draft skill definitions for issue-creation guides
4. **Orthogonality Proposals:** Document specific recommendations for entity rationalization

---

## References

- Schema README: `/home/mike/projects/dev/workflow-server/schemas/README.md`
- Activity Schema: `/home/mike/projects/dev/workflow-server/src/schema/activity.schema.ts`
- Skill Schema: `/home/mike/projects/dev/workflow-server/src/schema/skill.schema.ts`
- Workflow Schema: `/home/mike/projects/dev/workflow-server/src/schema/workflow.schema.ts`
