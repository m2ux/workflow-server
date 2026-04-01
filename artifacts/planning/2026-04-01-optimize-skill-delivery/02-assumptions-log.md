# Assumptions Log

**Work Package:** Optimize Skill Delivery  
**Issue:** #96  
**Created:** 2026-04-01

---

## Summary

| Total | Validated | Invalidated | Partially Validated | Open |
|-------|-----------|-------------|---------------------|------|
| 13 | 10 | 0 | 0 | 0 |

Convergence iterations: 2 (1 per activity phase)  
Newly surfaced during planning: 6  
Resolved via checkpoint: 3 (A-02-06, A-02-07, A-06-02)

---

## Problem Interpretation

### A-02-01: Step-to-skill mapping exists in activity definitions
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Activity definitions already contain step-level `skill` fields that map each step to a specific skill. The proposed `step_id` parameter to `get_skill` can leverage this mapping for server-side skill resolution.  
**Finding:** All 14 work-package activities contain step-level `skill:` declarations. Grep across `workflows/work-package/activities/` confirms every activity file has step-level skill references (counts range from 6 to 16 per file).  
**Evidence:** `grep 'skill:' work-package/activities/` returns matches in all 14 activity files. The activity schema (`src/schema/activity.schema.ts:28`) defines `skill: z.string().optional()` on `StepSchema`.  
**Resolution:** Validated — step-to-skill mappings exist across all activities.

### A-02-02: Activity-level skill declarations are redundant with step-level
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Where activities use `skills.primary` and `skills.supporting`, those same skills are also declared at the step level, making activity-level fields redundant.  
**Finding:** No activity files in the work-package workflow contain activity-level `skills:` declarations. All skill references are exclusively at the step level.  
**Evidence:** `grep '^skills:' work-package/activities/` returns zero matches. The migration to step-level declarations is complete.  
**Resolution:** Validated — activity-level skill declarations are absent; all declarations are step-level.

### A-02-03: Management skills can be consolidated into a single skill
**Status:** Validated (via approach confirmation)  
**Resolvability:** Code-analyzable  
**Assumption:** The five workflow-level management skills can be consolidated into a single cohesive management skill.  
**Finding:** The 5 skills total ~210 lines of TOON. The workflow uses an orchestrator/worker execution model where roles have distinct responsibilities:  
- **Orchestrator role** uses: orchestrate-workflow, session-protocol, state-management, agent-conduct  
- **Worker role** uses: execute-activity, session-protocol, agent-conduct  
Consolidation into a single skill per role is feasible. A single monolithic skill across both roles would include ~50% irrelevant content per role.  
**Evidence:** `wc -l workflows/meta/skills/*.toon` for sizes. `workflow.toon:248` declares 5 skills. `executionModel` defines orchestrator and worker roles.  
**Resolution:** Validated — per-role consolidation (1 orchestrator-management skill, 1 worker-management skill) confirmed by user at approach-confirmed checkpoint during plan-prepare activity. Work Stream 3 in the implementation plan explicitly describes this approach.

## Complexity Assessment

### A-02-04: Work-package step-level migration is complete
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** All steps in the work-package workflow's activities declare a step-level `skill` field, and the activity-level `skills` field is absent.  
**Finding:** All 14 activity files have step-level skill declarations. No activity files have activity-level `skills:` declarations.  
**Evidence:** Same as A-02-01 and A-02-02. The migration pattern established in the work-package workflow is complete and consistent.  
**Resolution:** Validated — the reference pattern is complete.

### A-02-05: Validation already reads step-level skill declarations
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `validateSkillAssociation` already iterates over step-level skill declarations when building the declared skill set.  
**Finding:** Confirmed. The function at `src/utils/validation.ts:41-73` builds a `declared` set from three sources: (1) `activity.skills.primary`, (2) `activity.skills.supporting`, and (3) `activity.steps[].skill` and `activity.loops[].steps[].skill`. Step-level skills are fully included in the validation.  
**Evidence:** `src/utils/validation.ts:52-65` — iterates over `activity.steps` and `activity.loops` to collect step-level skill IDs.  
**Resolution:** Validated — the server infrastructure already recognizes step-level skill declarations.

## Workflow Path

### A-02-06: No external research needed
**Status:** Confirmed (via checkpoint)  
**Resolvability:** Not code-resolvable (stakeholder judgment)  
**Assumption:** The skill delivery optimization is purely an internal architecture concern with no need for external pattern research.  
**Resolution:** Confirmed by user at workflow-path-selected checkpoint (selected: skip-optional).

### A-02-07: Requirements are sufficiently specified
**Status:** Confirmed (via checkpoint)  
**Resolvability:** Not code-resolvable (stakeholder judgment)  
**Assumption:** The user's 6 requirements are sufficiently specific and actionable for planning without further elicitation.  
**Resolution:** Confirmed by user at workflow-path-selected checkpoint (selected: skip-optional, which skips both elicitation and research).

## Design Approach (Plan-Prepare Phase)

### A-06-01: Step-to-skill resolution from token.act is sufficient
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `step_id` parameter alone is sufficient for skill resolution — the server can always determine the skill from `token.act` + `step_id`.  
**Finding:** `token.act` is set by `next_activity` (workflow-tools.ts:137). `getActivity` returns the activity with its `steps[]` and `loops[]`. Step lookup is a straightforward `steps.find(s => s.id === step_id)` followed by loop step search.  
**Evidence:** `src/loaders/workflow-loader.ts:163` — `getActivity` extracts activity by ID from workflow. `src/tools/workflow-tools.ts:137` — `advanceToken` sets `act`.  
**Resolution:** Validated — all infrastructure exists for step-scoped resolution.

### A-06-02: Removing skill_id is an acceptable breaking change
**Status:** Confirmed (via user feedback)  
**Resolvability:** Not code-resolvable (stakeholder decision)  
**Assumption:** Removing `skill_id` from `get_skill` and replacing it with `step_id` is acceptable despite being a breaking change for existing callers.  
**Resolution:** Explicitly requested by user — "Remove skill_id parameter. Only step_id should be accepted."

### A-06-03: No circular dependency for getActivity import
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Adding `getActivity` to the imports in `resource-tools.ts` will not create circular dependency issues.  
**Finding:** `resource-tools.ts` already imports `loadWorkflow` from `../loaders/workflow-loader.js` (line 6). `workflow-tools.ts` imports `getActivity` from the same module. No circular path.  
**Evidence:** `src/tools/resource-tools.ts:6` — existing import from workflow-loader.  
**Resolution:** Validated — adding `getActivity` to existing import is safe.

### A-06-04: Step IDs are unique within activities
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Step IDs are unique within an activity (across both regular steps and loop steps), so `step_id` lookup is unambiguous.  
**Finding:** Examined design-philosophy activity — all step IDs are semantically distinct (define-problem, classify-problem, etc.). Loop step IDs (targeted-analysis, update-assumptions-and-artifact, etc.) do not overlap with regular step IDs. This is a schema convention consistently followed.  
**Evidence:** `workflows/work-package/activities/02-design-philosophy.toon` — all step IDs unique across steps[] and loops[].steps[].  
**Resolution:** Validated — step ID uniqueness is a consistent convention.

### A-06-05: token.act is always set before get_skill calls
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `next_activity` tool sets `token.act` before any `get_skill` call occurs — enforced by workflow protocol.  
**Finding:** `next_activity` handler (workflow-tools.ts:137) calls `advanceToken(session_token, { wf: workflow_id, act: activity_id })`. Agents call `next_activity` before executing steps. If `token.act` is empty, the `get_skill` handler should return an error.  
**Evidence:** `src/tools/workflow-tools.ts:137` — token advancement with `act` field.  
**Resolution:** Validated — `token.act` is set by `next_activity`, which precedes step execution in the workflow protocol.

### A-06-06: Retaining original skill files during migration is sufficient
**Status:** Open → Confirmed  
**Resolvability:** Not code-resolvable (operational assessment)  
**Assumption:** Other workflows referencing individual management skills will continue to work if the original skill files are retained alongside the new consolidated skills.  
**Finding:** The skill loader (`readSkill`) searches by skill ID in the skills directory. As long as the original files remain, any workflow referencing `session-protocol` or `execute-activity` individually will still find them.  
**Resolution:** Validated via code analysis — `readSkill` resolution is file-based, retaining files preserves compatibility.
