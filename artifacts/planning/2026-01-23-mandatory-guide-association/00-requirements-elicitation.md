# Requirements Elicitation: Mandatory Guide Association

**Date:** 2026-01-23  
**Issue:** [#19](https://github.com/m2ux/workflow-server/issues/19)

## Problem Statement

When resuming a work-package workflow, the agent failed to follow the formal process because activities don't have mandatory guide associations. The agent loaded the `workflow-execution` skill but had no indication which guide to load first. Activities need associated guides to instruct the agent how to proceed.

## Elicited Requirements

### Core Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | Add `mandatory_guide` field to activity schema | Must |
| R2 | Keep skill reference in activity (both guide and skill needed) | Must |
| R3 | Update activity responses to include both guide and skill references | Must |
| R4 | `start-workflow` activity → guide: `start-here` (existing) | Must |
| R5 | `resume-workflow` activity → guide: `resume-here` (new) | Must |
| R6 | `end-workflow` activity → guide: `end-here` (new) | Must |
| R7 | Migrate any existing resume/end guidance to new guides | Should |

### Stakeholders

- **Primary Consumer:** AI agents (only consumer of `get_activities`)

### Scope

#### In Scope
- Three workflow activities: `start-workflow`, `resume-workflow`, `end-workflow`
- Activity schema changes
- Two new guide files: `resume-here.toon`, `end-here.toon`
- Activity loader updates

#### Out of Scope
- Other activities beyond workflow activities
- Changes to non-workflow activities
- UI/human-facing interfaces

#### Deferred
- Mandatory guides for future activity types

## Success Criteria

1. Activity schema includes `mandatory_guide` field
2. All three workflow activities have guides associated
3. `get_activities` response includes both guide and skill references
4. Two new guides created: `resume-here.toon`, `end-here.toon`
5. Agent loads both guide and skill when resolving an activity

## Design Constraints

- Guides indicate the start-point in the workflow for each activity
- Skills provide execution capability
- Both are required - guide loaded first, then skill
- Only AI agents consume this data (no backward compatibility concerns)
