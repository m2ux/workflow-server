# Assumptions Log

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Last Updated:** 2026-03-25

---

## Summary

Total: 16 | Validated: 10 | Stakeholder-Resolved: 6 | Invalidated: 0 | Open: 0  
Convergence iterations: 3 (design-philosophy: 1, research: 1, plan-prepare: 1)  
All assumptions resolved. No open items remain.

---

## Problem Interpretation (Activity 02)

### A-02-01: withAuditLog wraps all tool handlers  
**Status:** Validated  
**Evidence:** All 12 tool registrations use `withAuditLog`.  
**Resolution:** Validated — iteration 1.

### A-02-02: Session tokens encode only current position  
**Status:** Validated  
**Evidence:** `session.ts:4-12` — `SessionPayload` has positional fields only.  
**Resolution:** Validated — iteration 1.

### A-02-03: No in-process state storage exists  
**Status:** Validated  
**Evidence:** No `Map` or mutable module state in `src/`.  
**Resolution:** Validated — iteration 1.

### A-02-04: Server is single-process stdio-based  
**Status:** Validated  
**Evidence:** `index.ts:23` — `StdioServerTransport`.  
**Resolution:** Validated — iteration 1.

---

## Complexity Assessment (Activity 02)

### A-02-05: Trace granularity at tool-call level  
**Status:** Stakeholder-Resolved  
**Assumption:** Tool-call-level granularity (enriched by lean step manifests) is sufficient.  
**Resolution:** Agreed by stakeholder. Semantic detail (step outputs, decisions, loops, checkpoint responses) moves to agent-written semantic trace files. Server captures mechanical trace only.

### A-02-06: In-memory storage is sufficient  
**Status:** Stakeholder-Resolved  
**Assumption:** Originally: in-process Map is sufficient, no persistence needed.  
**Resolution:** Evolved through design discussion. Final design: mechanical trace events are embedded in full-data HMAC-signed trace tokens (~1.3KB each) returned on `next_activity`. Tokens are self-contained and survive server restart. TraceStore remains for ad-hoc `get_trace` queries within a session but is no longer the persistence mechanism.

---

## Workflow Path (Activity 02)

### A-02-07: No elicitation needed  
**Status:** Stakeholder-Resolved  
**Assumption:** Issue #63's acceptance criteria are sufficient.  
**Resolution:** Agreed. Issue #63 will be updated to reflect the evolved scope (mechanical/semantic split, trace tokens, tool renames).

### A-02-08: No external tracing standards needed  
**Status:** Superseded by A-04-02 and A-04-03.

---

## Pattern Applicability (Activity 04 — Research)

### A-04-01: mcp-trace is not suitable for direct adoption  
**Status:** Validated  
**Evidence:** mcp-trace-js is adapter-oriented, no in-process retrieval API.  
**Resolution:** Validated — iteration 2.

### A-04-02: OTel-compatible field naming aids future integration  
**Status:** Stakeholder-Resolved  
**Assumption:** Originally: use full OTel field names (traceId, spanId, timestamp, duration_ms, status, attributes).  
**Resolution:** Since trace tokens are opaque to agents, compressed field names are preferred for token efficiency: `ts` (timestamp), `ms` (duration), `s` (status), `wf` (workflow_id), `act` (activity_id), `aid` (agent_id). `traceId` and `spanId` retained for OTel export compatibility. `name` retained for readability.

### A-04-03: Hybrid approach is optimal  
**Status:** Stakeholder-Resolved  
**Assumption:** Originally: custom TraceStore + OTel-compatible format.  
**Resolution:** Evolved to split design: server captures mechanical trace (tool calls, timing, validation, errors) in full-data HMAC tokens; agent writes semantic trace (step outputs, decisions, variables, checkpoint responses) to planning folder files. This is cleaner than a single hybrid — each side owns its data.

### A-04-04: Session tokens must be redacted from trace events  
**Status:** Validated  
**Evidence:** Token is HMAC credential on 9 of 12 tools.  
**Resolution:** Validated — iteration 2.

### A-04-05: Memory growth is not a concern  
**Status:** Validated  
**Evidence:** ~189 bytes per mechanical event, ~50 events per session = ~9.5KB.  
**Resolution:** Validated — iteration 2.

---

## Planning Decisions (Activity 06 — Plan-Prepare)

### A-06-01: Tool rename requires TOON file updates  
**Status:** Validated  
**Evidence:** ~20+ references to `get_activity` and `next_activity` across `workflows/` worktree.  
**Resolution:** Validated — iteration 3. TOON files must be updated alongside server code.

### A-06-02: _meta.validation shape is consistent  
**Status:** Validated  
**Evidence:** All 8 session-bearing tools return `_meta: { session_token, validation }`.  
**Resolution:** Validated — iteration 3.

### A-06-03: Sequential rename avoids collision  
**Status:** Validated  
**Evidence:** Both renames in same commit eliminates runtime collision.  
**Resolution:** Validated — iteration 3.

### A-06-04: Activity manifest validation approach  
**Status:** Stakeholder-Resolved  
**Assumption:** Originally: advisory warnings for activity manifest validation.  
**Resolution:** Activity manifest stays on `next_activity` for structural validation (activity_id, outcome, transition_condition). Advisory warnings, consistent with step manifest validation. Detailed content (checkpoint responses, variable changes) moves to agent-written semantic trace.
