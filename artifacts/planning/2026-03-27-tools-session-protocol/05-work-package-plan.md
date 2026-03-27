# Work Package Plan: Tools Session Protocol

**Work Package:** WP-07  
**Issue:** #67  
**Created:** 2026-03-27

---

## Tasks

### Task 1: resource-tools.ts fixes (QC-032, QC-037, QC-039, QC-092, QC-097)

| Finding | Change | Risk |
|---------|--------|------|
| QC-032 | Surface failed skill IDs in response alongside loaded skills | Low — additive field |
| QC-037 | Move `session_token` from response body to `_meta` in `start_session` | Medium — requires test update |
| QC-039 | Log duplicate resource indices being dropped | Low — logging only |
| QC-092 | Add runtime type guard for `skillValue.resources` in `loadSkillResources` | Low — validation only |
| QC-097 | Warn when version is undefined instead of using `'0.0.0'` fallback | Low — warning only |

**Estimate:** 20-30m

### Task 2: state-tools.ts fixes (QC-033, QC-034, QC-035, QC-036, QC-099)

| Finding | Change | Risk |
|---------|--------|------|
| QC-033 | Wrap `JSON.parse` in try/catch with descriptive error | Low — error handling |
| QC-034 | Extract `'session_token'` literal to a named constant | Low — refactor |
| QC-035 | Add try/catch around decrypt with informative error about key rotation | Low — error handling |
| QC-036 | Add `validateWorkflowConsistency` call to both `save_state` and `restore_state` | Low — additive validation |
| QC-099 | Replace double cast with direct Zod-inferred typing or single cast | Low — type refactor |

**Estimate:** 15-25m

### Task 3: workflow-tools.ts fixes (QC-038, QC-093, QC-094, QC-095, QC-096, QC-098, QC-100)

| Finding | Change | Risk |
|---------|--------|------|
| QC-038 | Return `tracing_enabled: false` when `config.traceStore` is undefined | Low — additive field |
| QC-093 | Access `initialActivity` directly from typed workflow object | Low — type cleanup |
| QC-094 | Add warning when `activity_manifest` is empty array vs. omitted | Low — validation |
| QC-095 | Remove non-null assertions, use proper indexing | Low — type safety |
| QC-096 | Move protocol description to reference `start_session` response behavior accurately | Low — documentation |
| QC-098 | Add `token.act` precondition check to `get_checkpoint` | Low — validation |
| QC-100 | Use `activity_id` (new activity) for trace `act` field instead of `token.act` | Low — correctness |

**Estimate:** 20-30m

### Task 4: Test updates and verification

- Update `mcp-server.test.ts` to read token from `_meta` instead of body for `start_session`
- Run `npm run typecheck` and `npm test`

**Estimate:** 10-15m

---

## Order

Tasks 1-3 can be done in any order. Task 4 must follow completion of Tasks 1-3.

---

## Total Estimate

65-100 minutes agentic time.
