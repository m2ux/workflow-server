# Implementation Analysis (Pre-Change Baseline)

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**Created:** 2026-03-29  
**Base commit:** e58fd56 (main)  
**PR commit:** 120f48c (fix/behavioral-prism-findings)

---

## Baseline Metrics

Measured on the `main` branch at commit e58fd56 (the PR's base).

### Error Handling

| Metric | Value | Files |
|--------|-------|-------|
| Bare `catch {}` blocks | 14 | skill-loader (6), activity-loader (3), resource-loader (2), rules-loader (1), schema-preamble (1), state-tools (1) |
| Catch blocks with error capture | 2 | workflow-loader (1 with `logWarn`), logging.ts (1 with `logWarn`) |
| Catch blocks that re-throw | 0 | — |

**Evidence:** 13 of 14 bare catch blocks are in loader files (BF-02). The 14th is in state-tools.ts `restore_state` handler (BF-14), which wraps decrypt errors in a misleading "key rotation" message.

### Type Safety (TOON Decode Boundary)

| Metric | Value | Details |
|--------|-------|---------|
| `decodeToon<T>()` call sites | 9 | Across 6 files |
| **Validated** (safeParse after decode) | 5 | activity-loader (2), workflow-loader (2), state-tools (1) |
| **Unvalidated** (bare `as T` cast) | 4 | skill-loader (1), resource-loader (1), rules-loader (1), workflow-loader listWorkflows (1) |

**Key finding:** `safeValidateSkill()` is defined in `skill.schema.ts:174` but never imported or called by `skill-loader.ts`. The validation function exists but was never wired up.

### Response Serialization

| Metric | Value | Files |
|--------|-------|-------|
| `JSON.stringify(data, null, 2)` sites | 17 | workflow-tools (10), resource-tools (3), state-tools (2), schema-resources (1), schema-preamble (1) |

**Evidence:** All tool response serialization uses pretty-printing for a machine-to-machine protocol.

### Session Token Pipeline

| Metric | Value | Details |
|--------|-------|---------|
| `decodeSessionToken()` call sites | 11 | logging.ts (1), workflow-tools (5), resource-tools (3), state-tools (2) |
| Decodes per tool call | 3 | withAuditLog (1) + handler (1) + advanceToken (1) |
| `existsSync` blocking calls | 26 | skill-loader (8), workflow-loader (6), activity-loader (5), resource-loader (4), rules-loader (3) |

### Validation Correctness

| Metric | Value | Details |
|--------|-------|---------|
| `validateActivityTransition` returns null for missing data | 3 cases | Empty `token.act`, same activity, empty transitions |
| `validateSkillAssociation` returns null for missing data | 3 cases | Empty `activityId`, activity not found, no skills declared |
| `initialActivity` enforcement | None | First `next_activity` bypasses all validation |

---

## Pre-Change State by Finding

| Finding | Severity | Pre-Change Evidence on main |
|---------|----------|---------------------------|
| BF-01 | Critical | `skill-loader.ts:78` — `decodeToon<Skill>(content)` with no validation. `safeValidateSkill` exists in schema but is not imported. |
| BF-02 | Critical | 13 bare `catch {}` blocks across loader files. All return `[]`, `null`, or fallback values. Zero error information preserved. |
| BF-03 | High | 3 `decodeSessionToken` calls per request path (logging, handler, advanceToken). Each performs HMAC verify + JSON parse + Zod validate. |
| BF-04 | High | `validateActivityTransition` returns `null` for empty `token.act` (line 24). `validateSkillAssociation` returns `null` for empty `activityId`, missing activity, and no skills (lines 36-48). |
| BF-05 | High | `TraceStore.append()` checks `if (events)` and silently discards if `initSession()` was never called. Evictions at `maxSessions` are silent. |
| BF-06 | High | `readRules()` calls `decodeToon<Rules>(content)` with no Zod validation. Parse errors return `RulesNotFoundError()` (no message — misleading). |
| BF-07 | High | `loadWorkflow()` called by 6 tool handlers. Each call: readFile + TOON parse + Zod validate (~35-55ms). No caching. |
| BF-08 | Medium | `readActivityFromWorkflow` returns `ok(decoded)` on validation failure (line 120). Log says "using raw content." |
| BF-09 | Medium | First `next_activity` with `token.act === ''`: all three validators return `null` (pass). Any activity reachable. |
| BF-10 | Medium | `loadOrCreateKey` EEXIST fallback at `crypto.ts:42`: `return readFile(KEY_FILE)` with no key length check. |
| BF-11 | Medium | `validateStatePath` uses `process.cwd()` as security root. No configuration parameter. |
| BF-12 | Medium | `getTransitionList` reads only `activity.transitions` (line 193). `getValidTransitions` reads transitions + decisions + checkpoints (line 173). Scope mismatch. |
| BF-13 | Low | `evaluateSimpleCondition` uses `typeof value === 'number'` guard. String `"5"` compared to number `3` → `false`. |
| BF-14 | Low | `restore_state` catch block: `catch {}` → throws `new Error('Failed to decrypt... key rotation...')`. Original error destroyed. |
| BF-15 | Low | 17 `JSON.stringify(data, null, 2)` sites across tool handlers. ~25-35% whitespace overhead per payload. |
| BF-16 | Low | `resource-loader.ts:107` — `decodeToon<Resource>(content)` with no validation. No `ResourceSchema` exists. |

---

## Expected Changes (Post-PR + CR-01)

Based on the REPORT findings, research synthesis, and the user's required structural change (CR-01), the expected post-fix state should be:

### Required by PR #83 (current scope)

| Finding | Expected Change | Acceptance Criterion |
|---------|----------------|---------------------|
| BF-01 | Skill validation via Zod after decode | Non-skill TOON content returns `result.success === false` |
| BF-02 | All 13 loader catch blocks emit `logWarn` with error details | Loader failures produce visible stderr output |
| BF-04 | Validation returns warning strings for missing-data cases | Empty `token.act` or missing activity produces a warning, not null |
| BF-05 | TraceStore auto-initializes on append; evictions logged | Unknown session → auto-init + store event |
| BF-06 | Rules validated against Zod schema; parse vs. not-found distinguished | TOON syntax error → parse error, not `RulesNotFoundError` |
| BF-08 | `readActivityFromWorkflow` returns `err()` on validation failure | No more `ok(rawData)` on failure |
| BF-09 | First `next_activity` enforces `initialActivity` | Warning when skipping initial activity |
| BF-10 | Key length validated on EEXIST fallback | Truncated key detected and rejected |
| BF-11 | `validateStatePath` accepts optional `workspaceRoot` | Security boundary configurable |
| BF-12 | `getTransitionList` includes decisions + checkpoints | Scope matches `getValidTransitions` |
| BF-13 | String-to-number coercion for comparisons | String `"5"` vs number `3` evaluates correctly |
| BF-14 | `restore_state` preserves original decrypt error | Crypto error type visible in message |
| BF-15 | Pretty-printing removed from tool responses | `JSON.stringify(data)` (compact) |
| BF-16 | Resource validation via Zod after decode | Non-resource TOON content returns failure |
| BF-03 partial | `advanceToken` accepts optional pre-decoded payload | Parameter available for future use |

### Required by User Decision (CR-01 — structural fix)

| Change | Expected Implementation |
|--------|----------------------|
| `decodeToon<T>()` requires schema parameter | Signature: `decodeToon<T>(content: string, schema: ZodType<T>): T` |
| Eliminate `as T` cast | Schema.parse() replaces bare cast |
| All 9 call sites provide schemas | Each caller passes its content type's Zod schema |
| `ResourceSchema` created | New schema for resource content validation |
| Redundant post-decode validation removed | workflow-loader, activity-loader no longer need separate safeParse calls |

### Deferred (separate PR)

| Finding | Reason |
|---------|--------|
| BF-03 full | Requires `withAuditLog` handler signature change across 15+ tool registrations |
| BF-07 | Requires new cache subsystem with mtime invalidation |

---

## Gap Analysis: PR #83 vs. Expected

| Area | PR Delivers | Gap |
|------|------------|-----|
| Type safety | Call-site validation for skills (BF-01) and rules (BF-06) | **CR-01 required:** Must change to structural `decodeToon` validation. Resources (BF-16) still unvalidated. |
| Error handling | logWarn added to 13 catch blocks (BF-02) | None — meets the diagnostic visibility goal |
| Validation | Warning strings for missing data (BF-04/BF-09) | None — advisory model confirmed correct |
| TraceStore | Auto-init + eviction logging (BF-05) | None |
| Crypto | Key length on EEXIST (BF-10) | None |
| Path security | Optional workspaceRoot (BF-11) | None |
| Transitions | Unified scope (BF-12) | None |
| Conditions | String coercion (BF-13) | None |
| Diagnostics | Error preservation (BF-14) | None |
| Performance | Compact serialization (BF-15), partial decode threading (BF-03 partial) | None for BF-15. BF-03 partial is unused. |
