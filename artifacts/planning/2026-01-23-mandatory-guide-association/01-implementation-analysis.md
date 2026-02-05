# Implementation Analysis: Mandatory Guide Association

**Date:** 2026-01-23  
**Issue:** [#19](https://github.com/m2ux/workflow-server/issues/19)

## Current Implementation

### Activity Schema (`src/loaders/activity-loader.ts`)

```typescript
interface Activity {
  id: string;
  version: string;
  problem: string;
  recognition: string[];
  skills: {
    primary: string;
    supporting: string[];
  };
  outcome: string[];
  flow: string[];
  context_to_preserve: string[];
}
```

**Gap:** No `mandatory_guide` field exists.

### Activity Response Structure

The `ActivityWithGuidance` interface adds `next_action` pointing only to the skill:

```typescript
interface ActivityWithGuidance extends Activity {
  next_action: {
    tool: string;  // Always 'get_skill'
    parameters: Record<string, string>;  // { skill_id: ... }
  };
}
```

**Gap:** No guide reference in `next_action` or elsewhere.

### Activity Index Response (`get_activities`)

```typescript
interface ActivityIndex {
  activities: Array<{
    id: string;
    problem: string;
    primary_skill: string;
    next_action: {
      tool: string;
      parameters: Record<string, string>;
    };
  }>;
  quick_match: Record<string, string>;
}
```

**Gap:** No guide reference in activity entries.

### Activity Files

Located in `workflows/meta/intents/`:

| File | ID | Primary Skill |
|------|-----|---------------|
| `01-start-workflow.toon` | start-workflow | workflow-execution |
| `02-resume-workflow.toon` | resume-workflow | workflow-execution |
| `03-end-workflow.toon` | end-workflow | workflow-execution |

**Gap:** No `mandatory_guide` field in activity TOON files.

### Guide Files

Located in `workflows/work-package/guides/`:

| Index | Name | Purpose |
|-------|------|---------|
| 00 | start-here | START-HERE.md creation guide |
| 16 | complete | COMPLETE.md creation guide |

**Gap:** No `resume-here.toon` or `end-here.toon` guides exist.

## Data Flow Analysis

```
get_activities → ActivityIndex
  └── activities[] → { id, problem, primary_skill, next_action }
       └── next_action → { tool: 'get_skill', parameters: { skill_id } }
```

Currently, the agent receives only the skill reference. The agent is expected to discover and load guides independently, but there's no indication that a specific guide is required before proceeding.

## Changes Required

### 1. Activity Schema Update

Add `mandatory_guide` field to `Activity` interface:

```typescript
interface Activity {
  // ... existing fields
  mandatory_guide?: {
    workflow_id: string;
    index: string;
  };
}
```

### 2. Activity Response Update

Update `ActivityIndex` to include both guide and skill:

```typescript
activities: Array<{
  id: string;
  problem: string;
  primary_skill: string;
  mandatory_guide?: {  // NEW
    workflow_id: string;
    index: string;
  };
  next_action: {
    tool: string;  // 'get_guide' if guide exists, else 'get_skill'
    parameters: Record<string, string>;
  };
}>;
```

### 3. Activity Loader Update

Modify `readActivityIndex()` to:
- Include `mandatory_guide` in activity entries
- Update `next_action` to point to guide when present

### 4. Activity File Updates

Add `mandatory_guide` to each activity TOON file:

| Activity | Guide | Workflow |
|----------|-------|----------|
| start-workflow | start-here (00) | work-package |
| resume-workflow | resume-here (XX) | work-package |
| end-workflow | end-here (XX) | work-package |

### 5. New Guide Files

Create in `workflows/work-package/guides/`:
- `XX-resume-here.toon` - Resume workflow guidance
- `XX-end-here.toon` - End workflow guidance

## Files to Modify

| File | Change |
|------|--------|
| `src/loaders/activity-loader.ts` | Add `mandatory_guide` to Activity interface, update ActivityIndex |
| `workflows/meta/intents/01-start-workflow.toon` | Add `mandatory_guide` field |
| `workflows/meta/intents/02-resume-workflow.toon` | Add `mandatory_guide` field |
| `workflows/meta/intents/03-end-workflow.toon` | Add `mandatory_guide` field |

## Files to Create

| File | Purpose |
|------|---------|
| `workflows/work-package/guides/XX-resume-here.toon` | Resume workflow guide |
| `workflows/work-package/guides/XX-end-here.toon` | End workflow guide |

## Testing Strategy

1. Unit tests for `activity-loader.ts` changes
2. Verify `get_activities` response includes guide references
3. Verify activities with guides return `next_action` pointing to guide
4. Integration test: agent workflow respects mandatory guide

## Success Criteria Validation

| Criterion | Measurement |
|-----------|-------------|
| Activity schema includes `mandatory_guide` | TypeScript interface updated |
| All activities have guides | 3/3 activities have mandatory_guide set |
| `get_activities` includes guide refs | Response includes `mandatory_guide` field |
| New guides created | 2 new .toon files in guides/ |
| Agent loads guide + skill | Manual verification |
