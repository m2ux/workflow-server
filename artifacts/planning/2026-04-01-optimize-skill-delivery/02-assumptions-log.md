# Assumptions Log

**Work Package:** Optimize Skill Delivery  
**Issue:** #96  
**Created:** 2026-04-01

---

## Summary

| Total | Validated | Invalidated | Partially Validated | Open |
|-------|-----------|-------------|---------------------|------|
| 7 | 4 | 0 | 1 | 0 |

Convergence iterations: 1  
Newly surfaced: 0  
Resolved via checkpoint: 2 (A-02-06, A-02-07 — confirmed by workflow-path-selected checkpoint)

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
**Status:** Partially Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The five workflow-level management skills can be consolidated into a single cohesive management skill.  
**Finding:** The 5 skills total ~210 lines of TOON. However, the workflow uses an orchestrator/worker execution model where roles have distinct responsibilities:  
- **Orchestrator role** uses: orchestrate-workflow (work-package skill, loaded from `24-orchestrate-workflow.toon`), session-protocol (35 lines), state-management (18 lines), agent-conduct (27 lines)  
- **Worker role** uses: execute-activity (105 lines), session-protocol (35 lines), agent-conduct (27 lines)  
- session-protocol and agent-conduct are shared across both roles  
Consolidation into a single skill per role is feasible. A single monolithic skill across both roles would include ~50% irrelevant content for each role (e.g., orchestrator doesn't need step execution protocols; worker doesn't need transition evaluation).  
**Evidence:** `wc -l workflows/meta/skills/*.toon` for sizes. `workflow.toon:248` declares skills: session-protocol, agent-conduct, execute-activity, state-management, orchestrate-workflow. The `executionModel` defines orchestrator and worker roles.  
**Resolution:** Partially Validated — consolidation is feasible per role (1 orchestrator skill, 1 worker skill) but a single cross-role skill would include irrelevant content. The user's requirement (#6) may need interpretation: one skill per role vs. one skill total.  
**What would resolve it:** Stakeholder clarification on whether "a single skill" means one per execution role or one monolithic skill for all agents.

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
