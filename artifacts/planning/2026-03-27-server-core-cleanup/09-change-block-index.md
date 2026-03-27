# Change Block Index — WP-10: Server Core Cleanup

**Generated:** 2026-03-27  
**Branch:** fix/wp10-server-core-cleanup  
**Base:** main  
**Estimated review time:** ~4 minutes (8 files × 30s/file)

---

| Row | File | Lines Changed | Findings Addressed | Summary |
|-----|------|--------------|-------------------|---------|
| 1 | `src/config.ts` | +15 / -4 | QC-113, QC-116 | Add `ResolvedServerConfig` type; `envOrDefault` helper treats empty env vars as undefined |
| 2 | `src/errors.ts` | +17 / -7 | QC-117 | `ERROR_CODES` const object + `ErrorCode` union type; all error classes use typed `code` |
| 3 | `src/index.ts` | +2 / -2 | QC-114 | Export `ResolvedServerConfig`; remove redundant `.catch()` on `main()` |
| 4 | `src/logging.ts` | +34 / -12 | QC-059, QC-118, QC-121 | Restructure `withAuditLog` try/catch to prevent double-append; `truncateDataValues` for `logWarn`/`logError`; remove `timestamp` from `AuditEvent` (added by `logAuditEvent`) |
| 5 | `src/result.ts` | +8 / -1 | QC-119 | `unwrap` copies enumerable properties from non-Error objects onto the wrapped Error |
| 6 | `src/server.ts` | +12 / -16 | QC-056, QC-120 | Shallow-clone config via spread; use `ResolvedServerConfig`; remove hardcoded tool list |
| 7 | `src/trace.ts` | +37 / -5 | QC-057, QC-058, QC-115 | `TraceStore` constructor with `maxSessions` + LRU eviction; `validateTraceTokenPayload` for all 9 fields; full UUID for `spanId` |
| 8 | `src/utils/crypto.ts` | +11 / -0 | QC-060 | Module-level `keyPromise` cache prevents concurrent `getOrCreateServerKey` races |

---

## Verification

- `npm run typecheck` — exit 0
- `npm test` — 197 tests passing (10 test files)
