# Code Review — PR #83

**PR:** [#83](https://github.com/m2ux/workflow-server/pull/83) — fix: resolve behavioral prism findings  
**Branch:** fix/behavioral-prism-findings → main  
**Reviewer:** Automated (workflow-server review work package)  
**Date:** 2026-03-29

---

## Summary

PR #83 addresses 14 of 16 behavioral prism findings across 17 source files (+154/-71 lines). The review identified **3 required changes** and **4 recommendations**.

**Verdict: fix-both** — Required code changes and test improvements must be addressed before merge. These are documented review findings for the PR author.

---

## Required Changes

### RC-01: `decodeToon<T>()` must require schema parameter (CR-01)

**Severity:** Required  
**Source:** User decision during assumption interview (A-RS-03)  
**Files:** `src/utils/toon.ts`, all 9 `decodeToon` call sites across 6 files

The PR adds Zod validation at individual call sites (`safeValidateSkill` in skill-loader, `RulesSchema.safeParse` in rules-loader). This leaves the unsafe `as T` cast in `decodeToon` and allows future callers to skip validation. The BF-16 resource gap is direct evidence of this risk.

**Required implementation:**
```typescript
// src/utils/toon.ts
function decodeToon<T>(content: string, schema: ZodType<T>): T {
  const decoded = decode(content);
  return schema.parse(decoded);
}
```

All 9 call sites must provide their content type's Zod schema. A `ResourceSchema` must be created (does not currently exist). Callers that already validate after decode (workflow-loader, activity-loader) can remove redundant post-decode `safeParse` calls.

### RC-02: `SkillSchema.passthrough()` → `.strict()`

**Severity:** Required  
**Source:** Manual diff review finding  
**File:** `src/schema/skill.schema.ts:170`

`.passthrough()` silently accepts unknown fields, defeating the purpose of schema validation. Change to `.strict()` which rejects undeclared properties.

**Pre-requisite changes to SkillSchema (skill.schema.ts):**
- Remove `ExecutionPatternSchema` (lines 24-32) — its content should be refactored into `protocol` + `tools` in the TOON files, not wired into the schema

**Pre-requisite changes to meta workflow skill TOON files:**
1. `execution_pattern` field (2 meta skills) — Refactor content into existing `protocol` + `tools` sections (do NOT wire into schema; remove `ExecutionPatternSchema` from skill.schema.ts)
2. `format` field in `02-state-management.toon` — Subsume into existing `numeric_format` (rename in TOON file)
3. `critical_rule` field in `03-artifact-management.toon` — Subsume into existing `rules` (move to rules entry)
4. `folder_structure` field in `03-artifact-management.toon` — Decompose into `inputs` + `rules` (update TOON file)

### RC-03: BF-16 resource validation gap

**Severity:** Required (subsumed by RC-01)  
**File:** `src/loaders/resource-loader.ts:107`

`readResource` still calls `decodeToon<Resource>(content)` with no Zod validation. Once RC-01 is implemented (schema parameter in `decodeToon`), this is automatically fixed — `readResource` must provide a `ResourceSchema`. A `ResourceSchema` must be created.

---

## Finding-by-Finding Verification

### Correctly Implemented (11 findings)

| Finding | Sev | Verdict | Notes |
|---------|-----|---------|-------|
| BF-02 | Critical | ✅ Correct | All 13 loader catch blocks now emit `logWarn` with error details. Consistent pattern: `catch (error) { logWarn('message', { context, error: error instanceof Error ? error.message : String(error) }); return fallback; }` |
| BF-04 | High | ✅ Correct | `validateActivityTransition` returns warning string for missing `token.act` with `initialActivity` enforcement. `validateSkillAssociation` returns descriptive warnings for all 3 missing-data cases. |
| BF-05 | High | ✅ Correct | `TraceStore.append()` auto-initializes unknown sessions via `initSession()`. Evictions logged with `logWarn` including evicted SID and max. |
| BF-06 | High | ✅ Correct | New `RulesSchema` with 6 required fields + `RulesSectionSchema.passthrough()`. Parse errors distinguished from not-found via `RulesNotFoundError(message)`. |
| BF-08 | Medium | ✅ Correct | `readActivityFromWorkflow` returns `err(new ActivityNotFoundError(...))` on validation failure. Log message updated. Backward compatibility risk is lower than assessed — tool handlers use `getActivity()` via workflow-loader, not this function. |
| BF-09 | Medium | ✅ Correct | First `next_activity` call checks `workflow.initialActivity` when `token.act === ''`. Returns warning string (advisory, not blocking). Consistent with validation-as-metadata pattern. |
| BF-10 | Medium | ✅ Correct | EEXIST fallback validates key length: `if (existingKey.length !== KEY_LENGTH) throw new Error(...)`. Clear error message mentioning concurrent write. |
| BF-11 | Medium | ✅ Correct | `validateStatePath` accepts optional `workspaceRoot?: string` with fallback to `process.cwd()`. Error message now includes the root path for diagnostics. |
| BF-12 | Medium | ✅ Correct | `getTransitionList` now iterates `activity.decisions` and `activity.checkpoints` in addition to `activity.transitions`. Uses `seen` Set for deduplication. |
| BF-13 | Low | ✅ Correct | New `toNumber()` helper handles string-to-number coercion with `Number.isFinite` guard. All 4 comparison operators use it consistently. |
| BF-14 | Low | ✅ Correct | `restore_state` catch block preserves original error: `const cause = decryptErr instanceof Error ? decryptErr.message : String(decryptErr)`. Error message expanded with multiple possible causes. |

### Correctly Implemented with Notes (2 findings)

| Finding | Sev | Verdict | Notes |
|---------|-----|---------|-------|
| BF-15 | Low | ✅ Correct | All `JSON.stringify(data, null, 2)` → `JSON.stringify(data)` across tool handlers. Verified 16 sites in workflow-tools (10), resource-tools (3), state-tools (2), schema-resources (1). Note: `schema-preamble.ts` still uses `JSON.stringify(schema, null, 2)` but that's build-time, not response-time. |
| BF-03p | High | ✅ Correct (partial) | `advanceToken` signature changed to `(token: string, updates?: SessionAdvance, decoded?: SessionPayload)`. No caller currently passes the decoded parameter — it's infrastructure for the full BF-03 fix. |

### Requires Changes (2 findings)

| Finding | Sev | Verdict | Notes |
|---------|-----|---------|-------|
| BF-01 | Critical | ⚠️ RC-01/RC-02 | Skill validation added via `safeValidateSkill` — correct intent but implementation approach must change. `decodeToon` must require schema (RC-01). `.passthrough()` must become `.strict()` (RC-02). |
| BF-16 | Low | ⚠️ RC-03 | Resource validation not implemented. Subsumed by RC-01 — once `decodeToon` requires schema, resource-loader must provide `ResourceSchema`. |

---

## Code Quality Observations

### Positive Patterns

1. **Consistent catch-block pattern**: All 13 catch blocks follow the same template: `catch (error) { logWarn('context', { relevant_fields, error: error instanceof Error ? error.message : String(error) }); return fallback; }`. This consistency makes the pattern easy to maintain.

2. **Deduplication in transition scope**: `getTransitionList` uses a `seen` Set to avoid duplicate entries when the same target appears in both transitions and decisions/checkpoints.

3. **Defensive `toNumber()` helper**: The `Number.isFinite` guard correctly rejects `NaN`, `Infinity`, and `-Infinity` from coercion.

4. **Non-breaking API changes**: `validateStatePath` adds an optional parameter (backward-compatible). `advanceToken` adds an optional parameter (backward-compatible). `RulesNotFoundError` constructor makes message optional with default (backward-compatible).

### Concerns

1. **BF-08 error type mismatch**: `readActivityFromWorkflow` returns `err(new ActivityNotFoundError(...))` when the file exists but fails validation. Semantically, the activity was *found* but *invalid*. A `ValidationError` would be more accurate. However, `ActivityNotFoundError` is what callers expect and handle, so this is pragmatic.

2. **BF-06 RulesSchema without .passthrough()**: The top-level `RulesSchema` does not use `.passthrough()`. If rules TOON files gain new top-level fields in the future, validation will fail. The `RulesSectionSchema` does use `.passthrough()`, which is appropriate for extensible section content. Consider whether top-level extensibility is needed.

3. **BF-03 partial unused**: The `decoded` parameter on `advanceToken` exists but no caller passes it. This is dead code until the full BF-03 fix. Acceptable as infrastructure, but should be documented with a TODO or tracked.

---

## Backward Compatibility Assessment

| Change | Risk | Assessment |
|--------|------|-----------|
| BF-06 RulesSchema | Medium | Existing `meta/rules.toon` has all 6 required fields — verified compatible. Future files with extra top-level fields would fail. |
| BF-08 return path | Low | Tool handlers use `getActivity()` via workflow-loader, not `readActivityFromWorkflow`. Impact limited to activity index building. |
| BF-15 compact JSON | None | Machine consumers don't depend on whitespace formatting. |
| BF-04/BF-09 warnings | None | New warning strings flow through existing `buildValidation()` → `_meta.validation`. No tool branches on status. |
| BF-12 transition scope | None | `getTransitionList` now returns more entries (decisions, checkpoints). Callers that iterate get more data, which is correct. |
