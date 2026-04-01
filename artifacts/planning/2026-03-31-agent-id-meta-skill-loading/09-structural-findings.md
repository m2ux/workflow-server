# Structural Findings — PR #93

**Date:** 2026-04-01  
**Method:** Inline single-pass (simple complexity)  
**Scope:** `src/tools/resource-tools.ts`

---

## Conservation Law

**What the system preserves:** Every `get_skills` call produces a complete, self-contained skill set for the requesting scope — skills are resolved, resources are loaded and bundled, and the response is JSON-serializable. The session token is advanced and returned.

**What is conserved across the PR:**
- **Skill resolution contract:** Skills are still resolved via `readSkill` with workflow-specific → universal fallback. No change to resolution order or error handling.
- **Token advancement:** Every `get_skills` call still advances the token via `advanceToken`. The PR adds `aid` as an optional update field but doesn't change the advancement mechanism.
- **Response shape invariant:** The response always contains `{ activity_id, scope, skills }` with optional `failed_skills`. The PR removes `resources` (flat array) and `duplicate_resource_indices` from the top level — this is a breaking change to the response shape.
- **Best-effort aggregation:** Failed skill loads are tracked in `failedSkills` rather than throwing. Failed resource loads are silently excluded. Both patterns are preserved.

---

## Meta-Law

**The structural principle governing how this subsystem evolves:**

> The skill delivery subsystem grows by adding discrimination branches to the scope selection logic while preserving the skill-resolution and resource-loading pipelines.

Evidence: The PR adds branch 2 (`isNewAgent`) between the existing two branches without modifying either pipeline — `readSkill`, `loadSkillResources`, and `readResourceStructured` are unchanged. The new `parseResourceRef` extends `loadSkillResources` through composition (wrapping the existing `readResourceStructured`) rather than modification. The `bundleSkillWithResources` replaces post-processing logic (flat array accumulation) with per-skill bundling — changing the aggregation strategy without touching the per-skill loading.

---

## Classified Bug Table

| # | Category | Description | Severity | Status |
|---|----------|-------------|----------|--------|
| SB-1 | Silent failure | Cross-workflow resource refs that fail to resolve are silently dropped — no diagnostic logging at `loadSkillResources` level | Low | Accepted (consistent with DR-1: best-effort aggregation) |
| SB-2 | Breaking change | Root-level `resources` array and `duplicate_resource_indices` removed from `get_skills` response — any consumer reading `response.resources` will break | Medium | Accepted (intentional restructuring; consumers must migrate to `skill._resources`) |
| SB-3 | Edge case | `parseResourceRef("/05")` produces `{ workflowId: "", index: "05" }` due to `slashIdx > 0` guard — leading slash is handled (returns bare index). However, `parseResourceRef("meta/")` produces `{ workflowId: "meta", index: "" }` — empty index would fail to match any resource file. | Low | Accepted (no TOON files use these formats; natural failure is safe) |

---

## Assessment

No structural defects requiring action. SB-2 is a deliberate breaking change documented in the tool description update. SB-1 and SB-3 are edge cases within the existing best-effort error handling philosophy.
