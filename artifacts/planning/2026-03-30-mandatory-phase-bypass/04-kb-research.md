# Knowledge Base Research: Mandatory Phase Bypass Fix

**Date:** 2026-03-30  
**Issue:** [#86](https://github.com/m2ux/workflow-server/issues/86)

---

## Research Focus Areas

1. Workflow-level skills schema design
2. `get_skills` API extension (activity_id optional)
3. Meta skill updates needed (execute-activity, orchestrate-workflow)
4. Dead code surface area in skill-loader.ts

---

## 1. Workflow-Level Skills Schema

### Current State

The `WorkflowSchema` (Zod: `src/schema/workflow.schema.ts`, JSON: `schemas/workflow.schema.json`) has no `skills` field. Skills are currently declared only at the activity level via `activity.skills.primary` and `activity.skills.supporting`.

The `executionModel` field (added by ADR-0002) provides a precedent for workflow-level declarations:

```typescript
// src/schema/workflow.schema.ts:49-52
export const ExecutionModelSchema = z.object({
  roles: z.array(AgentRoleSchema).min(1),
}).strict();
```

### Design

Add an optional `skills` field to `WorkflowSchema` as a string array of skill IDs:

```typescript
// Addition to WorkflowSchema
skills: z.array(z.string()).optional()
  .describe('Workflow-level skill IDs. Returned by get_skills when called without activity_id.')
```

JSON schema addition:
```json
"skills": {
  "type": "array",
  "items": { "type": "string" },
  "description": "Workflow-level skill IDs. Returned by get_skills when called without activity_id."
}
```

The workflow TOON would declare:
```
skills[2]:
  - orchestrate-workflow
  - execute-activity
```

### Files to Change

| File | Change |
|------|--------|
| `src/schema/workflow.schema.ts` | Add `skills` field to `WorkflowSchema` |
| `schemas/workflow.schema.json` | Add `skills` property to workflow definition |
| `schemas/README.md` | Document the new field |
| `workflows/work-package/workflow.toon` | Declare `skills: [orchestrate-workflow, execute-activity]` |

### Risks

- **Schema version bump required** — adding a field to the workflow schema means all workflows need to be validated against the new version. Since `skills` is optional, existing workflows remain valid.
- **Other workflows** — the 9 other workflows in the worktree may want to declare workflow-level skills too, but that's optional and can be done later.

---

## 2. `get_skills` API Extension

### Current Implementation

`get_skills` in `src/tools/resource-tools.ts:84-139`:
- `activity_id` is **required** (Zod schema: `z.string()`)
- Loads `[activity.skills.primary, ...(activity.skills.supporting ?? [])]`
- Uses `readSkill(sid, config.workflowDir, workflow_id)` for each

### Design

Make `activity_id` optional. When omitted, load workflow-level skills:

```typescript
activity_id: z.string().optional().describe('Activity ID. When omitted, returns workflow-level skills.'),
```

When `activity_id` is provided (current behavior):
- Load activity-declared skills (primary + supporting)
- Return with `activity_id` in response

When `activity_id` is omitted (new behavior):
- Load `workflow.skills` array (the new field)
- Use `readSkill(sid, config.workflowDir, workflow_id)` for each (same resolver, falls through to universal)
- Return with `workflow_id` in response (no `activity_id`)

### Implementation Detail

```typescript
// Pseudo-code for the branching logic
let skillIds: string[];
if (activity_id) {
  const activity = getActivity(wfResult.value, activity_id);
  if (!activity) throw new Error(`Activity not found: ${activity_id}`);
  skillIds = [activity.skills.primary, ...(activity.skills.supporting ?? [])];
} else {
  skillIds = wfResult.value.skills ?? [];
  if (skillIds.length === 0) throw new Error('No workflow-level skills declared');
}
```

### Files to Change

| File | Change |
|------|--------|
| `src/tools/resource-tools.ts` | Make `activity_id` optional, add branching logic |
| MCP tool schema descriptor | Update `get_skills.json` to reflect optional activity_id |

### Risks

- **Backward compatibility:** Existing callers always pass `activity_id`, so they continue to work unchanged.
- **Token advancement:** When `activity_id` is omitted, the `advanceToken` call should set `act` to empty string (workflow-level context, no specific activity).

---

## 3. Meta Skill Updates

### orchestrate-workflow (04-orchestrate-workflow.toon)

The `dispatch-activity` protocol (lines 27-34) currently instructs the worker to call:
1. `start_session(workflow_id)`
2. `next_activity()`
3. `get_skills(workflow_id, activity_id)`

**Update needed:** Add an instruction to also call `get_skills(workflow_id)` (without activity_id) to load workflow-level skills (specifically `execute-activity`). This should happen BEFORE activity-level skill loading, because `execute-activity` defines the bootstrap protocol that governs how the activity steps are executed.

The updated dispatch instructions would be:
1. Call `get_skills(workflow_id)` — load workflow-level skills (execute-activity)
2. Call `next_activity()` — load activity definition
3. Call `get_skills(workflow_id, activity_id)` — load activity-specific skills

### execute-activity (05-execute-activity.toon)

The `bootstrap-rules` phase currently says:
```
"Call start_session(workflow_id) to load agent rules and obtain a session token."
```

**Update needed:** The bootstrap protocol should reference loading itself via `get_skills(workflow_id)`:
```
"Call get_skills(workflow_id) without activity_id to load workflow-level skills (including this execute-activity skill)."
```

This creates a self-referential pattern: the execute-activity skill tells the worker how to discover the execute-activity skill. The bootstrap chain becomes:
1. Orchestrator tells worker to call `get_skills(workflow_id)`
2. Worker receives `execute-activity` + `orchestrate-workflow`
3. Worker reads `execute-activity` protocol and follows it

### meta/rules.toon

The orchestration-execution rules (lines 186-196) should reference the formal skills:

Current (line 190):
> "The worker self-bootstraps each activity from next_activity and get_skills"

Updated:
> "The worker loads workflow-level skills via get_skills(workflow_id) — which includes execute-activity — then self-bootstraps each activity from next_activity and get_skills(workflow_id, activity_id)"

### Files to Change

| File | Change |
|------|--------|
| `workflows/meta/skills/04-orchestrate-workflow.toon` | Update dispatch-activity protocol to include `get_skills(workflow_id)` |
| `workflows/meta/skills/05-execute-activity.toon` | Update bootstrap protocol to reference workflow-level skill loading |
| `workflows/meta/rules.toon` | Update orchestration-execution rules to reference formal skills |

---

## 4. Dead Code Analysis

### Functions to Remove from skill-loader.ts

| Function/Type | Lines | Reason |
|---------------|-------|--------|
| `listUniversalSkills` | 140-160 | Only used by `listSkills` and `readSkillIndex`, both dead |
| `listWorkflowSkills` | 165-186 | Only used by `listSkills` and `readSkillIndex`, both dead |
| `listSkills` | 191-215 | Not imported by any file in `src/` |
| `SkillIndex` (type) | 217-236 | Not imported by any file in `src/` |
| `readSkillIndex` | 243-314 | Not imported by any file in `src/` |
| `SkillEntry` (interface) | 15-21 | Not imported by any file in `src/` (only used by dead functions) |

### Functions to KEEP

| Function | Lines | Reason |
|----------|-------|--------|
| `findSkillFile` | 24-38 | Used by `tryLoadSkill` |
| `getUniversalSkillDir` | 41-43 | Used by `readSkill` |
| `getWorkflowSkillDir` | 46-48 | Used by `readSkill` |
| `findWorkflowsWithSkills` | 51-72 | Used by `readSkill` (cross-workflow fallback) |
| `tryLoadSkill` | 75-92 | Used by `readSkill` |
| `readSkill` | 101-135 | **The only function used by the server** (via `resource-tools.ts`) |

### Test Changes

`tests/skill-loader.test.ts` has test suites for `listUniversalSkills`, `listSkills`, and `readSkillIndex`. These tests should be removed along with the dead code. Tests for `readSkill` should be preserved.

### Impact

- ~180 lines removed from `skill-loader.ts` (lines 140-314)
- ~100 lines removed from `skill-loader.test.ts` (estimated)
- Net reduction: ~280 lines
- No functional impact — removed code is not called by any server path

---

## Synthesis: Change Inventory

### Schema Layer (2 files)

1. `src/schema/workflow.schema.ts` — add `skills: z.array(z.string()).optional()`
2. `schemas/workflow.schema.json` — add `skills` property

### Server Layer (1 file)

3. `src/tools/resource-tools.ts` — make `activity_id` optional in `get_skills`, add workflow-level branch

### Workflow Data Layer (4 files)

4. `workflows/work-package/workflow.toon` — add `skills: [orchestrate-workflow, execute-activity]`
5. `workflows/meta/skills/04-orchestrate-workflow.toon` — update dispatch-activity protocol
6. `workflows/meta/skills/05-execute-activity.toon` — update bootstrap protocol
7. `workflows/meta/rules.toon` — reference formal skill IDs in rules

### Dead Code Cleanup (2 files)

8. `src/loaders/skill-loader.ts` — remove dead functions (~180 lines)
9. `tests/skill-loader.test.ts` — remove tests for dead functions

### Documentation (1 file)

10. `schemas/README.md` — document `skills` field

### Total: ~10 files changed
