# WP-10: Server Core Cleanup

## Scope

**In scope:**
- QC-056: `createServer` mutates passed config
- QC-057: `TraceStore.sessions` memory leak
- QC-058: `decodeTraceToken` validates only 2 of 8 fields
- QC-059: `appendTraceEvent` double-append on error
- QC-060: Concurrent `getOrCreateServerKey` race
- QC-113–QC-121: 9 Low-severity server core findings

**Out of scope:**
- Utils-level crypto changes (WP-08 handles `getOrCreateServerKey` TOCTOU)

**Files:** `src/index.ts`, `src/server.ts`, `src/config.ts`, `src/errors.ts`, `src/logging.ts`, `src/trace.ts`, `src/result.ts`

## Dependencies

None.

## Effort

14 findings across 7 files. Medium scope.

## Success Criteria

- `createServer` does not mutate the passed config object
- `TraceStore` has a session eviction or size limit
- `decodeTraceToken` validates all fields
- Error code strings use a typed union
- `npm run typecheck` and `npm test` pass
