# Work Package Plan

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Revised:** 2026-03-25 (v3 — incorporating user design feedback: tool renames, two-level manifests, agent ID, validation capture)

---

## Design Approach

### Strategy: Server-Side Trace Accumulation with Enhanced Manifests

Add server-side trace accumulation with OTel-compatible format. Rename workflow navigation tools for clarity. Introduce two-level manifests (step + activity) for richer trace data. Extend session tokens with agent ID for worker attribution. Capture validation warnings in trace events.

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Tool rename** | `get_activity` → `next_activity` (commit), `next_activity` → `get_activities` (query) | Clearer semantics: `next_activity` = "transition to next", `get_activities` = "list available transitions" |
| **Two-level manifests** | Step manifest (worker) + Activity manifest (orchestrator), both on `next_activity` | Different agents produce different granularity data; single manifest conflates producers |
| **Step manifest extension** | Add optional `decision_branch`, `loop_iteration`, `loop_total`, `checkpoint_response` | Captures within-activity semantic events without schema-breaking changes |
| **Activity manifest** | New: `activity_id`, `outcome`, `transition_condition`, `checkpoints_resolved`, `variables_changed` | Captures workflow-level events invisible to step manifests |
| **Agent ID in token** | Add `aid` field to `SessionPayload` | Distinguishes orchestrator from worker calls in traces |
| **Validation in trace** | Extract `_meta.validation` from handler response | Essential for debugging transition and manifest validation issues |
| **Trace format** | OTel-compatible: traceId, spanId, name, timestamp, duration_ms, status, attributes | Future export compatibility |
| **Privacy** | Redact `session_token` from trace; extract semantic fields only | Token is HMAC credential |
| **Self-exclusion** | `get_trace` excluded from its own trace via `excludeFromTrace` | Prevents recursion |

### Visual Reference

See [Solution Diagrams](04-solution-diagrams.md) for sequence diagrams and component architecture.

---

## Task Breakdown

### Phase 1: Tool Rename

#### T1: Rename `get_activity` → `next_activity`
**Files:** `src/tools/workflow-tools.ts`, `src/server.ts`, `tests/mcp-server.test.ts`  
**Changes:**
- `workflow-tools.ts`: Rename tool registration from `'get_activity'` to `'next_activity'` (line 96). Update `withAuditLog` name (line 104). Update error message referencing old name (line 166).
- `server.ts`: Update tools list in `logInfo` (line 21)
- `tests/mcp-server.test.ts`: Update all ~20 references to `get_activity` → `next_activity` in test tool calls
- Update description to: "Transition to the next activity. Validates step manifest for the leaving activity, validates transition legality, loads the target activity definition, and advances the session token."  
**Dependencies:** None  
**Estimate:** 15m

#### T2: Rename `next_activity` → `get_activities`
**Files:** `src/tools/workflow-tools.ts`, `src/server.ts`, `tests/mcp-server.test.ts`  
**Changes:**
- `workflow-tools.ts`: Rename tool registration from `'next_activity'` to `'get_activities'` (line 162). Update `withAuditLog` name (line 164).
- `server.ts`: Update tools list
- `tests/mcp-server.test.ts`: Update references  
- Update description to: "Get the list of possible next activities with their transition conditions."  
**Dependencies:** T1 (do rename sequentially to avoid name collision — old `next_activity` must be renamed before new `next_activity` is created)  
**Estimate:** 10m

**Note:** T1 and T2 must be executed carefully. Rename current `get_activity` → `next_activity` first, then rename current `next_activity` → `get_activities`. If done simultaneously, the intermediate state has a name collision.

### Phase 2: Token and Trace Infrastructure

#### T3: Extend SessionPayload with `sid` and `aid`
**Files:** `src/utils/session.ts`  
**Changes:**
- Add `sid: string` (session UUID) and `aid: string` (agent ID) to `SessionPayload`
- Add `aid?: string` to `SessionAdvance`
- Import `randomUUID` from `node:crypto`
- `createSessionToken()`: generate `sid: randomUUID()`, set `aid: ''`
- `decode()`: add `sid` and `aid` to type guard checks
- `advanceToken()`: handle `aid` in updates (auto-preserve `sid`)  
**Dependencies:** None (parallel with T1/T2)  
**Estimate:** 15m

#### T4: Create trace module
**File:** `src/trace.ts` (new)  
**Changes:**
- `TraceAttributes` interface: `workflow_id?`, `activity_id?`, `checkpoint_id?`, `skill_id?`, `transition_condition?`, `step_manifest?`, `activity_manifest?`, `summary?`, `agent_id?`
- `TraceEvent` interface (OTel-compatible): `traceId`, `spanId`, `name`, `timestamp`, `duration_ms`, `status` ("ok" | "error"), `error_message?`, `attributes: TraceAttributes`, `validation_warnings?: string[]`, `validation_status?: string`
- `TraceStore` class with `Map<string, TraceEvent[]>`: `initSession()`, `append()`, `getEvents()`, `listSessions()`  
**Dependencies:** None  
**Estimate:** 20m

#### T5: Augment withAuditLog for trace + validation capture
**File:** `src/logging.ts`  
**Changes:**
- Add optional `traceStore?: TraceStore` and `excludeFromTrace?: boolean` params
- When tracing: extract `session_token` → decode `sid` and `aid` → build `TraceAttributes` from semantic fields → redact token
- After handler returns: extract `_meta.validation` from result (duck-type check: `result && typeof result === 'object' && '_meta' in result`). Add `validation_warnings` and `validation_status` to trace event.
- Append `TraceEvent` to store
- On error: capture with `status: "error"`, `error_message`
- Preserve existing stderr logging unchanged  
**Dependencies:** T3 (sid/aid in token), T4 (TraceStore type)  
**Estimate:** 30m

### Phase 3: Manifest Schemas and Tool Integration

#### T6: Extend step manifest schema
**Files:** `src/tools/workflow-tools.ts`, `src/utils/validation.ts`, `schemas/` (new JSON schema)  
**Changes:**
- Extend `stepManifestSchema` zod definition with optional fields: `decision_branch?: string`, `loop_iteration?: number`, `loop_total?: number`, `checkpoint_response?: string`
- Update `StepManifestEntry` interface in `validation.ts`
- Create `schemas/step-manifest.schema.json` documenting the extended format
- `validateStepManifest()`: no logic changes needed (extra fields are optional, validation checks step IDs and order)  
**Dependencies:** T1 (new tool name `next_activity`)  
**Estimate:** 20m

#### T7: Add activity manifest schema and parameter
**Files:** `src/tools/workflow-tools.ts`, `src/utils/validation.ts`, `schemas/` (new JSON schema)  
**Changes:**
- Define `activityManifestSchema` zod schema: `Array<{ activity_id: string, outcome: string, transition_condition?: string, checkpoints_resolved?: string[], variables_changed?: Record<string, unknown> }>`
- Define `ActivityManifestEntry` interface in `validation.ts`
- Add `activity_manifest` as optional parameter on `next_activity` tool (the commit operation, renamed from `get_activity`)
- Add `validateActivityManifest()`: validate reported activity sequence against workflow transition graph
- Create `schemas/activity-manifest.schema.json`  
**Dependencies:** T1 (tool renamed), T6 (pattern established)  
**Estimate:** 30m

### Phase 4: Server Wiring and New Tools

#### T8: Wire TraceStore into server
**Files:** `src/server.ts`, `src/config.ts`, `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts`, `src/tools/state-tools.ts`  
**Changes:**
- `config.ts`: Add `traceStore?: TraceStore` to `ServerConfig`
- `server.ts`: Instantiate `TraceStore` in `createServer()`, attach to config
- All tool registration functions: pass `config.traceStore` to `withAuditLog`. For `get_trace`: pass `excludeFromTrace: true`  
**Dependencies:** T4, T5  
**Estimate:** 20m

#### T9: Initialize trace on start_session
**File:** `src/tools/resource-tools.ts`  
**Changes:**
- In `start_session` handler: decode new token → extract `sid` → `traceStore.initSession(sid)` → append `session_started` event  
**Dependencies:** T3, T8  
**Estimate:** 10m

#### T10: Add get_trace MCP tool
**File:** `src/tools/workflow-tools.ts`  
**Changes:**
- Register `get_trace` tool: accepts `session_token`, returns `{ traceId, events[] }`
- Decode token → extract `sid` → `traceStore.getEvents(sid)`
- Pass `excludeFromTrace: true` to `withAuditLog`  
**Dependencies:** T3, T4, T8  
**Estimate:** 15m

#### T11: Update exports and registration
**Files:** `src/index.ts`, `src/server.ts`  
**Changes:**
- Export `TraceEvent`, `TraceStore`, `TraceAttributes`, `StepManifestEntry`, `ActivityManifestEntry`
- Update server tool list in `logInfo`  
**Dependencies:** T10  
**Estimate:** 5m

### Phase 5: Tests

#### T12: Write tests
**Files:** `tests/trace.test.ts` (new), `tests/session.test.ts`, `tests/mcp-server.test.ts`  
**Changes:**

**Unit — TraceStore** (`tests/trace.test.ts`):
- initSession, append, getEvents, listSessions, session isolation, unknown session

**Unit — Session** (`tests/session.test.ts`):
- `sid` present and UUID format
- `aid` present, defaults empty, preserved across advance, settable via advanceToken
- `sid` preserved across advance

**Integration — Tool Renames** (`tests/mcp-server.test.ts`):
- `next_activity` (renamed from `get_activity`) accepts step_manifest and activity_manifest
- `get_activities` (renamed from `next_activity`) returns transitions
- Old tool names return errors

**Integration — Trace Capture** (`tests/mcp-server.test.ts`):
- start_session → tool calls → get_trace verifies all captured
- Trace events have OTel-compatible fields
- Validation warnings appear in trace events
- Error events captured with status and message
- Session-exempt tools not in trace
- get_trace excluded from its own output
- session_token not in trace attributes (privacy)
- traceId matches session sid
- agent_id appears in trace when set
- Extended manifest fields (decision_branch, checkpoint_response) in trace attributes
- Activity manifest in trace attributes  

**Dependencies:** T1-T11  
**Estimate:** 60m

---

## Task Ordering

```
Phase 1 (Renames):
  T1 (get_activity→next_activity) → T2 (next_activity→get_activities)

Phase 2 (Infrastructure, parallel with Phase 1):
  T3 (sid+aid in token) ──┐
                           ├── T5 (augment withAuditLog)
  T4 (trace module)  ─────┘

Phase 3 (Manifests, after Phase 1):
  T6 (extend step manifest) → T7 (add activity manifest)

Phase 4 (Wiring, after Phase 2):
  T8 (wire TraceStore) → T9 (init on start_session)
                        → T10 (get_trace tool)
                        → T11 (exports)

Phase 5 (Tests, after all):
  T12 (all tests)
```

**Critical path:** T1 → T2 → T7 → T12 and T3 → T5 → T8 → T10 → T12

---

## Estimated Total

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1: Tool Rename | T1-T2 | ~25m |
| Phase 2: Token + Trace Infrastructure | T3-T5 | ~65m |
| Phase 3: Manifest Schemas | T6-T7 | ~50m |
| Phase 4: Server Wiring + Tools | T8-T11 | ~50m |
| Phase 5: Tests | T12 | ~60m |
| **Total** | **T1-T12** | **~4-4.5h agentic time** |

---

## Out of Scope

- Agent-side history accumulation (existing `addHistoryEvent` — separate concern)
- Cross-session trace aggregation or persistence beyond server lifetime
- Real-time trace streaming or dashboards
- mcp-trace-js or OpenTelemetry library integration (designed for future compatibility)
- Trace export to external systems (File, DB, OTLP)
- Mid-workflow trace access configuration (workflow authoring in TOON, not server code)
- TOON-format manifest encoding (manifests are JSON params on MCP tool calls — TOON applies to workflow definitions, not runtime API parameters)
