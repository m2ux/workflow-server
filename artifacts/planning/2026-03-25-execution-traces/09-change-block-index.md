# Change Block Index

**Work Package:** Execution Traces for Workflows (#63)  
**Branch:** `enhancement/63-execution-traces` vs `main`  
**Generated:** 2026-03-25  
**Total:** 15 files, +799 / -63 lines  
**Estimated review time:** ~8 minutes (30s per change block)

---

| Row | File | +/- | Description |
|-----|------|-----|-------------|
| 1 | `.engineering` | 1/1 | Submodule pointer update |
| 2 | `src/config.ts` | 4/0 | Add `traceStore` to ServerConfig |
| 3 | `src/index.ts` | 2/0 | Export trace module types |
| 4 | `src/logging.ts` | 66/3 | withAuditLog trace capture + validation extraction |
| 5 | `src/server.ts` | 6/3 | Create TraceStore in createServer, update tool list |
| 6 | `src/tools/resource-tools.ts` | 14/2 | Init trace on start_session, pass traceOpts |
| 7 | `src/tools/state-tools.ts` | 6/3 | Accept config param, pass traceOpts |
| 8 | `src/tools/workflow-tools.ts` | 86/13 | Tool renames, activity_manifest, trace token emission, get_trace tool |
| 9 | `src/trace.ts` | 114/0 | NEW: TraceStore, TraceEvent, trace token encode/decode |
| 10 | `src/utils/session.ts` | 9/1 | Add sid (UUID) + aid (agent ID) to SessionPayload |
| 11 | `src/utils/validation.ts` | 25/0 | ActivityManifestEntry + validateActivityManifest |
| 12 | `tests/mcp-server.test.ts` | 215/34 | Tool renames + 10 trace integration tests |
| 13 | `tests/session.test.ts` | 47/1 | 6 tests for sid/aid fields |
| 14 | `tests/skill-loader.test.ts` | 2/2 | Update tool name assertions |
| 15 | `tests/trace.test.ts` | 202/0 | NEW: 20 unit tests for TraceStore + tokens |
