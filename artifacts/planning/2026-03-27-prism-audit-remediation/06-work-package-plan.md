# Work Package Plan — WP-01 Schema Alignment

**Created:** 2026-03-28  
**Status:** Ready  
**Estimated Effort:** 1–2 hours agentic

---

## Approach

Direct-fix approach: apply each schema correction individually, verify typecheck and tests pass after all changes. Changes are additive or corrective — no architectural decisions required.

**Execution order:** JSON Schema fixes first (F-01, F-03, F-11), then Zod fixes (F-02, F-10), then comment fix (F-13), then validation (typecheck + tests).

---

## Tasks

| # | Finding | File | Change | Est. |
|---|---------|------|--------|------|
| 1 | F-01 (HIGH) | `schemas/state.schema.json` | Add `sessionTokenEncrypted: { "type": "boolean" }` to `stateSaveFile.properties` and add to `required` array | 5m |
| 2 | F-03 (MEDIUM) | `schemas/state.schema.json` | Remove `"maximum": 1000` from `stateVersion` definition | 2m |
| 3 | F-11 (LOW) | `schemas/state.schema.json` | Change `stateVersion` description to "Monotonically increasing state sequence number" | 2m |
| 4 | F-02 (MEDIUM) | `src/schema/activity.schema.ts` | Change `triggers` from `WorkflowTriggerSchema.optional()` to `z.array(WorkflowTriggerSchema).optional()` | 5m |
| 5 | F-10 (LOW) | `src/schema/state.schema.ts` | Change `currentActivity` from `z.string()` to `z.string().optional()` and add `.superRefine()` for running/paused/suspended states | 15m |
| 6 | F-13 (LOW) | `src/schema/workflow.schema.ts` | Update stale comment at line 54 | 2m |
| 7 | — | — | Run `npm run typecheck` and `npm test`, fix any failures | 15m |

**Total estimated:** ~45 minutes agentic

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| F-10 refinement makes `currentActivity` type `string \| undefined` everywhere | Type errors in code that expects `string` | Use `.superRefine()` on the object level so the base field type stays `string \| undefined`; update callers if needed |
| Tests depend on `currentActivity` always being present | Test failures | Fix tests to handle optional field or provide it explicitly |

---

## Dependencies

None — all changes are independent of each other and can be applied in any order.
