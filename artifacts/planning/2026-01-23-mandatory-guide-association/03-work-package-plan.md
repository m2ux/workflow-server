# Work Package Plan: Mandatory Guide Association

**Date:** 2026-01-23  
**Priority:** HIGH  
**Status:** Ready  
**Estimated Effort:** 2-3h agentic + 30m review  
**Issue:** [#19](https://github.com/m2ux/workflow-server/issues/19)  
**PR:** [#20](https://github.com/m2ux/workflow-server/pull/20)

## Problem Statement

When resuming a work-package workflow, the agent failed to follow the formal process because activities don't have mandatory guide associations. The agent loaded the `workflow-execution` skill but had no indication that a specific guide should be loaded first. Each activity needs an associated guide to instruct the agent how to proceed, with both guide and skill referenced in the activity response.

## Scope

### In Scope
- Add `mandatory_guide` field to Activity interface
- Update activity loader to include guide in response
- Update 3 activity TOON files with guide references
- Create 2 new guide files (resume-here, end-here)

### Out of Scope
- Activities beyond workflow activities (start/resume/end)
- Changes to skill loading logic
- Backward compatibility concerns (only AI agents consume this)

## Proposed Approach

### Solution Design

Add `mandatory_guide` as an optional field to the Activity schema. When present, the activity response will include both the guide reference and the skill reference. The `next_action` field will point to `get_guide` when a mandatory guide exists, with the expectation that the agent will also load the skill.

```typescript
// New field in Activity interface
mandatory_guide?: {
  workflow_id: string;
  index: string;
};
```

### Activity Response Structure

The guide content is **embedded** in the activity response - no extra call needed:

```json
{
  "id": "resume-workflow",
  "problem": "Continue a previously started workflow",
  "primary_skill": "workflow-execution",
  "mandatory_guide": {
    "workflow_id": "work-package",
    "index": "resume-here",
    "content": {
      "id": "resume-here",
      "title": "Resume Workflow Guide",
      "sections": [ "... full guide content ..." ]
    }
  },
  "next_action": {
    "tool": "get_skill",
    "parameters": { "skill_id": "workflow-execution" }
  }
}
```

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Guide only (no skill) | Simpler | Breaks existing pattern | Rejected |
| Separate get_guide call | Smaller response | Extra call, agent may skip | Rejected |
| next_action points to guide | Clear order | Loses skill reference | Rejected |
| Embedded guide content | Single call, complete info | Larger response | **Selected** |

## Implementation Tasks

| # | Task | Description | Estimate |
|---|------|-------------|----------|
| 1 | Update Activity interface | Add `mandatory_guide` field with content to `Activity` type | 10m |
| 2 | Update ActivityIndex type | Add `mandatory_guide` with embedded content to activity entries | 10m |
| 3 | Update readActivityIndex() | Load guide content when mandatory_guide specified, embed in response | 30m |
| 4 | Update activity TOON files | Add mandatory_guide reference to 3 activity files | 15m |
| 5 | Create resume-here.toon | New guide for resume-workflow activity | 30m |
| 6 | Create end-here.toon | New guide for end-workflow activity | 30m |
| 7 | Update tests | Add/update tests for activity loader with embedded guides | 25m |
| 8 | Verify get_activities response | Manual verification of API response | 10m |

## Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Schema updated | `mandatory_guide` field exists | Code review |
| All activities have guides | 3/3 activities | Inspect TOON files |
| Response includes guide | `mandatory_guide` in get_activities | API call verification |
| New guides created | 2 files exist | File system check |
| Tests pass | 100% | npm test |

## Testing Strategy

### Unit Tests
- `activity-loader.test.ts`: Verify `mandatory_guide` included in activity response
- `activity-loader.test.ts`: Verify `next_action` points to guide when present
- `activity-loader.test.ts`: Verify activities without guides still work

### Integration Tests
- Verify `get_activities` MCP tool returns guide references
- Verify `get_guide` can load the referenced guides

## Dependencies & Risks

### Dependencies
- None - self-contained change

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Guide index changes break references | Medium | Low | Use name-based lookup if possible |
| TOON parsing issues | Low | Low | Validate TOON format before commit |

## Guide Content Outline

### resume-here.toon
- Purpose: Guide agent through resuming an in-progress workflow
- Key sections: State reconstruction, phase identification, resumption flow
- Source: Extract from existing work-package.toon resume references

### end-here.toon  
- Purpose: Guide agent through completing a workflow
- Key sections: Completion checklist, finalization steps, cleanup
- Source: Extract from existing complete.toon and work-package.toon
