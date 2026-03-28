# Assumptions Log — WP-01 Schema Alignment

**Created:** 2026-03-28  
**Activity:** Design Philosophy  
**Status:** Reconciled

---

## Summary

Total: 4 | Validated: 4 | Open: 0  
Convergence iterations: 1 | Newly surfaced: 0

---

## Assumptions

### A-01: F-02 triggers change is Zod-side only

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** The `triggers` type mismatch should be fixed by changing Zod to match JSON Schema (array), not the other way around.  
**Rationale:** JSON Schema defines `triggers` as `array` of `workflowTrigger` items (activity.schema.json:444-449). The Zod schema uses `WorkflowTriggerSchema.optional()` (single object). The JSON Schema is the more permissive and correct representation — an activity may trigger multiple workflows.  
**Evidence:** Confirmed in `schemas/activity.schema.json:444-449` — `"type": "array", "items": { "$ref": "#/definitions/workflowTrigger" }`. Zod at `src/schema/activity.schema.ts:160` uses `WorkflowTriggerSchema.optional()` (single). Array semantics are the correct design.  
**Risk if wrong:** Low — array is strictly more capable than single object.

### A-02: stateVersion maximum removal has no downstream consumers

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Complexity Assessment  
**Assumption:** No runtime code depends on the JSON Schema `maximum: 1000` constraint for `stateVersion`. Removing it is safe.  
**Rationale:** JSON Schema files are authoring/IDE artifacts, not runtime validators. The Zod schema has no maximum. The `addHistoryEvent` function increments `stateVersion` per event (state.schema.ts:152), so long workflows will exceed 1000.  
**Evidence:** Confirmed in `src/schema/state.schema.ts:152` — `stateVersion: state.stateVersion + 1` in `addHistoryEvent`. No code enforces the maximum at runtime. The Zod schema (line 87) defines `z.number().int().positive()` with no upper bound.  
**Risk if wrong:** None — removing a constraint that no code enforces.

### A-03: currentActivity refinement approach is feasible in Zod

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Complexity Assessment  
**Assumption:** A Zod `.refine()` on `WorkflowStateSchema` can conditionally require `currentActivity` when `status` is `running`, `paused`, or `suspended`, matching the JSON Schema `if/then` pattern.  
**Rationale:** The JSON Schema uses `if: { properties: { status: { enum: ["running", "paused", "suspended"] } } }, then: { required: ["currentActivity"] }` (state.schema.json:460-466). Zod supports `.refine()` for cross-field validation.  
**Evidence:** Confirmed JSON Schema pattern at `schemas/state.schema.json:460-466`. Zod's `.refine()` and `.superRefine()` support arbitrary cross-field checks. The `createInitialState` function (state.schema.ts:135-144) always sets `currentActivity`, so the refinement will pass for runtime-created states.  
**Risk if wrong:** Low — the plan already notes a fallback of removing the JSON Schema `if/then` if the refinement proves unwieldy.

### A-04: No usage of triggers as single object in workflow TOON files

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** No existing workflow TOON files use `triggers` as a single object that would break when the Zod schema changes to expect an array.  
**Rationale:** The workflows worktree contains TOON files that may reference `triggers`. If any use a single-object format, the Zod change would cause validation failures.  
**Evidence:** Searched `workflows/` worktree — zero matches for `triggers` in any TOON file. The field is not currently used by any workflow definition, so changing the Zod type to array has no impact on existing data.  
**Risk if wrong:** None — no existing usage to break.
