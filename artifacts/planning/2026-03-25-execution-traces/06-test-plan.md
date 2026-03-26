# Test Plan

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Revised:** 2026-03-25 (v4 — final: mechanical/semantic split, full-data trace tokens)

---

## Test Strategy

### Approach

Three-tier testing:

1. **Unit tests** (`tests/trace.test.ts`, `tests/session.test.ts`) — TraceStore, trace token encode/decode, session sid/aid
2. **Integration tests** (`tests/mcp-server.test.ts`) — End-to-end via MCP client covering tool renames, trace token emission, trace resolution, manifest handling
3. **No separate semantic trace tests** — semantic tracing is agent behavior governed by TOON skill instructions, not server code

### Test Infrastructure

- **Framework:** Vitest (existing)
- **MCP testing:** `InMemoryTransport` + `Client` (existing pattern)
- **Crypto:** Tests use real HMAC signing (server key auto-generated in test)

---

## Test Cases

### Unit: TraceStore + Trace Tokens (`tests/trace.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| UT-1 | `initSession` creates empty array | `getEvents(sid)` → `[]` |
| UT-2 | `append` adds event | Event in `getEvents()` |
| UT-3 | Events maintain order | Chronological |
| UT-4 | Unknown session → empty | `[]`, no throw |
| UT-5 | `listSessions` returns all | All initialized sids |
| UT-6 | Sessions are isolated | A's events not in B |
| UT-7 | `getSegmentAndAdvanceCursor` returns correct slice | First call: all events; second call: only new events |
| UT-8 | Cursor advances after segment emission | Subsequent segment excludes already-emitted events |
| UT-9 | `createTraceToken` → `decodeTraceToken` round-trip | Decoded events match originals |
| UT-10 | Tampered token rejected | `decodeTraceToken` throws on modified payload |
| UT-11 | Token with invalid HMAC rejected | Throws signature verification error |
| UT-12 | Events use compressed field names | `ts`, `ms`, `s`, `wf`, `act`, `aid` present |

### Unit: Session (`tests/session.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| UT-13 | Token has `sid` field | Non-empty string |
| UT-14 | `sid` is UUID format | Matches v4 pattern |
| UT-15 | `sid` preserved across advance | Same before/after |
| UT-16 | Token has `aid` field | Defaults to `""` |
| UT-17 | `aid` settable via advanceToken | Updated value persists |
| UT-18 | `aid` preserved when not in updates | Unchanged |

### Integration: Tool Renames (`tests/mcp-server.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| IT-1 | `next_activity` loads activity definition | Returns activity JSON |
| IT-2 | `next_activity` accepts step_manifest | Validates against leaving activity |
| IT-3 | `next_activity` accepts activity_manifest | Advisory validation, no errors for valid |
| IT-4 | `get_activities` returns transition list | Array of `{ to, condition?, isDefault? }` |
| IT-5 | Old name `get_activity` fails | Tool not found error |

### Integration: Trace Token Lifecycle (`tests/mcp-server.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| IT-6 | `start_session` initializes trace | `get_trace` returns events |
| IT-7 | `next_activity` returns `_meta.trace_token` | Non-empty string present |
| IT-8 | Accumulated tokens resolve via `get_trace(trace_tokens)` | Returns all mechanical events |
| IT-9 | Token events are in chronological order | Timestamps monotonically increasing |
| IT-10 | Token events have compressed field names | `ts`, `ms`, `s`, `wf`, `act` present |
| IT-11 | Validation warnings in token events | `vw` array present when validation warns |
| IT-12 | Error events in tokens | `s: 'error'`, `err` present |
| IT-13 | `get_trace` without tokens returns in-memory trace | Full session from TraceStore |
| IT-14 | `get_trace` excluded from its own output | Not in returned events |
| IT-15 | `session_token` not in trace events | No raw token value anywhere |
| IT-16 | Exempt tools not in trace | `help`, `health_check` absent |
| IT-17 | `agent_id` in events when set via token | `aid` field populated |
| IT-18 | Multiple trace tokens from sequential transitions | Each token covers its own segment, no overlap |
| IT-19 | Invalid/tampered trace token handled gracefully | Error or receipt, no crash |
| IT-20 | `get_trace` for unknown session → empty | `{ events: [] }` |

### Acceptance Criteria Traceability

| Acceptance Criterion (Issue #63) | Test Cases |
|----------------------------------|------------|
| Trace shows ordered list of activities and steps | IT-8, IT-9, IT-10 |
| Trace includes checkpoint encounters | IT-10 (checkpoint_id in wf/act context) |
| Trace retrievable after session | IT-6, IT-8, IT-13 |
| Partial traces on failure | IT-12 |
| Sufficient context to identify failure | IT-11, IT-12 |
| Traces associated with workflow ID and version | IT-10 (wf field) |
| Multiple traces comparable | UT-5, UT-6 |

---

## Pass Criteria

- All existing tests pass (`npm test`) — zero regression
- All new unit tests pass (UT-1 through UT-18)
- All new integration tests pass (IT-1 through IT-20)
- `npm run typecheck` passes
- No `session_token` values in trace output (IT-15)
- Trace tokens survive HMAC round-trip (UT-9)
