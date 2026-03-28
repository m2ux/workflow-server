# Design Philosophy

**Work Package:** WP-01 Schema Alignment  
**Created:** 2026-03-28

---

## Problem Statement

The workflow-server maintains two parallel schema definitions for its data structures: Zod schemas (TypeScript runtime validation in `src/schema/`) and JSON Schema files (IDE/documentation artifacts in `schemas/`). A full-prism quality audit identified six places where these definitions have drifted apart, ranging from a missing property that causes JSON Schema validators to reject all valid state files (HIGH) to misleading descriptions and stale comments (LOW).

### System Context

The Zod schemas serve as the runtime source of truth — they validate workflow state during execution. The JSON Schema files are authoring/IDE artifacts used for documentation, external tooling, and TOON file validation. Since there is no automated synchronization between the two, drift accumulates silently until an external validator or tool applies the JSON Schema.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | 1 HIGH, 2 MEDIUM, 3 LOW |
| Scope | State persistence, activity triggers, workflow documentation |
| Business Impact | F-01 (HIGH) blocks any external JSON Schema validation of state save files; remaining items cause silent drift that erodes schema reliability |

---

## Problem Classification

**Type:** Specific Problem  
**Subtype:** Cause Known (direct fix)  
**Complexity:** Simple  
**Rationale:** All six divergences are precisely located with known root causes and clear fixes identified in the Prism audit report. Each fix is a localized, additive change to a single schema file with no cross-cutting architectural implications. The changes are: add a missing property, change a type from single to array, remove an incorrect numeric cap, make a field conditionally optional, update a description string, and correct a stale comment.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (direct to plan-prepare → implement)

**Activities Included:**
- [x] Design Philosophy (this document)
- [ ] ~~Requirements Elicitation~~ — not needed, requirements come from Prism audit
- [ ] ~~Research~~ — not needed, fixes are straightforward schema edits
- [ ] ~~Implementation Analysis~~ — not needed, file locations and changes are specified
- [x] Plan & Prepare
- [x] Implement

**Rationale:** The Prism audit provides complete, unambiguous requirements with exact file locations and prescribed fixes. No external research, stakeholder input, or codebase exploration is needed beyond what the audit already documents. This is a direct-fix scenario.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Backward Compatibility | Changes must not break existing runtime validation or test suite |
| Technical | F-10 Zod refinement must match JSON Schema `if/then` semantics exactly |
| Dependencies | WP-02 depends on WP-01 completing first |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Type safety | `npm run typecheck` | Zero errors |
| Tests pass | `npm test` | All green |
| Schema alignment | Manual verification | All 6 divergences resolved |

---

## Findings Summary

| ID | Severity | Change | File(s) |
|----|----------|--------|---------|
| F-01 | HIGH | Add `sessionTokenEncrypted` to JSON Schema `stateSaveFile` | `schemas/state.schema.json` |
| F-02 | MEDIUM | Change Zod `triggers` from single object to array | `src/schema/activity.schema.ts` |
| F-03 | MEDIUM | Remove `stateVersion` maximum (1000) | `schemas/state.schema.json` |
| F-10 | LOW | Make `currentActivity` optional with refinement | `src/schema/state.schema.ts` |
| F-11 | LOW | Update `stateVersion` description | `schemas/state.schema.json` |
| F-13 | LOW | Update stale comment about JSON Schema | `src/schema/workflow.schema.ts` |
