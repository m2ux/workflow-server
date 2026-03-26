# Assumptions Log

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25  
**Last Updated:** 2026-03-25

---

## Summary

Total: 17 | Validated: 10 | Invalidated: 0 | Partially Validated: 0 | Open: 7  
Convergence iterations: 3 (design-philosophy: 1, research: 1, plan-prepare: 1) | Newly surfaced: 0

---

## Problem Interpretation (Activity 02)

### A-02-01: withAuditLog wraps all tool handlers  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `withAuditLog` wrapper is applied to every tool handler.  
**Evidence:** All 12 tool registrations use `withAuditLog`.  
**Resolution:** Validated — iteration 1.

### A-02-02: Session tokens encode only current position  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Session tokens track only current position; `advanceToken` overwrites previous values.  
**Evidence:** `session.ts:4-12` — `SessionPayload` has `wf`, `act`, `skill`, `cond`, `seq`, `ts`. No history field.  
**Resolution:** Validated — iteration 1.

### A-02-03: No in-process state storage exists  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** No in-process Map or module-scoped mutable state beyond crypto key cache.  
**Evidence:** `grep "new Map\|Map<" src/` returns no results.  
**Resolution:** Validated — iteration 1.

### A-02-04: Server is single-process stdio-based  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `StdioServerTransport` — single process, single connection.  
**Evidence:** `index.ts:23`. No clustering or workers.  
**Resolution:** Validated — iteration 1.

---

## Complexity Assessment (Activity 02)

### A-02-05: Trace granularity at tool-call level  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Tool-call-level granularity (enriched by manifests) is sufficient.  
**What would resolve it:** Stakeholder confirmation.

### A-02-06: In-memory storage is sufficient  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** In-process Map is sufficient; no persistent storage needed.  
**What would resolve it:** Stakeholder input on trace lifecycle requirements.

---

## Workflow Path (Activity 02)

### A-02-07: No elicitation needed  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Issue #63's acceptance criteria are sufficient without additional requirements.  
**What would resolve it:** Stakeholder confirmation.

### A-02-08: No external tracing standards needed  
**Status:** Revised — superseded by A-04-02 and A-04-03.

---

## Pattern Applicability (Activity 04 — Research)

### A-04-01: mcp-trace is not suitable for direct adoption  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** mcp-trace-js is adapter-oriented, not in-process retrieval.  
**Evidence:** mcp-trace-js API: `FileAdapter`, `PostgresAdapter`, `OTLPAdapter`. No `InMemoryAdapter` or `getTrace()`.  
**Resolution:** Validated — iteration 2.

### A-04-02: OTel-compatible field naming aids future integration  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** OTel-compatible fields (traceId, spanId, etc.) future-proof without OTel dependency.  
**What would resolve it:** Stakeholder decision on future OTel needs.

### A-04-03: Hybrid approach is optimal  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** Custom TraceStore + OTel format balances simplicity and future-proofing.  
**What would resolve it:** Stakeholder confirmation. **Confirmed by user at approach checkpoint.**

### A-04-04: Session tokens must be redacted from trace events  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `session_token` is HMAC-signed credential; must not appear in traces.  
**Evidence:** Token is parameter on 9 of 12 tools.  
**Resolution:** Validated — iteration 2.

### A-04-05: Memory growth is not a concern  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** ~50KB per typical session. Well within Node.js heap.  
**Evidence:** 14 activities × ~5 calls = ~70 events × 500 bytes = ~35KB.  
**Resolution:** Validated — iteration 2.

---

## Planning Decisions (Activity 06 — Plan-Prepare)

### A-06-01: Tool rename requires TOON file updates  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Renaming `get_activity` → `next_activity` and `next_activity` → `get_activities` in server code requires corresponding updates to workflow TOON files that reference these tool names in agent instructions.  
**Evidence:** Grep found ~20+ references across `workflows/` worktree: `meta/skills/05-execute-activity.toon` (4 refs), `meta/skills/04-orchestrate-workflow.toon` (3 refs), `meta/skills/01-workflow-execution.toon` (4 refs), `meta/rules.toon` (2 refs), plus `prism/`, `substrate-node-security-audit/`, and `cicd-pipeline-security-audit/` skills. These are agent instructions that tell agents which tool names to call.  
**Resolution:** Validated — iteration 3. TOON files must be updated alongside server code. This is workflow content in the `workflows/` worktree (orphan branch), not `src/`.  
**Impact:** Adds scope to T1/T2 — TOON file updates in the `workflows/` worktree.

### A-06-02: _meta.validation is consistently shaped across all tools  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** All tools that return `_meta` use the same shape: `{ session_token: string, validation: ValidationResult }`, making duck-type extraction reliable.  
**Evidence:** All 8 session-bearing tools return `_meta: { session_token: ..., validation }`. `save_state` and `restore_state` use `buildValidation()` (empty). `start_session` does NOT return `_meta`. Pattern is consistent: if `_meta` exists, it has `validation`.  
**Resolution:** Validated — iteration 3. Duck-type check `if (result?._meta?.validation)` will work reliably.

### A-06-03: Sequential rename avoids name collision  
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Renaming `get_activity` → `next_activity` first, then old `next_activity` → `get_activities`, avoids having two tools with the same name in an intermediate state.  
**Evidence:** `server.tool()` registers names at startup. Both renames happen in the same code change before the server starts. The concern is about code readability during implementation, not runtime collision. Since both renames are in the same file (`workflow-tools.ts`), they can be done atomically in a single commit.  
**Resolution:** Validated — iteration 3. Both renames in a single commit eliminates collision risk.

### A-06-04: Activity manifest validation against transition graph is feasible  
**Status:** Open  
**Resolvability:** Not code-resolvable  
**Assumption:** The server can validate an activity manifest's reported sequence against the workflow's transition graph using existing `getValidTransitions()`. However, whether strict validation (reject invalid sequences) or advisory validation (warn but accept) is appropriate depends on how permissive the system should be.  
**Classification rationale:** The technical mechanism exists (`getValidTransitions` can check each reported transition), but whether to enforce strictly or warn is a design policy decision.  
**What would resolve it:** Stakeholder decision on validation strictness. Recommendation: advisory (warnings) for now, consistent with existing step manifest validation which only warns.
