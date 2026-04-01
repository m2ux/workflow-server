# Structural Analysis — Optimize Skill Delivery

**PR:** [#97](https://github.com/m2ux/workflow-server/pull/97)  
**Date:** 2026-04-01  
**Pass:** Single (inline)

---

## Conservation Law Analysis

### CL-1: Skill Resolution Contract
**Before:** `get_skill(skill_id)` → `readSkill(skill_id)` → skill data  
**After:** `get_skill(step_id)` → `getActivity(token.act)` → `step.skill` → `readSkill(skillId)` → skill data  
**Conserved:** The output shape (`{ skill: { ...bundled_with_resources } }`) is identical. The resource bundling pipeline (`loadSkillResources` → `bundleSkillWithResources`) is unchanged. The token advancement still records the resolved `skillId`.  
**Observation:** The change adds an indirection layer (step → skill lookup) but preserves the downstream pipeline exactly. The conservation of output shape means consuming agents see the same response format.

### CL-2: Session Token State
**Before:** `advanceToken(session_token, { wf: workflow_id, skill: skill_id })`  
**After:** `advanceToken(session_token, { wf: workflow_id, skill: skillId })`  
**Conserved:** The token's `skill` field still records the skill ID (not the step ID). Trace events and session state reflect which skill was loaded, maintaining auditability.

### CL-3: Validation Pipeline
**Before:** `buildValidation(workflowConsistency, workflowVersion, skillAssociation)`  
**After:** `buildValidation(workflowConsistency, workflowVersion)`  
**Changed:** `validateSkillAssociation` is removed because step-scoped resolution guarantees correct association by construction — the server looks up the skill from the step definition, so there's no possibility of a mismatch. This is a strengthening of the contract, not a weakening.

---

## Meta-Law: Indirection Depth

The `get_skill` handler gained one level of indirection: instead of the agent providing the skill ID directly, the server resolves it from the activity definition. This follows the "push complexity to the server" pattern — agents become simpler (pass `step_id` instead of extracting `skill_id` from activity definitions), while the server handles the lookup.

The indirection is bounded: `loadWorkflow` → `getActivity` → `steps.find` → `readSkill`. No recursive or unbounded lookups.

---

## Classified Findings

| ID | Category | Description | Risk |
|----|----------|-------------|------|
| S-01 | Indirection | New step→skill lookup adds one function call to get_skill path | Low — bounded, deterministic |
| S-02 | Dead code | `validateSkillAssociation` no longer called | None — harmless |
| S-03 | Error surface | Three new error paths (no activity, step not found, no skill) | Low — all produce descriptive messages |
| S-04 | API breaking | `skill_id` parameter removed from `get_skill` | Expected — user-requested design decision |

---

**Assessment:** The structural properties are well-conserved. The change adds bounded indirection while preserving output shape, token semantics, and resource bundling. No structural risks identified.
