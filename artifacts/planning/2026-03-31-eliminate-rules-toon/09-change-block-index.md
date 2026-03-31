# Change Block Index — #90 Eliminate rules.toon

**Branch:** `refactor/90-eliminate-rules-toon`  
**Base:** `main`  
**Total files changed:** 10  
**Net:** +13 / -266 lines  
**Estimated review time:** ~5 minutes (10 blocks × 30s)

---

| Row | File | Change | Lines |
|-----|------|--------|-------|
| 1 | `.engineering` | Submodule pointer update (planning folder commits) | +1/-1 |
| 2 | `src/errors.ts` | Remove `RULES_NOT_FOUND` error code and `RulesNotFoundError` class | +1/-8 |
| 3 | `src/loaders/index.ts` | Remove `rules-loader.js` re-export | +0/-1 |
| 4 | `src/loaders/rules-loader.ts` | **Deleted** — `readRules()` and `readRulesRaw()` functions | +0/-62 |
| 5 | `src/schema/rules.schema.ts` | **Deleted** — `RulesSchema`, `RulesSectionSchema`, types | +0/-24 |
| 6 | `src/tools/resource-tools.ts` | Remove `readRules` import/call, slim `start_session` response, update description | +3/-9 |
| 7 | `src/tools/workflow-tools.ts` | Add `step_3` (get_skills) to help bootstrap, update `step_2` return description | +8/-1 |
| 8 | `tests/mcp-server.test.ts` | Update `start_session` test: expect no rules in response | +2/-5 |
| 9 | `tests/rules-loader.test.ts` | **Deleted** — all rules-loader unit tests | +0/-158 |
| 10 | `workflows` | Submodule pointer update (new skills, deleted rules.toon, README updates) | +1/-1 |
