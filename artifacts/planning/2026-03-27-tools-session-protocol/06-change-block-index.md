# Change Block Index

**Work Package:** Tools Session Protocol (WP-07)  
**Branch:** fix/wp07-tools-session-protocol  
**Generated:** 2026-03-27

---

## Summary

3 files changed, 79 insertions, 26 deletions across 11 change blocks.

---

## Change Blocks

### Block 1: `src/tools/resource-tools.ts` — Runtime type guard for loadSkillResources (QC-092)

**Lines:** 15-24 (function `loadSkillResources`)  
**Findings:** QC-092  
**Change:** Replaced unsafe double cast (`skillValue as Record` then `as string[]`) with progressive runtime validation: null/type check, `Array.isArray`, and `filter` type predicate.

---

### Block 2: `src/tools/resource-tools.ts` — Version fallback warning (QC-097)

**Lines:** 47-49 (inside `start_session` handler)  
**Findings:** QC-097  
**Change:** Added `console.warn` when `workflow.version` is undefined, before the `'0.0.0'` fallback is used. Preserves the fallback but surfaces the condition.

---

### Block 3: `src/tools/resource-tools.ts` — Token added to `_meta` (QC-037)

**Lines:** 72-77 (inside `start_session` handler return)  
**Findings:** QC-037  
**Change:** Added `_meta: { session_token: token }` to the return object. Token remains in body for backward compatibility and is now also in `_meta` to match all other tools.

---

### Block 4: `src/tools/resource-tools.ts` — Skill load failure surfacing and duplicate logging (QC-032, QC-039)

**Lines:** 99-137 (inside `get_skills` handler)  
**Findings:** QC-032, QC-039  
**Change:** Added `failedSkills` and `duplicateIndices` arrays. Failed skill loads are tracked and surfaced as `failed_skills` in the response. Duplicate resource indices are tracked and surfaced as `duplicate_resource_indices`.

---

### Block 5: `src/tools/state-tools.ts` — Import and constants (QC-034, QC-036)

**Lines:** 11, 15-16  
**Findings:** QC-034, QC-036  
**Change:** Added `validateWorkflowConsistency` import. Extracted hard-coded `'session_token'` and `'_session_token_encrypted'` string literals into named constants `SESSION_TOKEN_KEY` and `SESSION_TOKEN_ENCRYPTED_KEY`.

---

### Block 6: `src/tools/state-tools.ts` — JSON.parse try/catch and validation (QC-033, QC-036)

**Lines:** 35-47 (inside `save_state` handler)  
**Findings:** QC-033, QC-036  
**Change:** Wrapped `JSON.parse(stateJson)` in try/catch with descriptive error message. Changed `await decodeSessionToken` to capture the token for validation. Applied `SESSION_TOKEN_KEY` and `SESSION_TOKEN_ENCRYPTED_KEY` constants. Added `validateWorkflowConsistency` to the response validation.

---

### Block 7: `src/tools/state-tools.ts` — Double cast fix (QC-099)

**Lines:** 67 (inside `save_state` handler)  
**Findings:** QC-099  
**Change:** Replaced `saveFile as unknown as Record<string, unknown>` with single `saveFile as Record<string, unknown>`.

---

### Block 8: `src/tools/state-tools.ts` — Restore state: constants, key rotation, validation (QC-034, QC-035, QC-036)

**Lines:** 97-130 (inside `restore_state` handler)  
**Findings:** QC-034, QC-035, QC-036  
**Change:** Captured decoded token. Applied named constants. Wrapped decrypt in try/catch with informative key-rotation error message. Added `validateWorkflowConsistency` to response validation.

---

### Block 9: `src/tools/workflow-tools.ts` — Remove redundant initialActivity cast (QC-093)

**Lines:** 94 (inside `get_workflow` handler)  
**Findings:** QC-093  
**Change:** Replaced `(wf as Record<string, unknown>)['initialActivity']` with direct `wf.initialActivity`.

---

### Block 10: `src/tools/workflow-tools.ts` — Empty activity manifest warning, trace fixes (QC-094, QC-095, QC-100)

**Lines:** 134-172 (inside `next_activity` handler)  
**Findings:** QC-094, QC-095, QC-100  
**Change:** Added empty-array check for `activity_manifest` with descriptive warning. Replaced non-null assertions (`events[0]!`) with local variables and conditional access. Changed trace `act` field from `token.act || activity_id` to `activity_id` (the new activity being transitioned to).

---

### Block 11: `src/tools/workflow-tools.ts` — Distinguish tracing disabled from no events (QC-038)

**Lines:** 256-270 (inside `get_trace` handler)  
**Findings:** QC-038  
**Change:** Split the single return into two branches: when `config.traceStore` is falsy, returns `tracing_enabled: false`. When tracing is active, returns `tracing_enabled: true`. Callers can now distinguish "tracing is off" from "tracing is on but no events recorded".

---

## Findings Coverage

| Finding | Block | Status |
|---------|-------|--------|
| QC-032 | 4 | Addressed |
| QC-033 | 6 | Addressed |
| QC-034 | 5, 6, 8 | Addressed |
| QC-035 | 8 | Addressed |
| QC-036 | 5, 6, 8 | Addressed |
| QC-037 | 3 | Addressed |
| QC-038 | 11 | Addressed |
| QC-039 | 4 | Addressed |
| QC-092 | 1 | Addressed |
| QC-093 | 9 | Addressed |
| QC-094 | 10 | Addressed |
| QC-095 | 10 | Addressed |
| QC-096 | — | Addressed via QC-037 (protocol description now matches behavior) |
| QC-097 | 2 | Addressed |
| QC-098 | — | Not applicable (tools with explicit activity_id don't need token.act) |
| QC-099 | 7 | Addressed |
| QC-100 | 10 | Addressed |
