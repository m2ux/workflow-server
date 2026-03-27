# Work Package Plan — WP-10: Server Core Cleanup

**Created:** 2026-03-27  
**Status:** Ready

---

## Approach

Apply targeted fixes to each of the 14 findings in the 7 affected files. Each fix is self-contained and does not depend on other fixes within this package. Changes are additive or corrective — no public API signatures change.

---

## Changes by File

### 1. `src/server.ts` (QC-056, QC-120)

**QC-056: `createServer` mutates passed config**  
- Shallow-clone config before assigning `traceStore`: `const cfg = { ...config };`
- Assign `cfg.traceStore = new TraceStore()` on the clone
- Use `cfg` throughout the function

**QC-120: Tool list logged as hardcoded string array**  
- Remove hardcoded tool name array from the `logInfo` call
- Log tool count or derive tool names dynamically from `server` if MCP SDK exposes them, otherwise remove the misleading list

### 2. `src/trace.ts` (QC-057, QC-058, QC-060, QC-115)

**QC-057: `TraceStore.sessions` grows without bound**  
- Add a `maxSessions` parameter (default: 1000) to `TraceStore` constructor
- On `initSession`, if `sessions.size >= maxSessions`, evict the oldest session (first key in Map iteration order — insertion-ordered)
- Also evict corresponding cursor entry

**QC-058: `decodeTraceToken` validates only 2 of 8 fields**  
- After JSON parse, validate all `TraceTokenPayload` fields: `sid` (string), `act` (string), `from` (number), `to` (number), `n` (number), `t0` (number), `t1` (number), `ts` (number), `events` (array)
- Throw descriptive error listing which fields failed validation

**QC-060: Concurrent `getOrCreateServerKey` race**  
- Add a module-level `let keyPromise: Promise<Buffer> | null = null` in `crypto.ts`
- Wrap `getOrCreateServerKey` body: if `keyPromise` exists, return it; otherwise set `keyPromise = doGetOrCreate()` and return that
- On rejection, clear `keyPromise` to allow retry

**QC-115: `randomUUID().slice(0, 8)` truncates to 32 bits entropy**  
- Replace `randomUUID().slice(0, 8)` with `randomUUID()` (full 128-bit UUID) for `spanId`
- SpanId is internal trace data, full UUID costs nothing

### 3. `src/logging.ts` (QC-059, QC-118, QC-121)

**QC-059: `appendTraceEvent` double-append on error**  
- In `withAuditLog`, the trace append is inside the try/catch which means if `appendTraceEvent` itself throws during the success path, the error catch re-appends. Move the success-path `appendTraceEvent` call after the `return result` by restructuring: capture result, do audit log, do trace append, then return. Use a `finally`-style pattern or explicit variable.
- Actually, looking at the code more carefully: the issue is that if `handler()` succeeds but `appendTraceEvent` throws, the catch block will call `appendTraceEvent` again with 'error' status. Fix: wrap only the `appendTraceEvent` call in its own try-catch, or move the trace append outside the main try-catch.

**QC-118: `logWarn` unbounded JSON output**  
- Add a size guard: truncate `data` values that exceed a threshold (e.g., 8KB) before serialization
- Apply to `logWarn` and `logError` — `logInfo` is typically controlled input

**QC-121: Audit event timestamp redundancy**  
- `logAuditEvent` already serializes the `event` object which contains `timestamp`, then `logInfo`/`logError` also add `timestamp`. Remove the redundant `timestamp` from the `AuditEvent` interface and let the logging functions handle it consistently.
- Actually, `logAuditEvent` is its own function using `console.error(JSON.stringify({ type: 'audit', ...event }))` — it does not call `logInfo`. The `AuditEvent.timestamp` is set by the caller in `withAuditLog`. The redundancy is that `withAuditLog` creates `new Date().toISOString()` at both the audit event creation and the separate log functions. Fix: remove the `timestamp` field from `AuditEvent` and have `logAuditEvent` add it automatically, consistent with `logInfo`/`logWarn`/`logError`.

### 4. `src/config.ts` (QC-113, QC-116)

**QC-113: Optional config fields always defined after startup**  
- Change `schemaPreamble?: string` and `traceStore?: TraceStore` to required fields with explicit initialization
- Use a `RuntimeConfig` type that extends `ServerConfig` with required fields, or use a builder pattern
- Simpler approach: keep `ServerConfig` as-is for the initial `loadConfig()` return, but introduce a `ResolvedServerConfig` interface where `schemaPreamble` and `traceStore` are required. Use `ResolvedServerConfig` in `createServer` and downstream.

**QC-116: Empty env var treated as valid config**  
- In `loadConfig`, treat empty string env vars (after trim) the same as undefined
- Add helper: `const envOrDefault = (key: string, def: string) => { const v = process.env[key]?.trim(); return v ? v : def; };`

### 5. `src/index.ts` (QC-114)

**QC-114: Double error handler in `main()`**  
- `main()` has try/catch, and `main().catch()` also handles errors
- Remove the `.catch()` on `main()` since the try/catch inside already handles errors and calls `process.exit(1)`
- Or remove the inner try/catch and let the outer `.catch()` handle it
- Best approach: keep the inner try/catch (it has structured logging) and remove the outer `.catch()`

### 6. `src/errors.ts` (QC-117)

**QC-117: Error code strings not type-safe**  
- Define a `const ErrorCode` union type from the existing code string literals
- `export const ERROR_CODES = { ... } as const;`
- `export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];`
- Update each error class to use `ErrorCode` type for the `code` property

### 7. `src/result.ts` (QC-119)

**QC-119: `unwrap` loses `.code` and custom properties**  
- When `result.error` is not an `Error` instance, create a new `Error` but also copy enumerable properties from the original error
- When `result.error` is an `Error` instance, return it as-is (it already preserves `.code` and custom props)
- The current code does `throw result.error instanceof Error ? result.error : new Error(String(result.error))` — the `Error` branch is fine but the non-Error branch loses properties. Fix: for non-Error values that are objects, copy properties onto the new Error.

---

## Implementation Order

1. `src/errors.ts` — type definitions used by others
2. `src/config.ts` — config types used by server.ts
3. `src/result.ts` — standalone utility
4. `src/trace.ts` — trace store and token validation
5. `src/logging.ts` — logging fixes
6. `src/server.ts` — uses config and trace
7. `src/index.ts` — entry point, uses everything

---

## Out of Scope

- `getOrCreateServerKey` internal implementation (WP-08)
- Test file changes (unless existing tests break)
- Tool handler changes
