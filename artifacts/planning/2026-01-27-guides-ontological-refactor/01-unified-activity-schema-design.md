# Unified Activity Schema Design

**Date:** 2026-01-27
**Status:** Draft

## Problem Statement

The current model has ontological overlap between **phases** (workflow-internal stateful nodes) and **activities** (intent-matching handlers). This creates confusion and duplication. We need a unified model where activities can serve both purposes.

## Current State

### Phase Schema (from workflow.schema.json)
```
phase:
  id, name, description
  required, estimatedTime
  guide
  entryActions[], exitActions[]
  steps[]
  checkpoints[]
  decisions[]
  loops[]
  transitions[]
```

### Activity Schema (from activity.schema.json)
```
activity:
  id, version
  problem, recognition[]
  skills (primary + supporting[])
  outcome[]
  flow[]
  context_to_preserve[]
  usage, notes
```

## Proposed Unified Activity Schema

The unified activity combines both concepts:

```yaml
activity:
  # Identity (required)
  id: string                    # Unique identifier
  version: string               # Semantic version
  name: string                  # Human-readable name
  description: string           # Detailed description
  
  # Intent Matching (optional - for top-level activities)
  problem: string               # User problem this addresses
  recognition: string[]         # Patterns to match user intent
  
  # Skills (required)
  skills:
    primary: string             # Primary skill ID
    supporting: string[]        # Supporting skill IDs
  
  # Execution
  steps: Step[]                 # Ordered execution steps (id, name, description)
  
  # Control Flow (optional - for workflow activities)
  checkpoints: Checkpoint[]     # Blocking user decision points
  decisions: Decision[]         # Conditional branching
  loops: Loop[]                 # Iteration constructs
  transitions: Transition[]     # Next activity navigation
  
  # Lifecycle (optional)
  entryActions: Action[]        # Run when entering activity
  exitActions: Action[]         # Run when exiting activity
  
  # Metadata (optional)
  outcome: string[]             # Expected results
  context_to_preserve: string[] # Context items to maintain
  required: boolean             # Whether activity is required (default: true)
  estimatedTime: string         # Time estimate (e.g., "10-20m")
  notes: string[]               # Additional notes
```

## Key Design Decisions

### 1. Skills are Required
Every activity must reference at least a primary skill. This ensures activities are "how" is defined (via skills) not "what" is embedded.

### 2. Steps Only (No Flow)
- `steps[]` - Structured Step objects with id, name, description
- The `name` + `description` provide agent guidance
- The `id` enables state tracking and completion tracking
- Eliminates redundancy of having both flow[] and steps[]

### 3. Recognition is Optional
- Top-level activities (entry points) have `recognition` patterns
- Sub-activities (called via transitions) may omit recognition

### 4. Transitions Link Activities
Instead of phases linking to phases, activities link to activities via `transitions[]`.

### 5. Workflow Becomes Activity Collection
A workflow definition becomes:
```yaml
workflow:
  id, version, title, description
  rules[], variables[]
  initialActivity: string       # First activity to execute
  activities: Activity[]        # All activities in this workflow
```

## Migration Path

### Phase → Activity Mapping

| Phase Field | Activity Field | Notes |
|-------------|----------------|-------|
| id | id | Direct mapping |
| name | name | Direct mapping |
| description | description | Direct mapping |
| required | required | Direct mapping |
| estimatedTime | estimatedTime | Direct mapping |
| guide | skills.primary | Guide becomes a skill reference |
| entryActions | entryActions | Direct mapping |
| exitActions | exitActions | Direct mapping |
| steps | steps | Direct mapping |
| checkpoints | checkpoints | Direct mapping |
| decisions | decisions | Direct mapping |
| loops | loops | Direct mapping |
| transitions | transitions | Direct mapping |
| - | problem | Add if activity is an entry point |
| - | recognition | Add if activity is an entry point |
| - | outcome | Add expected outcomes |

### Example: Phase 1 → Activity

**Before (Phase):**
```yaml
- id: phase-1-issue-verification
  name: Issue Verification & PR Creation
  description: Every work package should be linked...
  required: true
  estimatedTime: 10-20m
  guide:
    path: "https://..."
  steps:
    - id: step-1-1-check-issue
      name: Check for Existing Issue
  checkpoints:
    - id: checkpoint-1-2-issue-verification
      ...
  transitions:
    - to: phase-2-requirements-elicitation
      condition: ...
```

**After (Activity):**
```yaml
- id: issue-verification
  version: 1.0.0
  name: Issue Verification & PR Creation
  description: Every work package should be linked...
  problem: User needs to verify/create issue and PR for a work package
  recognition:
    - verify issue
    - create issue
    - start work package
  skills:
    primary: issue-management
    supporting:
      - git-workflow
      - pr-creation
  required: true
  estimatedTime: 10-20m
  steps:
    - id: step-1-check-issue
      name: Check for Existing Issue
  checkpoints:
    - id: checkpoint-issue-verification
      ...
  transitions:
    - to: requirements-elicitation
      condition: ...
  outcome:
    - Issue exists or is created
    - Feature branch created
    - Draft PR created and linked
```

## Workflow Schema Changes

### Before
```yaml
workflow:
  id, version, title, description
  rules[], variables[]
  initialPhase: string
  phases: Phase[]
```

### After
```yaml
workflow:
  id, version, title, description
  rules[], variables[]
  initialActivity: string
  activities: Activity[]
```

## Impact Analysis

### Files to Modify

| File | Change |
|------|--------|
| `schemas/activity.schema.json` | Add control flow properties |
| `schemas/workflow.schema.json` | Replace phases with activities |
| `src/loaders/activity-loader.ts` | Update to handle unified schema |
| `src/loaders/workflow-loader.ts` | Replace phase logic with activity logic |
| `src/tools/workflow-tools.ts` | Update tool implementations |
| `workflows/work-package/work-package.toon` | Migrate phases to activities |
| `workflows/meta/meta.toon` | Update if applicable |

### Backward Compatibility

We will NOT maintain backward compatibility with the phase-based model. This is a breaking change that requires migrating all workflow definitions.

## Questions to Resolve

1. ~~Should `flow[]` and `steps[]` be mutually exclusive or can they coexist?~~
   - **Resolved:** Use only `steps[]`. The name + description provide agent guidance, id enables state tracking.

2. How do we handle the current guide references?
   - **Proposal:** Convert guides to skills, reference via skills.primary

3. Should activities be defined inline in workflow or in separate files?
   - **Proposal:** Support both - inline for simple, separate files for reusable

## Next Steps

1. ✅ Design unified schema (this document)
2. Update activity.schema.json
3. Update workflow.schema.json
4. Update loaders and tools
5. Migrate work-package.toon
6. Migrate meta workflow
