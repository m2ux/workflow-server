# Assumptions Log

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Last Updated:** 2026-03-25

---

## Summary

Total: 8 | Validated: 4 | Invalidated: 0 | Partially Validated: 1 | Open: 3  
Convergence iterations: 1 | Newly surfaced: 0

---

## Problem Interpretation

### A-02-01: Tracing means server-side recording of tool call sequences
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** "Execution traces" refers to server-side recording of MCP tool call sequences within a workflow session — not client-side agent logging or distributed tracing.  
**Evidence:** All workflow concepts (activities, skills, checkpoints, step manifests, session tokens) are managed server-side. `withAuditLog` in `src/logging.ts` already captures tool calls server-side. The server has no client-side instrumentation capability.  
**Resolution:** Validated — iteration 1.

### A-02-02: withAuditLog is the natural interception point
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `withAuditLog` wrapper in `logging.ts` wraps every tool handler and is the appropriate integration point for trace capture.  
**Evidence:** Grep confirms 12 `server.tool()` registrations and 12 `withAuditLog()` usages across `workflow-tools.ts` (7), `resource-tools.ts` (3), and `state-tools.ts` (2). Every tool handler is wrapped. Pattern: `server.tool('name', desc, schema, withAuditLog('name', async (params) => { ... }))`.  
**Resolution:** Validated — iteration 1.

### A-02-03: Session identity is derivable from existing tokens
**Status:** Partially Validated  
**Resolvability:** Code-analyzable  
**Assumption:** A unique session identifier can be derived from the existing session token (e.g., the `wf` + `ts` fields from `SessionPayload`) without requiring a new session ID mechanism.  
**Evidence:** `createSessionToken` in `src/utils/session.ts:57-67` sets `ts: Math.floor(Date.now() / 1000)` — second-precision Unix timestamp. Combined with `wf` (workflow ID), this identifies a session. For a single-process stdio server serving one agent, collisions are extremely unlikely. However, second-precision timestamps are coarser than ideal — a dedicated UUID-based session ID would eliminate collision risk entirely.  
**Resolution:** Partially Validated — iteration 1. Works in practice for the current architecture, but implementation should consider adding a dedicated session ID for robustness.

### A-02-04: Trace granularity is at the tool-call level
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Traces capture events at the tool-call level (get_activity, get_skills, next_activity, etc.), not at finer granularity like individual step execution within an activity. Step-level detail comes from the `step_manifest` parameter on `get_activity` calls, which is already part of the tool call data.  
**Classification rationale:** This is a design decision about what level of detail traces should capture. The server has no visibility into agent-side step execution, so finer granularity would require a new reporting API — a scope decision only the stakeholder can make.  
**What would resolve it:** Stakeholder confirmation that tool-call-level granularity (with step manifests) is sufficient.

## Complexity Assessment

### A-02-05: In-process Map is viable for trace storage
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Trace data can be stored in an in-process `Map<string, TraceEvent[]>` within the server process, rather than requiring an external data store.  
**Evidence:** `src/index.ts` shows the server uses `StdioServerTransport` — a single-process, single-connection transport. No concurrent instances or shared state. The server serves one agent for its lifetime. No existing `Map` usage in codebase, but the pattern is straightforward. Traces only need to survive within the server's process lifetime.  
**Resolution:** Validated — iteration 1.

### A-02-06: Trace retrieval via new MCP tool
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Trace retrieval will be exposed as a new MCP tool (e.g., `get_trace`), consistent with the server's existing tool-based API pattern.  
**Evidence:** All server functionality is exposed through `server.tool()` calls in `src/tools/`. No HTTP endpoints, REST API, or other interface exists. The pattern is consistent: tool name, zod schema, `withAuditLog` wrapper. `src/server.ts` registers tools from three modules. Adding a fourth tool module or extending an existing one follows established patterns.  
**Resolution:** Validated — iteration 1.

## Workflow Path

### A-02-07: Issue acceptance criteria are sufficient without elicitation
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Issue #63's three user stories and acceptance criteria fully specify the requirements. No additional stakeholder input or requirements discovery is needed.  
**Classification rationale:** Whether requirements are "sufficient" is a stakeholder judgment that cannot be determined through code analysis.  
**What would resolve it:** Stakeholder confirmation that the issue's user stories and acceptance criteria cover all desired trace capabilities.

### A-02-08: No external tracing standards needed
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** The trace format can be a simple, internal structured format (JSON event array) without adopting external standards like OpenTelemetry, W3C Trace Context, or Jaeger.  
**Classification rationale:** Whether to adopt an external standard is a strategic decision about future integration needs, not something code analysis can determine.  
**What would resolve it:** Stakeholder confirmation that traces serve only internal debugging/audit purposes with no planned integration with external observability systems.
