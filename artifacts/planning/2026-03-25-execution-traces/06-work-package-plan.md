# Work Package Plan

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25

---

## Design Approach

### Strategy: Server-Side Trace Accumulation

Add server-side trace accumulation that automatically captures every tool call in a workflow session. The server maintains an in-process `Map<string, TraceEvent[]>` keyed by session ID. The existing `withAuditLog` wrapper is augmented to also append events to the trace store. A new `get_trace` MCP tool exposes accumulated traces for retrieval.

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trace location | Server-side (in-process) | Automatic capture without agent cooperation; traces survive agent crashes; meets AC: "Every tool call captured" |
| Session identity | New UUID `sid` field in `SessionPayload` | Second-precision `ts` field has theoretical collision risk; UUID is robust and trivial to add |
| Interception point | Augment `withAuditLog` | Already wraps all 12 tool handlers; avoids double-wrapping |
| Trace storage | `Map<string, TraceEvent[]>` | Single-process stdio server; no concurrency; traces scoped to server lifetime |
| Retrieval mechanism | New `get_trace` MCP tool | Consistent with existing tool-based API; no new interfaces needed |
| Trace format | Flat `TraceEvent` array | Reuses field names from `HistoryEntrySchema` where applicable for consistency |

### Reuse of Existing Infrastructure

- **`HistoryEventTypeSchema`** (state.schema.ts): Defines 21 event types. Server-side traces use a subset (tool-call-level events) with compatible naming.
- **`withAuditLog`** (logging.ts): Already captures tool name, parameters, result status, duration. Augmented to also append to trace store.
- **`SessionPayload`** (session.ts): Extended with `sid` (session ID) field for trace keying.
- **`ServerConfig`** (config.ts): Extended to carry the trace store instance.

---

## Task Breakdown

### T1: Add session ID to SessionPayload
**File:** `src/utils/session.ts`  
**Change:** Add `sid: string` field to `SessionPayload` interface. Generate UUID in `createSessionToken()`. Include `sid` in encode/decode. Update type guards in `decode()`.  
**Dependencies:** None  
**Estimate:** 15m

### T2: Create trace store module
**File:** `src/trace.ts` (new)  
**Change:** Create `TraceEvent` interface (timestamp, tool, params summary, result, duration_ms, session context fields). Create `TraceStore` class with `Map<string, TraceEvent[]>`, methods: `initSession(sid)`, `append(sid, event)`, `getEvents(sid)`, `listSessions()`.  
**Dependencies:** None  
**Estimate:** 20m

### T3: Augment withAuditLog for trace capture
**File:** `src/logging.ts`  
**Change:** Add optional `TraceStore` parameter to `withAuditLog`. When present, extract `session_token` from params, decode the `sid`, and append a `TraceEvent`. For exempt tools (no session token), skip trace append. Preserve existing stderr logging behavior.  
**Dependencies:** T1, T2  
**Estimate:** 25m

### T4: Wire TraceStore into server
**File:** `src/server.ts`, `src/config.ts`  
**Change:** Add `traceStore?: TraceStore` to `ServerConfig`. Instantiate in `createServer()`. Pass to `registerWorkflowTools()`, `registerResourceTools()`, `registerStateTools()`. Each registration function passes the store to `withAuditLog`.  
**Dependencies:** T2, T3  
**Estimate:** 15m

### T5: Initialize trace on start_session
**File:** `src/tools/resource-tools.ts`  
**Change:** In `start_session` handler, after creating the session token, call `traceStore.initSession(sid)` and append a `session_started` event. The `sid` is extracted from the newly created token.  
**Dependencies:** T1, T4  
**Estimate:** 10m

### T6: Add get_trace MCP tool
**File:** `src/tools/workflow-tools.ts` (or new `src/tools/trace-tools.ts`)  
**Change:** Register `get_trace` tool. Accepts `session_token`. Decodes `sid` from token. Returns accumulated trace events from store. Returns empty array if session not found.  
**Dependencies:** T1, T2, T4  
**Estimate:** 15m

### T7: Update exports and server registration
**File:** `src/index.ts`, `src/server.ts`  
**Change:** Export new types (`TraceEvent`, `TraceStore`). Register `get_trace` in server tool list. Update `logInfo` call with new tool name.  
**Dependencies:** T6  
**Estimate:** 10m

### T8: Write tests
**File:** `tests/trace.test.ts` (new), updates to `tests/mcp-server.test.ts`  
**Change:** Unit tests for TraceStore (init, append, retrieve, list). Integration tests via MCP client: start_session → tool calls → get_trace → verify trace contains all calls. Test exempt tools are not traced. Test error events are captured.  
**Dependencies:** T1-T7  
**Estimate:** 45m

---

## Task Ordering

```
T1 (session ID) ──┐
                   ├── T3 (augment withAuditLog) ── T4 (wire into server) ──┐
T2 (trace store) ──┘                                                        ├── T5 (init on start_session)
                                                                             ├── T6 (get_trace tool)
                                                                             └── T7 (exports)
                                                                                    └── T8 (tests)
```

**Critical path:** T1 → T3 → T4 → T6 → T8

---

## Estimated Total

| Phase | Estimate |
|-------|----------|
| Implementation (T1-T7) | ~1.5-2h |
| Tests (T8) | ~45m |
| **Total** | **~2-3h agentic time** |

---

## Out of Scope

- Agent-side history accumulation (existing `addHistoryEvent` schema — separate concern)
- Cross-session trace aggregation
- Trace persistence beyond server lifetime
- Real-time trace streaming
- Trace visualization or dashboards
