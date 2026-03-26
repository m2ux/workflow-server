# Test Plan

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25

---

## Test Strategy

### Approach

Two-tier testing matching the existing codebase patterns:

1. **Unit tests** (`tests/trace.test.ts`) — TraceStore class, session ID generation, trace event construction
2. **Integration tests** (`tests/mcp-server.test.ts` additions) — End-to-end via MCP client: start_session → tool calls → get_trace → verify

### Test Infrastructure

- **Framework:** Vitest (existing)
- **MCP testing:** `InMemoryTransport` + `Client` from `@modelcontextprotocol/sdk` (existing pattern in `mcp-server.test.ts`)
- **No mocks needed:** TraceStore is in-process; MCP integration tests use real server with in-memory transport

---

## Test Cases

### Unit Tests: TraceStore

| ID | Test Case | Requirement | Expected Result |
|----|-----------|-------------|-----------------|
| UT-1 | `initSession` creates empty trace array | US-1: Trace shows ordered list | `getEvents(sid)` returns `[]` |
| UT-2 | `append` adds event to session | US-1: Every tool call captured | Event appears in `getEvents(sid)` |
| UT-3 | Events maintain insertion order | US-1: Ordered list | Events returned in chronological order |
| UT-4 | `getEvents` for unknown session returns empty | US-2: Partial traces | Returns `[]`, does not throw |
| UT-5 | `listSessions` returns all initialized sessions | US-3: Multiple traces comparable | Returns array of session IDs |
| UT-6 | Multiple sessions are isolated | US-3: Traces associated with workflow | Events from session A not in session B |

### Unit Tests: Session ID

| ID | Test Case | Requirement | Expected Result |
|----|-----------|-------------|-----------------|
| UT-7 | `createSessionToken` produces token with `sid` field | Trace keying | Decoded token has non-empty `sid` |
| UT-8 | `sid` is a valid UUID format | Collision avoidance | Matches UUID v4 pattern |
| UT-9 | `advanceToken` preserves `sid` across advances | Session identity | Same `sid` before and after advance |

### Integration Tests: Trace Capture

| ID | Test Case | Requirement | Expected Result |
|----|-----------|-------------|-----------------|
| IT-1 | `start_session` initializes a trace | US-1: Trace retrievable | `get_trace` returns events including `session_started` |
| IT-2 | Workflow tool calls appear in trace | US-1: Every tool call captured | `get_activity`, `get_skills`, `next_activity` all appear |
| IT-3 | `get_trace` returns events in order | US-1: Ordered list | Events sorted by timestamp, match call order |
| IT-4 | Trace includes workflow semantic fields | US-1: Activities and steps | Events contain `workflow_id`, `activity_id` when present |
| IT-5 | Step manifest data captured in trace | US-1: Steps completed | `get_activity` call with `step_manifest` includes manifest in event data |
| IT-6 | Failed tool calls appear in trace | US-2: Partial traces on failure | Error events have `result: 'error'` and `error_message` |
| IT-7 | Exempt tools not traced to session | Correctness | `help`, `health_check` do not appear in session trace |
| IT-8 | Trace contains `duration_ms` for each event | Debugging utility | Every event has non-negative `duration_ms` |
| IT-9 | `get_trace` for unknown session returns empty | Robustness | Returns `{ events: [] }`, no error |
| IT-10 | `get_trace` itself does NOT appear in its own trace | No recursion | Calling `get_trace` does not add infinite events |

### Acceptance Criteria Traceability

| Acceptance Criterion | Test Cases |
|---------------------|------------|
| Trace shows ordered list of activities entered and steps completed | IT-2, IT-3, IT-4, IT-5 |
| Trace includes checkpoint encounters and resolution chosen | IT-4 (checkpoint_id in params) |
| Trace is retrievable after workflow session ends | IT-1, IT-3 |
| Incomplete/failed executions produce partial traces | IT-6 |
| Trace data includes sufficient context to identify failure | IT-6 |
| Traces associated with workflow ID and version | IT-4 (workflow_id in events) |
| Multiple traces for same workflow comparable | UT-5, UT-6 |

---

## Pass Criteria

- All existing tests pass (`npm test`) — zero regression
- All new unit tests pass
- All new integration tests pass
- `npm run typecheck` passes — no type errors
