# Work Package Plan: Mandatory Phase Bypass Fix

**Issue:** [#86](https://github.com/m2ux/workflow-server/issues/86)  
**PR:** [#87](https://github.com/m2ux/workflow-server/pull/87)  
**Created:** 2026-03-30

---

## Approach

Add a `skills` field to the workflow schema so workflows can declare skills that apply across all activities. Extend the `get_skills` MCP tool to accept `workflow_id` without `activity_id` — when omitted, return the workflow-level skills. This makes the `execute-activity` and `orchestrate-workflow` universal skills discoverable through the standard API. Clean up dead code in skill-loader.ts that accumulated around the old universal skill discovery mechanism.

**Design principle:** Workflow-level skills use the same schema and have the same flexibility as activity-level skills. The only difference is scope.

---

## Tasks

### T1: Add `skills` field to workflow schema

**Files:**
- `src/schema/workflow.schema.ts` — add `skills: z.array(z.string()).optional()`
- `schemas/workflow.schema.json` — add `skills` to `properties` object

**Details:**
- Place after `executionModel`, before `initialActivity` in both files
- Optional field — no migration needed for existing workflows
- Per `additionalProperties: false` in JSON Schema, property must be declared in `properties`

**Acceptance:** `npm run typecheck` passes. Existing workflows load without error.

**Estimate:** 15m  
**Dependencies:** None

---

### T2: Extend `get_skills` for optional `activity_id`

**Files:**
- `src/tools/resource-tools.ts` — modify `get_skills` handler

**Details:**
- Change `activity_id` param from `z.string()` to `z.string().optional()`
- Update tool description to document the new behavior
- Add branching logic:
  ```
  if (activity_id) → load activity.skills (existing behavior)
  else → load workflow.skills; throw if empty
  ```
- Token advancement: use `act: activity_id ?? ''`
- Response body: include `workflow_id` instead of `activity_id` when activity_id is omitted

**Acceptance:** Tool works with and without `activity_id`. Existing callers unaffected.

**Estimate:** 30m  
**Dependencies:** T1

---

### T3: Declare workflow-level skills in work-package workflow

**Files:**
- `workflows/work-package/workflow.toon` — add `skills` block

**Details:**
- Add after `executionModel` (line 257), before `initialActivity` (line 258):
  ```
  skills[2]:
    - orchestrate-workflow
    - execute-activity
  ```
- Both skills resolve via `readSkill()` universal fallback to `meta/skills/`

**Acceptance:** `get_skills(workflow_id='work-package')` returns both skills with resources.

**Estimate:** 10m  
**Dependencies:** T1 (schema must accept the field)

---

### T4: Update meta skill protocols

**Files:**
- `workflows/meta/skills/04-orchestrate-workflow.toon` — update `dispatch-activity` protocol
- `workflows/meta/skills/05-execute-activity.toon` — update `bootstrap-rules` protocol

**Details:**

*orchestrate-workflow:*
- Update `dispatch-activity` bullet 3 (L30) to include `get_skills(workflow_id)` as the first bootstrap instruction for the worker
- The updated instruction sequence: load workflow-level skills → load activity definition → load activity-specific skills → follow execute-activity protocol

*execute-activity:*
- Update `bootstrap-rules` (L16-17) to add a step for loading workflow-level skills via `get_skills(workflow_id)` as the mechanism for discovering this skill itself

**Acceptance:** Both files parse without validation errors.

**Estimate:** 20m  
**Dependencies:** T2 (API must support workflow-level loading)

---

### T5: Update meta rules

**Files:**
- `workflows/meta/rules.toon` — update orchestration-execution rules

**Details:**
- Update rule 3 (L190) to reference workflow-level skill loading:
  - From: "The worker self-bootstraps each activity from next_activity and get_skills..."
  - To: "The worker loads workflow-level skills via get_skills(workflow_id) — which returns execute-activity — then self-bootstraps each activity from next_activity and get_skills(workflow_id, activity_id)..."
- Add reference to `execute-activity` skill by name

**Acceptance:** Rules file parses without validation errors.

**Estimate:** 10m  
**Dependencies:** T4

---

### T6: Remove dead code from skill-loader

**Files:**
- `src/loaders/skill-loader.ts` — remove ~180 lines
- `tests/skill-loader.test.ts` — remove ~50 lines

**Details:**

*Remove from skill-loader.ts:*
- `SkillEntry` interface (L15-21)
- `listUniversalSkills()` (L140-160)
- `listWorkflowSkills()` (L165-186)
- `listSkills()` (L191-215)
- `SkillIndex` type (L217-236)
- `readSkillIndex()` (L243-314)

*Keep:*
- `findSkillFile()`, `getUniversalSkillDir()`, `getWorkflowSkillDir()`, `findWorkflowsWithSkills()`, `tryLoadSkill()`, `readSkill()` — all used by the server

*Remove from tests:*
- `listUniversalSkills` test suite (2 tests, L10-29)
- `listSkills` test suite (1 test, L32-41)
- `readSkillIndex` test suite (4 tests, L176-231)

*Keep:*
- `readSkill` suite (7 tests, L43-130)
- `malformed TOON handling` suite (4 tests, L132-174)

**Acceptance:** `npm run typecheck` and `npm test` pass. No imports reference removed functions.

**Estimate:** 20m  
**Dependencies:** None (independent)

---

### T7: Update schemas/README.md

**Files:**
- `schemas/README.md` — document `skills` field

**Details:**
- Add `skills` to the Workflow Schema field table
- Document `get_skills` workflow-level behavior in the API section (if present)

**Acceptance:** Documentation matches implementation.

**Estimate:** 15m  
**Dependencies:** T1

---

### T8: Add tests for workflow-level `get_skills`

**Files:**
- `tests/mcp-server.test.ts` or new test file

**Details:**

Test cases:
1. `get_skills` with `activity_id` — existing behavior preserved (regression)
2. `get_skills` without `activity_id` — returns workflow-level skills
3. `get_skills` without `activity_id`, no skills declared — returns appropriate error
4. `get_skills` without `activity_id` — skills resolve via universal fallback
5. Schema validation — workflow with `skills` field passes validation
6. Schema validation — workflow without `skills` field passes validation (optional)

**Acceptance:** All tests pass. Coverage for both branches of the `get_skills` handler.

**Estimate:** 30m  
**Dependencies:** T2

---

## Execution Order

```
Phase 1 (cleanup):     T6
Phase 2 (foundation):  T1 → T2 → T8
Phase 3 (adoption):    T3, T7 (parallel)
Phase 4 (protocols):   T4 → T5
```

Total estimated time: 2.5h agentic + 30m human review

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking existing `get_skills` callers | Low | High | `activity_id` remains valid; only optionality changes |
| Other workflows lack `skills` field | None | None | Field is optional — no migration needed |
| Dead code removal breaks unexpected consumer | Very Low | Medium | Import analysis confirms no external consumers |
| Meta skill TOON changes fail validation | Low | Low | `npm test` after each change |

---

## Out of Scope

- `executionModel` deprecation/removal — follow-up issue
- Server-side enforcement of phase execution (#65)
- Checkpoint enforcement reliability (#51)
- Changes to existing domain skills
- Runtime validation of semantic trace completeness
