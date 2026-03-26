# Assumptions Log

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Last Updated:** 2026-03-25

---

## Summary

Total: 13 | Validated: 7 | Invalidated: 0 | Partially Validated: 0 | Open: 6  
Convergence iterations: 2 (design-philosophy: 1, research: 1) | Newly surfaced: 0

---

## Problem Interpretation (Activity 02)

### A-02-01: withAuditLog wraps all tool handlers  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `withAuditLog` wrapper is applied to every tool handler.  
**Evidence:** All 12 tool registrations use `withAuditLog` — confirmed by grep.  
**Resolution:** Validated — iteration 1.

### A-02-02: Session tokens encode only current position  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Session tokens track only current position; `advanceToken` overwrites previous values.  
**Evidence:** `session.ts:4-12` defines `SessionPayload` with `wf`, `act`, `skill`, `cond`, `seq`, `ts`. No history field.  
**Resolution:** Validated — iteration 1.

### A-02-03: No in-process state storage exists  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The server has no in-process Map or module-scoped mutable state beyond crypto key cache.  
**Evidence:** `grep "new Map\|Map<" src/` returns no results.  
**Resolution:** Validated — iteration 1.

### A-02-04: Server is single-process stdio-based  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Server uses `StdioServerTransport` — single process, single connection.  
**Evidence:** `index.ts:23` uses `StdioServerTransport`. No clustering or workers.  
**Resolution:** Validated — iteration 1.

---

## Complexity Assessment (Activity 02)

### A-02-05: Trace granularity at tool-call level  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Tool-call-level granularity is sufficient for debugging and auditing.  
**Classification rationale:** Design decision about user expectations. Server can only observe tool calls, not agent-side step execution.  
**What would resolve it:** Stakeholder confirmation.

### A-02-06: In-memory storage is sufficient  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Traces stored in-process (Map) during a session are sufficient; no persistent storage needed.  
**Classification rationale:** Depends on operational patterns — IDE restart behavior, session length.  
**What would resolve it:** Stakeholder input on trace lifecycle requirements.

---

## Workflow Path (Activity 02)

### A-02-07: No elicitation needed  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Issue #63's acceptance criteria are sufficient without additional requirements.  
**What would resolve it:** Stakeholder confirmation.

### A-02-08: No external tracing standards needed  
**Status:** Revised — see A-04-02  
**Resolvability:** Not code-resolvable  
**Assumption:** Originally assumed no external standards needed. Research revised this: OTel-compatible field naming is recommended for future compatibility, but full OTel dependency is not warranted.  
**Resolution:** Superseded by A-04-02 and A-04-03.

---

## Pattern Applicability (Activity 04 — Research)

### A-04-01: mcp-trace is not suitable for direct adoption  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `mcp-trace-js` library is adapter-oriented (File/DB/OTLP export) and doesn't support in-process retrieval via MCP tool — our primary use case.  
**Evidence:** mcp-trace-js README and API show `TraceMiddleware` with adapter pattern: `FileAdapter`, `PostgresAdapter`, `OTLPAdapter`, `ConsoleAdapter`. No `InMemoryAdapter` or `getTrace()` API. Library writes traces to external sinks, not to an in-process queryable store.  
**Resolution:** Validated — iteration 2. mcp-trace solves a different problem (export to external systems). Our requirement is in-process retrieval via `get_trace` MCP tool.

### A-04-02: OTel-compatible field naming aids future integration  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Structuring trace events with OTel-compatible fields (traceId, spanId, timestamp, duration, name, attributes, status) will make future OTel export trivial without adding OTel as a dependency now.  
**Classification rationale:** Whether OTel compatibility matters depends on future integration plans — a strategic decision.  
**What would resolve it:** Stakeholder decision on whether OTel export is a foreseeable future requirement.

### A-04-03: Hybrid approach is optimal  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Custom in-process TraceStore with OTel-compatible format provides the best balance of simplicity (no dependencies) and future-proofing (exportable format).  
**Classification rationale:** This is a synthesis decision balancing competing concerns. Alternatives (full OTel, mcp-trace adoption, pure custom) each have different trade-off profiles that depend on project direction.  
**What would resolve it:** Stakeholder confirmation of the recommended approach.

### A-04-04: Session tokens must be redacted from trace events  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Tool call parameters include `session_token` (an HMAC-signed credential) which should not be stored in trace events. Trace events should capture workflow-semantic fields (workflow_id, activity_id, checkpoint_id, step_manifest) but exclude the raw token.  
**Evidence:** Grep confirms `session_token` is a parameter on 9 of 12 tools (all except `help`, `list_workflows`, `health_check`). The token is an HMAC-signed base64 payload containing workflow position — functionally a bearer credential.  
**Resolution:** Validated — iteration 2. Trace capture must extract semantic fields and exclude the raw token.

### A-04-05: Memory growth is not a concern for typical sessions  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** In-process trace accumulation will not cause memory pressure for realistic workflow session lengths.  
**Evidence:** A typical work-package workflow has 14 activities with ~3-5 tool calls each = 42-70 calls. Each trace event ≈ 500 bytes (JSON with tool name, extracted params, timing). Even 100 events = 50KB. 1000 events (extreme edge case) = 500KB. Well within Node.js heap capacity.  
**Resolution:** Validated — iteration 2. Memory is not a practical concern.
