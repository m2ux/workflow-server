# Test Plan — WP-01 Schema Alignment

**Created:** 2026-03-28  
**Status:** Ready

---

## Strategy

All changes are schema-level corrections. Validation relies on the existing test suite plus typecheck:

1. **Type safety gate:** `npm run typecheck` must pass with zero errors after all changes
2. **Existing tests gate:** `npm test` must pass with all tests green
3. **Manual verification:** Confirm each finding is resolved by inspecting the changed files

No new tests are required — the existing test suite validates schema behavior. If F-10 (optional `currentActivity`) causes test failures, those tests should be updated to handle the new optionality.

---

## Verification Matrix

| Finding | Verification Method |
|---------|-------------------|
| F-01 | Inspect `state.schema.json` — `stateSaveFile.properties` includes `sessionTokenEncrypted`, `required` array includes it |
| F-02 | Inspect `activity.schema.ts` — `triggers` uses `z.array(WorkflowTriggerSchema).optional()` |
| F-03 | Inspect `state.schema.json` — `stateVersion` has no `maximum` property |
| F-10 | Inspect `state.schema.ts` — `currentActivity` is `z.string().optional()` with refinement |
| F-11 | Inspect `state.schema.json` — `stateVersion` description updated |
| F-13 | Inspect `workflow.schema.ts` — comment accurately describes Zod/JSON Schema relationship |

---

## Pass Criteria

- `npm run typecheck`: zero errors
- `npm test`: all tests pass
- All 6 divergences resolved per verification matrix
