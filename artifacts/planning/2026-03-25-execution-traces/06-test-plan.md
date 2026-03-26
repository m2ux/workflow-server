# Test Plan

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Revised:** 2026-03-25 (v3 — tool renames, two-level manifests, agent ID, validation capture)

---

## Test Strategy

### Approach

Three-tier testing:

1. **Unit tests** (`tests/trace.test.ts`, `tests/session.test.ts`) — TraceStore, session ID/agent ID
2. **Schema tests** (`tests/schema-validation.test.ts`) — Extended step manifest, new activity manifest
3. **Integration tests** (`tests/mcp-server.test.ts`) — End-to-end via MCP client covering tool renames, trace capture, manifest handling

### Test Infrastructure

- **Framework:** Vitest (existing)
- **MCP testing:** `InMemoryTransport` + `Client` (existing pattern)
- **No mocks needed:** All in-process

---

## Test Cases

### Unit: TraceStore (`tests/trace.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| UT-1 | `initSession` creates empty array | `getEvents(sid)` → `[]` |
| UT-2 | `append` adds event | Event in `getEvents()` |
| UT-3 | Events maintain order | Chronological |
| UT-4 | Unknown session → empty | `[]`, no throw |
| UT-5 | `listSessions` returns all | All initialized sids |
| UT-6 | Sessions are isolated | A's events not in B |
| UT-7 | TraceEvent has OTel fields | traceId, spanId, name, timestamp, duration_ms, status, attributes |

### Unit: Session (`tests/session.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| UT-8 | Token has `sid` field | Non-empty string |
| UT-9 | `sid` is UUID format | Matches v4 pattern |
| UT-10 | `sid` preserved across advance | Same before/after |
| UT-11 | Token has `aid` field | Defaults to `""` |
| UT-12 | `aid` settable via advanceToken | Updated value persists |
| UT-13 | `aid` preserved when not in updates | Unchanged |

### Integration: Tool Renames (`tests/mcp-server.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| IT-1 | `next_activity` loads activity definition | Returns activity JSON with steps, checkpoints |
| IT-2 | `next_activity` accepts step_manifest | Validates against leaving activity |
| IT-3 | `next_activity` accepts activity_manifest | Captures in trace attributes |
| IT-4 | `next_activity` validates transition | Warning if invalid transition |
| IT-5 | `get_activities` returns transition list | Array of `{ to, condition?, isDefault? }` |
| IT-6 | Old name `get_activity` returns error | Tool not found |
| IT-7 | Old name `next_activity` (as query) returns error | Tool not found |

### Integration: Extended Manifests (`tests/mcp-server.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| IT-8 | Step manifest with `decision_branch` accepted | No validation error |
| IT-9 | Step manifest with `loop_iteration` + `loop_total` accepted | No validation error |
| IT-10 | Step manifest with `checkpoint_response` accepted | No validation error |
| IT-11 | Activity manifest with basic entries accepted | No validation error |
| IT-12 | Activity manifest captured in trace attributes | Appears in get_trace output |

### Integration: Trace Capture (`tests/mcp-server.test.ts`)

| ID | Test Case | Expected |
|----|-----------|----------|
| IT-13 | `start_session` initializes trace | `get_trace` returns events including start |
| IT-14 | Tool calls appear in trace | `next_activity`, `get_skills` captured |
| IT-15 | Events in chronological order | Timestamps monotonically increasing |
| IT-16 | Semantic attributes present | `workflow_id`, `activity_id` in attributes |
| IT-17 | Validation warnings in trace | Events include `validation_warnings[]` |
| IT-18 | Error events captured | `status: "error"`, `error_message` present |
| IT-19 | Exempt tools not in trace | `help`, `health_check` absent |
| IT-20 | `get_trace` excluded from own trace | Not in returned events |
| IT-21 | `session_token` not in attributes | Privacy: no raw token |
| IT-22 | `traceId` matches session `sid` | All events share sid |
| IT-23 | `agent_id` in trace when set | Appears in attributes |
| IT-24 | `get_trace` for unknown session → empty | `{ events: [] }` |
| IT-25 | `duration_ms` non-negative on all events | ≥ 0 |

### Acceptance Criteria Traceability

| Acceptance Criterion (Issue #63) | Test Cases |
|----------------------------------|------------|
| Trace shows ordered list of activities and steps | IT-14, IT-15, IT-16, IT-2, IT-3 |
| Trace includes checkpoint encounters and resolution | IT-10, IT-12 (checkpoint_response in manifest) |
| Trace retrievable after session | IT-13, IT-15 |
| Partial traces on failure | IT-18 |
| Sufficient context to identify failure | IT-17, IT-18, IT-25 |
| Traces associated with workflow ID and version | IT-16, IT-22 |
| Multiple traces comparable | UT-5, UT-6 |

---

## Pass Criteria

- All existing tests pass (`npm test`) — zero regression
- All new unit tests pass (UT-1 through UT-13)
- All new integration tests pass (IT-1 through IT-25)
- `npm run typecheck` passes
- No `session_token` values in trace output (IT-21)
