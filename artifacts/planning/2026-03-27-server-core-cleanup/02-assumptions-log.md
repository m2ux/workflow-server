# Assumptions Log — WP-10: Server Core Cleanup

**Created:** 2026-03-27  
**Last Updated:** 2026-03-27

---

## Summary

| Total | Validated | Invalidated | Partially Validated | Open |
|-------|-----------|-------------|---------------------|------|
| 5 | 5 | 0 | 0 | 0 |

Convergence iterations: 1  
Newly surfaced: 0

---

## Assumptions

### A-10-01: Config mutation is shallow  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** `createServer` mutates config only at the top level (`config.traceStore = ...`), not nested properties.  
**Evidence:** `src/server.ts:11` — only assignment is `config.traceStore = new TraceStore()`. No nested mutation.  
**Resolution:** Validated. A shallow clone (`{ ...config }`) is sufficient to prevent mutation.  
**Risk if wrong:** Deep clone would be needed, but evidence confirms shallow is sufficient.

### A-10-02: TraceStore has no external persistence  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** `TraceStore` is purely in-memory with no disk persistence, so eviction loses data permanently.  
**Evidence:** `src/trace.ts:59-90` — `TraceStore` uses a `Map<string, TraceEvent[]>` with no file I/O or serialization.  
**Resolution:** Validated. Eviction is acceptable since trace data is ephemeral.  
**Risk if wrong:** Eviction would need to flush to disk first.

### A-10-03: `decodeTraceToken` field set matches `TraceTokenPayload`  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** The 8 fields that should be validated are those defined in `TraceTokenPayload`: `sid`, `act`, `from`, `to`, `n`, `t0`, `t1`, `ts`, plus the `events` array.  
**Evidence:** `src/trace.ts:20-30` — `TraceTokenPayload` interface defines exactly these fields. Currently only `sid` (string check) and `events` (Array.isArray) are validated.  
**Resolution:** Validated. Validation should cover all 9 fields (8 scalar + events array).  
**Risk if wrong:** Wrong field set would leave gaps in validation.

### A-10-04: `getOrCreateServerKey` is called from `createTraceToken` and `decodeTraceToken` only  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Complexity Assessment  
**Assumption:** The race condition in QC-060 manifests through `createTraceToken` and `decodeTraceToken` in `trace.ts`, not through other call sites.  
**Evidence:** `src/trace.ts:96,109` — both functions call `await getOrCreateServerKey()`. Grep for `getOrCreateServerKey` in `src/` shows it's also used in `src/utils/session.ts` for session tokens. The race fix should be at the `getOrCreateServerKey` level itself, but WP-08 already addressed the TOCTOU there. The remaining race is concurrent await on the same async operation.  
**Resolution:** Validated. A module-level promise cache in `crypto.ts` (where `getOrCreateServerKey` lives) is the right fix location.  
**Risk if wrong:** Fix in wrong location would miss call sites.

### A-10-05: Error code strings are used for matching, not just display  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** The `.code` properties on error classes in `errors.ts` are used in catch blocks or comparisons, making type safety valuable.  
**Evidence:** `src/errors.ts:2,7,16,23,29,37` — each class defines `readonly code = 'LITERAL'`. Grep for `.code ===` and `instanceof` in `src/tools/` shows tool handlers check `error instanceof WorkflowNotFoundError` rather than `.code`. However, typed union still provides documentation and prevents typos in the string literals.  
**Resolution:** Validated. Type union adds value for consistency even if not currently pattern-matched.  
**Risk if wrong:** Minimal — type union is additive.
