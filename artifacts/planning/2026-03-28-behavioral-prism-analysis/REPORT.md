# Behavioral Analysis Report — workflow-server

**Date:** 2026-03-28
**Target:** workflow-server TypeScript MCP server (`src/`, ~3k LOC, 36 source files)
**Scope:** Structural and behavioral correctness of error handling, validation, state management, performance, and API contracts

---

## Executive Summary

This report presents 16 behavioral findings across the workflow-server codebase, a TypeScript MCP server for AI agent workflow orchestration.

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 5 |
| Medium | 5 |
| Low | 4 |
| **Total** | **16** |

The two critical findings — an unsafe type cast at the TOON decode boundary and systematic error suppression across all loader modules — share a common structural root: the codebase consistently sacrifices information fidelity for interface simplicity at every abstraction boundary. This choice produces code that is readable in isolation but impossible to diagnose across request paths.

---

## Core Finding

**Every abstraction boundary in this system destroys information in exchange for interface simplicity, and this destruction propagates across error handling, performance, implicit contracts, and API promises simultaneously.**

A bare `catch {}` in a loader is not merely an error-handling gap — it simultaneously prevents caching (the caller cannot distinguish silent failure from empty success), creates an implicit contract (the caller must "just know" that empty arrays might mean permission denied), and violates the return type promise (`Result<Skill>` implies validated data). Similarly, the `as T` cast in `decodeToon<T>()` is not just a type safety issue — it forces redundant downstream validation (costing ~0.5–2ms per parse), splits callers into validated and unvalidated populations (an invisible trust boundary), and lies about return type guarantees.

This pattern explains why incremental fixes have not resolved these issues: correcting any single dimension (adding error types, adding caches, documenting contracts, fixing names) shifts cost to the other three. The only interventions that reduce total defect cost operate at the boundary itself — mandatory validation in `decodeToon`, typed error propagation in loaders, decoded-token threading in the session pipeline — rather than compensating downstream.

---

## Findings

### Critical

#### BF-01 — Unsafe generic cast in `decodeToon<T>()` erases all type guarantees

**Location:** `src/utils/toon.ts:8–9`
**Severity:** Critical

The `decodeToon<T>()` function casts the TOON library's decode output to an arbitrary type `T` via `return decode(content) as T`. This is a bare type assertion with no runtime validation. At compile time, callers receive a typed value; at runtime, the object is whatever the TOON parser produced.

Callers split into two populations: **safe callers** (workflow-loader, activity-loader) that apply Zod validation after decoding, and **unsafe callers** (rules-loader at `rules-loader.ts:43`, skill-loader at `skill-loader.ts:78`, resource-loader at `resource-loader.ts:107`) that consume the cast result directly. Unsafe callers propagate structurally invalid objects where field access on missing properties returns `undefined` instead of throwing.

The safe callers pay a redundant validation tax: `ActivitySchema` alone has 17 `.default()` calls that each clone sub-trees, costing ~0.5–2ms per parse. This validation exists solely to compensate for the cast's unsafety. Fixing `decodeToon` to require a schema parameter would eliminate three downstream data corruption paths (rules, skills, resources) and remove the need for compensating validation overhead in safe callers.

---

#### BF-02 — 13 bare catch blocks across 6 loader files destroy all error information

**Location:** `activity-loader.ts`, `skill-loader.ts`, `resource-loader.ts`, `rules-loader.ts`, `workflow-loader.ts`, `schema-preamble.ts` (13 catch blocks; see Traceability for line numbers)
**Severity:** Critical

Bare `catch {}` blocks across all loader modules return empty arrays, `null`, or fallback values, destroying error type, message, stack trace, and filesystem error code (`EACCES`, `ENOENT`, `EMFILE`). Every one of these returns a "success" result, making failures completely invisible to callers.

This pattern makes partial success indistinguishable from total failure. When `listWorkflows()` encounters `EACCES` on the workflow directory, it returns `[]`. The `help` tool receives an empty array and reports "no workflows available." The agent concludes the server has no workflows configured. The correct diagnosis (permission denied) exists only in stderr, which agents do not read.

The pattern also prevents caching: a cache cannot distinguish between "directory contained zero items" and "directory read failed silently," so no caching layer can be safely introduced without first fixing error propagation. Estimated redundant I/O cost due to the inability to cache: ~150–250ms per 5-call session.

---

### High

#### BF-03 — Session token decoded three times per request

**Location:** `src/logging.ts:67` (withAuditLog), tool handlers (e.g., `workflow-tools.ts:71`), `src/utils/session.ts:91` (advanceToken)
**Severity:** High

For every tool call with a `session_token` parameter, the same HMAC-signed token is decoded three times independently:

1. `withAuditLog` decodes it for trace capture (`logging.ts:67`)
2. The tool handler decodes it for business logic (e.g., `workflow-tools.ts:71`)
3. `advanceToken` decodes it again for token advancement (`session.ts:91`)

Each decode performs HMAC verification (SHA-256), JSON parsing, and Zod schema validation. The `withAuditLog` wrapper cannot pass its decoded result to the handler because the wrapper's return type erases the decoded payload. The handler cannot pass its result to `advanceToken` because `advanceToken` accepts only the raw token string.

Cost: ~0.2–0.6ms + 6 Buffer allocations per request in redundant cryptographic and parsing work. The same separation of concerns that makes each component independently testable is the exact boundary that prevents optimization.

Additionally, `decodeSessionToken` (`session.ts:45–70`) double-wraps errors: a Zod validation failure is first wrapped as `"Missing or invalid token fields: ..."`, then re-wrapped as `"Invalid session token: ..."`, destroying the original `ZodError.issues[]` array with its structured path, code, expected, and received fields.

---

#### BF-04 — Validation functions treat absent data as permission granted

**Location:** `src/utils/validation.ts:24–52`
**Severity:** High

`validateActivityTransition()` and `validateSkillAssociation()` systematically return `null` (meaning "valid") when data is missing:

- `validateActivityTransition`: returns `null` when `token.act` is empty, when the current activity matches the target, and when the activity has an empty transitions array (`validation.ts:24–28`)
- `validateSkillAssociation`: returns `null` when `activityId` is empty, when the activity doesn't exist in the workflow, and when the activity has no skills declared (`validation.ts:36–52`)

Three distinct error conditions — session state corruption (empty activity ID), stale session (activity not found), and schema violation (no skills declared) — all collapse into the same `null` return value as legitimate "no constraint applies." The validation layer cannot distinguish between "correctly unconstrained" and "data missing due to error," making it structurally incapable of hardening.

---

#### BF-05 — TraceStore silently drops events, evicts sessions, and cannot observe its own failures

**Location:** `src/trace.ts:71–103`
**Severity:** High

The TraceStore — the component responsible for system observability — has three silent failure modes:

1. **Silent event drop** (`trace.ts:84–87`): `append(sid, event)` checks `if (events)` and silently discards the event if `initSession(sid)` was never called. No error, no log, no return value.
2. **Silent eviction** (`trace.ts:71–77`): When `maxSessions` is exceeded, the oldest session is deleted without logging, callback, or notification. Tools still referencing the evicted session ID receive empty results.
3. **Destructive cursor advance** (`trace.ts:97–103`): `getSegmentAndAdvanceCursor()` advances the cursor on read, meaning a segment of events can only be consumed once. A network retry or double-call to `next_activity` produces empty or near-empty segments.

The TraceStore cannot report its own failures without creating infinite recursion (trace failures would generate events that fail to trace). This is a fundamental constraint: the observability layer is built with the same error-suppressing patterns as the rest of the codebase.

---

#### BF-06 — Rules loading pipeline has zero validation and gates all session creation

**Location:** `src/loaders/rules-loader.ts:34–50`
**Severity:** High

The rules loading pipeline is the single most critical bootstrap dependency — `start_session` requires rules, and all workflow sessions require `start_session` — yet it has fewer validation checkpoints than any other content type.

`readRules()` calls `decodeToon<Rules>(content)` at `rules-loader.ts:43` with no Zod validation. A field name typo (e.g., `sectons` instead of `sections`) produces a rules object where `sections` is `undefined`. The loader logs `sectionCount: 0` as if the ruleset is legitimately empty. Agents receive no behavioral constraints despite rules being "loaded successfully."

When the TOON file has a syntax error, the catch block at `rules-loader.ts:46–48` returns `RulesNotFoundError` — a "not found" error for a file that exists. `start_session` then throws "Global rules not found," directing the user to create a new file when the existing one has a syntax error. Every workflow session is blocked, and the error message leads to wrong remediation.

---

#### BF-07 — Every tool call re-reads, re-parses, and re-validates the full workflow from disk

**Location:** All loader modules; primary path through `workflow-loader.ts:78–112`
**Severity:** High

`loadWorkflow()` is called by 6 tool handlers (`get_workflow`, `next_activity`, `get_checkpoint`, `get_activities`, `get_skills`, `get_skill`). Each call performs:

1. 2× `existsSync` synchronous stat calls (~100–200μs event-loop blocking)
2. `readFile` + Buffer allocation + UTF-8 decode (~0.5–2ms warm cache)
3. TOON parse (~0.3–1ms)
4. Zod validation with 17+ `.default()` clones (~0.5–2ms)
5. For directory-based workflows: N × (`readFile` + `decodeToon` + `safeValidateActivity`) per activity (~3–5ms each)

For a workflow with 10 activities, a single tool call costs ~35–55ms and ~300–500KB in allocations, all discarded immediately. A typical 5-call session wastes ~150–250ms in redundant filesystem I/O, TOON parsing, and Zod validation. File reads are sequential (`for...of` + `await`), not parallelized, adding ~18–30ms for batched reads that could use `Promise.all`. 22 `existsSync` calls across the codebase block the event loop for ~1.1–2.2ms per request path.

---

### Medium

#### BF-08 — `readActivityFromWorkflow` returns success with unvalidated data on validation failure

**Location:** `src/loaders/activity-loader.ts:114–120`
**Severity:** Medium

When `safeValidateActivity(decoded)` fails, `readActivityFromWorkflow()` logs a warning but returns the raw decoded object as an `ok(...)` result (`activity-loader.ts:120`). The caller receives `Result.success === true` with an object where:

- Zod defaults are not applied (`required` defaults to `true`, `isDefault` on transitions defaults to `false`, `blocking` on checkpoints defaults to `true` — all absent)
- Required fields may be `undefined` despite the `Activity` type claiming they are `string`
- The `Result` type contract — `ok` means validated data — is violated

This bypass also functions as the de facto backward compatibility mechanism: when a schema evolution adds a new required field with a default, old TOON files fail `safeParse` but still load via the raw-data fallback. Removing this bypass simultaneously fixes a correctness issue and breaks backward compatibility.

---

#### BF-09 — First `next_activity` call bypasses all transition and condition validation

**Location:** `src/utils/validation.ts:24`, `validation.ts:107`, `workflow-tools.ts:122`
**Severity:** Medium

After `start_session`, the session token has `act: ''`. On the first `next_activity` call:

- `validateActivityTransition` returns `null` (pass) because `!token.act` is true (`validation.ts:24`)
- `validateTransitionCondition` returns `null` (pass) because `!token.act` is true (`validation.ts:107`)
- Step manifest validation is skipped because `token.act` is falsy (`workflow-tools.ts:122`)

Any activity is reachable on the first call with `status: 'valid'` and zero warnings. The `initialActivity` field on the workflow schema (`workflow.schema.ts:53`) is informational metadata, not enforced by the server. An agent can skip required prerequisite activities, miss data-gathering steps, and produce artifacts without context built by earlier activities.

---

#### BF-10 — HMAC key race condition in `loadOrCreateKey()` can produce truncated keys

**Location:** `src/utils/crypto.ts:32–49`
**Severity:** Medium

When two server processes start concurrently, both may attempt to create `~/.workflow-server/secret`. The EEXIST fallback path at `crypto.ts:42` calls `readFile(KEY_FILE)` without the key length validation that the initial read path performs at `crypto.ts:28`. A partially-written key file (concurrent write in progress) is returned as-is and cached in `keyPromise`.

The truncated key produces valid HMAC signatures that cannot be verified by the other process (or by the same process after restart with the correct key). Every subsequent tool call fails with "Invalid session token: signature verification failed." Saved state files encrypted with the truncated key become permanently unrecoverable. The error message blames the token, not the key.

---

#### BF-11 — Path validation security boundary derived from `process.cwd()`, not configuration

**Location:** `src/tools/state-tools.ts:19–26`
**Severity:** Medium

`validateStatePath()` uses `process.cwd()` as the security root for `save_state` and `restore_state` path validation. If the server is started from `/tmp`, `/home`, or any broad directory, the validation boundary expands to encompass unrelated filesystem paths.

State files containing encrypted session tokens and workflow variables can be written to and read from any path under the process working directory. No warning is emitted about an unexpected root path, and no configuration parameter overrides this behavior.

---

#### BF-12 — `getTransitionList` and `getValidTransitions` have inconsistent transition scope

**Location:** `src/loaders/workflow-loader.ts:170–178` vs `workflow-loader.ts:187–202`
**Severity:** Medium

`getValidTransitions()` collects target activity IDs from `transitions`, `decisions`, and `checkpoints` (`workflow-loader.ts:173–176`). `getTransitionList()` reads only `activity.transitions` (`workflow-loader.ts:193–201`), excluding decisions and checkpoints.

`validateActivityTransition` (`validation.ts:27`) uses `getValidTransitions`, but `validateTransitionCondition` (`validation.ts:110`) uses `getTransitionList`. A transition through a decision branch passes the first validator but produces a spurious warning from the second because the transition cannot be found.

---

### Low

#### BF-13 — Condition evaluation silently returns false on string/number type mismatches

**Location:** `src/schema/condition.schema.ts:60–70`
**Severity:** Low

`evaluateSimpleCondition()` uses `typeof value === 'number'` guards for comparison operators (`>`, `<`, `>=`, `<=`). When a variable holds string `"5"` (common from TOON decode, which does not distinguish numeric-looking strings from numbers) and is compared to number `3`, the type guard fails and the operator returns `false`. No type mismatch signal or coercion attempt is made. Workflow transitions with numeric conditions take the wrong branch silently.

---

#### BF-14 — `restore_state` attributes all decrypt failures to key rotation

**Location:** `src/tools/state-tools.ts:127–134`
**Severity:** Low

The `restore_state` handler wraps all decrypt errors in a bare `catch {}` and throws `new Error('Failed to decrypt session token from saved state. This typically occurs when the server key has been rotated...')`. The original crypto error type (`ERR_OSSL_EVP_UNABLE_TO_AUTHENTICATE_DATA`, auth tag mismatch, IV length error, malformed ciphertext) is destroyed. A corrupted state file, manually edited save, or truncated write is misdiagnosed as key rotation. The suggested remediation (deleting the key file) makes all previously saved states permanently unrecoverable.

---

#### BF-15 — All JSON responses pretty-printed for machine-to-machine protocol

**Location:** Tool handlers across `workflow-tools.ts`, `resource-tools.ts`, `state-tools.ts` (14 call sites using `JSON.stringify(data, null, 2)`)
**Severity:** Low

Every tool response is serialized with 2-space indentation, adding ~25–35% whitespace to payloads consumed exclusively by LLM agents. For a 50KB workflow response, pretty-printing adds ~15KB of whitespace that consumes tokens without semantic value. Over a 10-call session: ~50–70KB wasted allocation and ~5–10ms wasted serialization.

---

#### BF-16 — `readSkill` and `readResource` return unvalidated TOON decode as typed results

**Location:** `src/loaders/skill-loader.ts:78` (`tryLoadSkill`), `src/loaders/resource-loader.ts:107` (`readResource`)
**Severity:** Low

Both `readSkill` and `readResource` call `decodeToon<Skill>(content)` and `decodeToon<Resource>(content)` respectively with no Zod validation step. Their return types (`Result<Skill>`, `Result<Resource>`) imply validated data conforming to the schema. A malformed TOON file with a field name typo (e.g., `capbility` instead of `capability`) returns successfully with `result.success === true`, and consumers access `undefined` fields without warning.

This contrasts with workflow and activity loading, which both apply Zod validation after TOON decode. Skills and resources are the only content types with no validation checkpoint at any level.

---

## Corrections Required

### CR-01 — Require schema parameter in `decodeToon<T>()` (addresses BF-01, BF-16)

Change the signature of `decodeToon` at `src/utils/toon.ts:8–9` to require a Zod schema:

```typescript
function decodeToon<T>(content: string, schema: ZodType<T>): T
```

This forces validation at every call site, eliminates the safe/unsafe caller split, and removes three data corruption paths through rules-loader, skill-loader, and resource-loader. Estimated effort: ~5 LOC per call site (10 call sites).

### CR-02 — Replace bare catch blocks with diagnostic error propagation (addresses BF-02)

Replace the 13 bare `catch {}` blocks in loader modules with either:
- **Option A:** `Result<T[], Error>` return types with typed error propagation (breaks API shape; all callers must handle errors)
- **Option B:** Optional `DiagnosticAccumulator` parameter that collects errors alongside partial results (preserves API shape; no compiler enforcement)

Either option enables downstream caching and gives callers visibility into failure modes.

### CR-03 — Decode session token once and thread through call chain (addresses BF-03)

Modify `withAuditLog` at `src/logging.ts:83–105` to pass the decoded `SessionPayload` to the handler function. Modify `advanceToken` at `src/utils/session.ts:90–103` to accept an already-decoded payload. This eliminates 2 of 3 HMAC verifications per request.

### CR-04 — Distinguish "no constraint" from "missing data" in validation (addresses BF-04, BF-09)

Replace `return null` in `validateActivityTransition` and `validateSkillAssociation` (`src/utils/validation.ts`) with distinct return values or warning strings for missing-data cases. Enforce `initialActivity` on the first `next_activity` call when `token.act === ''`.

### CR-05 — Auto-initialize TraceStore sessions and log evictions (addresses BF-05)

Add `if (!this.sessions.has(sid)) this.initSession(sid)` guard to `TraceStore.append()` at `src/trace.ts:84`. Add logging to the eviction path at `trace.ts:72–77`.

### CR-06 — Add Zod validation to rules loading and differentiate error types (addresses BF-06)

Add schema validation after `decodeToon<Rules>()` in `readRules()` at `src/loaders/rules-loader.ts:43`. Return a distinct `RulesParseError` (not `RulesNotFoundError`) when the file exists but parsing or validation fails.

### CR-07 — Implement workflow cache with mtime invalidation (addresses BF-07)

Add an in-memory cache keyed by `(workflowDir, workflowId)` with filesystem mtime-based invalidation. This reduces repeated workflow loads from ~35–55ms to <0.1ms. Replace sequential file reads in `loadActivitiesFromDir` with `Promise.all` for parallel I/O. Replace `existsSync` calls with async alternatives or `readFile` + `ENOENT` catch.

### CR-08 — Return error result on activity validation failure (addresses BF-08)

Change `readActivityFromWorkflow()` at `src/loaders/activity-loader.ts:114–120` to return `err(...)` when `safeValidateActivity` fails, rather than `ok(decoded)`. If backward compatibility with older TOON files is needed, implement explicit schema versioning.

### CR-09 — Validate key length on EEXIST fallback path (addresses BF-10)

Add the same `key.length !== KEY_LENGTH` check at `src/utils/crypto.ts:42` that exists at `crypto.ts:28`.

### CR-10 — Derive security boundary from configuration (addresses BF-11)

Add `workspaceRoot` to `ServerConfig` at `src/config.ts`. Pass it to `validateStatePath()` at `src/tools/state-tools.ts:19` instead of reading `process.cwd()`.

### CR-11 — Unify transition scope in `getTransitionList` (addresses BF-12)

Extend `getTransitionList()` at `src/loaders/workflow-loader.ts:187–202` to include transitions from `decisions` and `checkpoints`, matching the scope of `getValidTransitions()`.

---

## Traceability

Each finding maps to its source artifact(s) and original finding ID(s) within that artifact.

| Finding | Severity | Source Artifact | Original IDs |
|---------|----------|----------------|--------------|
| BF-01 | Critical | `behavioral-synthesis.md` | C-1 |
| | | `behavioral-errors.md` | EB-17 |
| | | `behavioral-costs.md` | B1, B3 |
| | | `behavioral-changes.md` | HC-5 |
| | | `behavioral-promises.md` | LIE-05 |
| BF-02 | Critical | `behavioral-synthesis.md` | C-2 |
| | | `behavioral-errors.md` | EB-09 |
| | | `behavioral-costs.md` | W1 |
| | | `behavioral-changes.md` | HC-5 (callers) |
| | | `behavioral-promises.md` | LIE-01, LIE-04, LIE-06 |
| BF-03 | High | `behavioral-synthesis.md` | C-3 |
| | | `behavioral-errors.md` | EB-04 |
| | | `behavioral-costs.md` | W2, B2, B5, B8 |
| | | `behavioral-changes.md` | HC-4, HC-8 |
| | | `behavioral-promises.md` | LIE-14, LIE-11 |
| BF-04 | High | `behavioral-synthesis.md` | C-4 |
| | | `behavioral-errors.md` | EB-19, EB-20 |
| | | `behavioral-changes.md` | HC-4 |
| | | `behavioral-promises.md` | LIE-12 |
| BF-05 | High | `behavioral-synthesis.md` | C-5 |
| | | `behavioral-errors.md` | EB-14, EB-15, EB-16 |
| | | `behavioral-changes.md` | HC-3, P-3, P-10 |
| | | `behavioral-promises.md` | LIE-02 |
| BF-06 | High | `behavioral-synthesis.md` | C-6 |
| | | `behavioral-errors.md` | EB-11 |
| | | `behavioral-changes.md` | HC-5, P-5 |
| | | `behavioral-promises.md` | LIE-04 |
| BF-07 | High | `behavioral-synthesis.md` | Unified Law Table (Filesystem I/O) |
| | | `behavioral-errors.md` | EB-09 |
| | | `behavioral-costs.md` | W1, W4, W5, W6, B4 |
| | | `behavioral-changes.md` | HC-7, HC-10 |
| | | `behavioral-promises.md` | LIE-09 |
| BF-08 | Medium | `behavioral-synthesis.md` | Unified Law Table (Compatibility trap) |
| | | `behavioral-errors.md` | EB-12 |
| | | `behavioral-costs.md` | B3 |
| | | `behavioral-changes.md` | HC-5, P-6 |
| | | `behavioral-promises.md` | LIE-06 |
| BF-09 | Medium | `behavioral-synthesis.md` | C-4 (partial) |
| | | `behavioral-errors.md` | EB-19 |
| | | `behavioral-changes.md` | HC-4, P-4 |
| | | `behavioral-promises.md` | LIE-12 |
| BF-10 | Medium | `behavioral-errors.md` | EB-02, EB-03 |
| | | `behavioral-changes.md` | HC-1, P-1 |
| BF-11 | Medium | `behavioral-changes.md` | HC-7, P-7 |
| BF-12 | Medium | `behavioral-promises.md` | LIE-03 |
| BF-13 | Low | `behavioral-errors.md` | EB-23 |
| BF-14 | Low | `behavioral-errors.md` | EB-13 |
| BF-15 | Low | `behavioral-costs.md` | W3 |
| BF-16 | Low | `behavioral-synthesis.md` | C-1 (partial) |
| | | `behavioral-changes.md` | HC-5 |
| | | `behavioral-promises.md` | LIE-01 |

All source artifacts reside in:
`/home/mike/dev/workflow-server/.engineering/artifacts/planning/2026-03-28-behavioral-prism-analysis/`
