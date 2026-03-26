# Work Package Plan

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Revised:** 2026-03-25 (v4 — final: mechanical/semantic split, full-data trace tokens)

---

## Design Approach

### Two-Layer Trace Architecture

| Layer | Owner | What | Where |
|-------|-------|------|-------|
| **Mechanical** | Server (`withAuditLog`) | Tool calls, timing, duration, status, errors, validation warnings | Full-data HMAC trace tokens in `_meta.trace_token` |
| **Semantic** | Agent (skill instructions) | Step outputs, checkpoint responses, decisions, loops, variables | Planning folder files (agent-written) |

### How It Works

1. Every tool call passes through `withAuditLog`, which builds a mechanical `TraceEvent` (tool name, timestamps, duration, status, validation warnings, workflow/activity position)
2. On `next_activity` (the activity transition call), the server packages all events since the last transition into a **full-data trace token** — an HMAC-signed, base64url-encoded blob containing the raw events
3. The token is returned in `_meta.trace_token`. The orchestrator appends it to an array (opaque — never parsed)
4. At any point, `get_trace` decodes the accumulated tokens and returns the full mechanical trace
5. Meanwhile, the agent writes semantic trace data (step outputs, decisions, checkpoint responses) to files in the planning folder per skill instructions

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Trace split** | Mechanical (server) + Semantic (agent) | Each side owns its data; no semantic bloat in tokens |
| **Token format** | Full-data HMAC-signed (not coordinate-only) | Self-contained — survives server restart; no in-memory dependency for resolution |
| **Field naming** | Compressed (`ts`, `ms`, `s`, `wf`, `act`, `aid`) | Tokens are opaque to agents; minimizes token size (~189 bytes/event) |
| **Tool rename** | `get_activity` → `next_activity`, `next_activity` → `get_activities` | Clearer semantics: commit vs query |
| **Token extension** | `sid` (UUID) + `aid` (agent ID) | Session identity + worker attribution |
| **Validation capture** | `_meta.validation` extracted into trace events | Essential diagnostic data |
| **Step manifest** | Lean: `step_id` + `output` only (on `next_activity`) | Structural validation only; semantic detail in agent trace |
| **Activity manifest** | Lean: `activity_id`, `outcome`, `transition_condition` (on `next_activity`) | Structural validation; detailed content in agent trace |
| **Self-exclusion** | `get_trace` excluded from trace capture | Prevents recursion |
| **Privacy** | `session_token` redacted from events | HMAC credential |

### Visual Reference

See [Solution Diagrams](04-solution-diagrams.md) for architecture and sequence flows.

---

## Task Breakdown

### Phase 1: Tool Rename

#### T1: Rename `get_activity` → `next_activity` and `next_activity` → `get_activities`
**Files:** `src/tools/workflow-tools.ts`, `src/server.ts`, `tests/mcp-server.test.ts`  
**Changes:**
- Rename both tool registrations, `withAuditLog` names, and descriptions (single atomic commit)
- Update ~20+ references in `workflows/` TOON files (meta skills, rules, audit workflows)
- Update all test references (~33 occurrences in `mcp-server.test.ts`)  
**Dependencies:** None  
**Estimate:** 25m

### Phase 2: Token + Trace Infrastructure

#### T2: Extend SessionPayload with `sid` and `aid`
**Files:** `src/utils/session.ts`  
**Changes:**
- Add `sid: string` and `aid: string` to `SessionPayload`
- Add `aid?: string` to `SessionAdvance`
- `createSessionToken()`: `sid: randomUUID()`, `aid: ''`
- `decode()`: add type guards for `sid` and `aid`  
**Dependencies:** None  
**Estimate:** 15m

#### T3: Create trace module
**File:** `src/trace.ts` (new)  
**Changes:**
- `TraceEvent` interface (compressed fields): `traceId`, `spanId`, `name`, `ts` (Unix seconds), `ms` (duration), `s` ("ok"|"error"), `err?` (error message), `wf`, `act`, `aid`, `vw?` (validation warnings array)
- `TraceStore` class:
  - `sessions: Map<string, TraceEvent[]>`
  - `cursors: Map<string, number>` (last-emitted index per session)
  - `initSession(sid)`, `append(sid, event)`, `getEvents(sid)`, `listSessions()`
  - `getSegmentAndAdvanceCursor(sid)`: returns events since last emission + updates cursor
- `createTraceToken(events: TraceEvent[]): Promise<string>` — JSON → base64url → HMAC sign (reuses `hmacSign` from crypto.ts)
- `decodeTraceToken(token: string): Promise<TraceEvent[]>` — HMAC verify → base64url → JSON parse  
**Dependencies:** None  
**Estimate:** 30m

#### T4: Augment withAuditLog for trace capture + validation extraction
**File:** `src/logging.ts`  
**Changes:**
- Add optional `traceStore?: TraceStore` and `excludeFromTrace?: boolean` params
- When tracing: decode `sid` and `aid` from `session_token`; build `TraceEvent` with compressed fields
- After handler returns: duck-type check for `_meta.validation`; add `vw` (validation warnings) to event
- On error: `s: 'error'`, `err: message`
- Preserve existing stderr logging  
**Dependencies:** T2 (sid/aid), T3 (TraceStore)  
**Estimate:** 25m

### Phase 3: Manifests

#### T5: Add step_manifest param to `next_activity`
**Files:** `src/tools/workflow-tools.ts`  
**Changes:**
- The renamed `next_activity` already has step_manifest (it was `get_activity`). Verify it's wired correctly after rename.
- Step manifest stays lean: `{ step_id: string, output: string }[]`  
**Dependencies:** T1  
**Estimate:** 5m (verification only)

#### T6: Add activity_manifest param to `next_activity`
**Files:** `src/tools/workflow-tools.ts`, `src/utils/validation.ts`  
**Changes:**
- Define `activityManifestSchema`: `Array<{ activity_id: string, outcome: string, transition_condition?: string }>`
- Add as optional param on `next_activity`
- Add `validateActivityManifest()`: check reported activity sequence against transition graph (advisory warnings)
- Create `schemas/activity-manifest.schema.json`  
**Dependencies:** T1  
**Estimate:** 25m

### Phase 4: Server Wiring + Tools

#### T7: Wire TraceStore into server + emit trace tokens
**Files:** `src/server.ts`, `src/config.ts`, `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts`, `src/tools/state-tools.ts`  
**Changes:**
- `config.ts`: Add `traceStore?: TraceStore` to `ServerConfig`
- `server.ts`: Instantiate `TraceStore` in `createServer()`
- All tool registrations: pass `config.traceStore` to `withAuditLog`
- In `next_activity` handler (after all processing): call `traceStore.getSegmentAndAdvanceCursor(sid)`, create trace token from segment, add `_meta.trace_token` to response
- `get_trace`: pass `excludeFromTrace: true`  
**Dependencies:** T3, T4  
**Estimate:** 25m

#### T8: Initialize trace on start_session
**File:** `src/tools/resource-tools.ts`  
**Changes:**
- After `createSessionToken()`: decode → extract `sid` → `traceStore.initSession(sid)`
- Append `session_started` event  
**Dependencies:** T2, T7  
**Estimate:** 10m

#### T9: Add get_trace MCP tool
**File:** `src/tools/workflow-tools.ts`  
**Changes:**
- Register `get_trace`: accepts `session_token` + optional `trace_tokens: string[]`
- When `trace_tokens` provided: verify HMAC, decode each, concatenate events in order
- When not provided: return full in-memory trace from `traceStore.getEvents(sid)`
- Handle expired/invalid tokens gracefully (return receipt metadata)
- Pass `excludeFromTrace: true` to `withAuditLog`  
**Dependencies:** T2, T3, T7  
**Estimate:** 20m

#### T10: Update exports
**Files:** `src/index.ts`, `src/server.ts`  
**Changes:**
- Export `TraceEvent`, `TraceStore` from `./trace.js`
- Update server tool list in `logInfo`  
**Dependencies:** T9  
**Estimate:** 5m

### Phase 5: Tests

#### T11: Write tests
**Files:** `tests/trace.test.ts` (new), `tests/session.test.ts`, `tests/mcp-server.test.ts`  
**Changes:**

**Unit — TraceStore** (`tests/trace.test.ts`):
- initSession, append, getEvents, listSessions, isolation, unknown session
- getSegmentAndAdvanceCursor: returns correct slice, advances cursor, subsequent call returns new segment only
- createTraceToken / decodeTraceToken: round-trip, HMAC verification, tampered token rejection

**Unit — Session** (`tests/session.test.ts`):
- `sid` present, UUID format, preserved across advance
- `aid` defaults empty, settable via advanceToken, preserved when not updated

**Integration** (`tests/mcp-server.test.ts`):
- Tool renames: `next_activity` loads activity, `get_activities` returns transitions, old names fail
- Trace capture: start_session → tool calls → get_trace returns all events
- Trace tokens: next_activity returns `_meta.trace_token`; accumulate tokens → get_trace with tokens resolves full trace
- Validation warnings in trace events
- Error events captured
- get_trace excluded from own output
- session_token not in trace events (privacy)
- Exempt tools not traced
- agent_id in events when set
- get_trace with no tokens returns in-memory trace
- Activity manifest accepted and validated  

**Dependencies:** T1-T10  
**Estimate:** 60m

### Phase 6: Workflow Content + Issue Update

#### T12: Update TOON files with semantic trace instructions
**Files:** `workflows/meta/skills/*.toon`, `workflows/work-package/skills/*.toon`  
**Changes:**
- Instruct workers to write semantic trace (step outputs, checkpoint responses, decisions) to planning folder
- Instruct orchestrator to accumulate `_meta.trace_token` and persist to planning folder  
**Dependencies:** T1 (tool renames already done)  
**Estimate:** 30m (workflow content authoring)

#### T13: Update issue #63
**Changes:**
- Update issue description to reflect evolved scope (mechanical/semantic split, trace tokens, tool renames)  
**Dependencies:** All implementation complete  
**Estimate:** 10m

---

## Task Ordering

```
Phase 1:  T1 (tool renames + TOON updates)

Phase 2:  T2 (sid+aid) ──┐
                          ├── T4 (augment withAuditLog)
          T3 (trace module) ┘

Phase 3:  T5 (verify step manifest) ─── T6 (add activity manifest)

Phase 4:  T7 (wire + token emission) → T8 (init start_session)
                                      → T9 (get_trace tool)
                                      → T10 (exports)

Phase 5:  T11 (all tests)

Phase 6:  T12 (TOON instructions) → T13 (issue update)
```

**Critical path:** T1 → T3 → T4 → T7 → T9 → T11

---

## Estimated Total

| Phase | Tasks | Estimate |
|-------|-------|----------|
| 1. Tool Rename | T1 | 25m |
| 2. Token + Trace Infrastructure | T2-T4 | 70m |
| 3. Manifests | T5-T6 | 30m |
| 4. Server Wiring + Tools | T7-T10 | 60m |
| 5. Tests | T11 | 60m |
| 6. Workflow Content + Issue | T12-T13 | 40m |
| **Total** | **T1-T13** | **~4.5-5h agentic time** |

---

## Out of Scope

- Extended step manifest semantic fields (moved to agent-written semantic trace)
- Cross-session trace aggregation
- Real-time trace streaming or dashboards
- mcp-trace-js or OpenTelemetry library dependencies
- Trace export to external systems
- Mid-workflow trace access configuration (workflow authoring, addressed by T12)
