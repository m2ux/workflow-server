# Design Philosophy

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63) — Workflow execution lacks observability into activity and step progression  
**Created:** 2026-03-25

---

## Problem Statement

The workflow server orchestrates multi-step workflows through a Goal → Activity → Skill → Tools model. Agents interact with the server via MCP tool calls (`get_activity`, `get_skills`, `next_activity`, etc.), and the server manages session state through HMAC-signed tokens that encode the agent's current position (workflow, activity, skill, condition, sequence number, timestamp).

However, session tokens capture only the *current* position — each `advanceToken` call overwrites the previous state. The existing `withAuditLog` wrapper logs individual tool calls to stderr as JSON, but these logs are per-call and ephemeral; they are not accumulated into a session-level trace that can be retrieved or analyzed after execution completes. The `save_state`/`restore_state` tools preserve workflow state for cross-session resumption but capture a snapshot, not a history.

As a result, there is no structured record of the execution path taken during a workflow session. Diagnosing workflow issues requires reconstructing the path from agent chat logs — an unreliable and time-consuming process.

### System Context

| Component | Role | Current Tracing |
|-----------|------|-----------------|
| `session.ts` | Token encoding/decoding, position tracking | Overwrites on each advance; no history |
| `logging.ts` | `withAuditLog` wrapper for tool calls | Per-call stderr JSON; not aggregated |
| `workflow-tools.ts` | Core workflow navigation tools | Audit-logged but not traced |
| `resource-tools.ts` | Skill/resource loading + `start_session` | Audit-logged but not traced |
| `state-tools.ts` | `save_state`/`restore_state` | State snapshot, not execution trace |
| `validation.ts` | Call-level consistency checks | Results discarded after response |

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — system functions correctly but lacks diagnostic capability |
| Scope | All workflow sessions; all users of the MCP server |
| Business Impact | Workflow debugging is slow and unreliable; workflow improvement is blocked by lack of data |

---

## Problem Classification

**Type:** Inventive Goal — Improvement  
**Subtype:** Improvement goal — adding execution observability to a functioning system  
**Complexity:** Moderate

**Rationale:**  
Nothing is broken; the server processes workflow requests correctly. The goal is to add a new capability (structured execution tracing) that enables debugging, auditing, and workflow improvement. The complexity is moderate because:

- The codebase is small (~30 source files) and well-structured
- Existing patterns provide clear integration points (`withAuditLog` for interception, session tokens for session identity, state-tools for serialization)
- Design decisions are bounded (trace format, storage, retrieval, granularity)
- No external dependencies or complex integrations are needed
- The issue already has well-defined user stories with testable acceptance criteria

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (direct to planning)

**Activities Included:**
- [x] Design Philosophy (this document)
- [ ] ~~Requirements Elicitation~~ — skipped
- [ ] ~~Research~~ — skipped
- [x] Codebase Comprehension
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:**

1. **Requirements are well-defined.** Issue #63 includes three user stories with testable acceptance criteria, clear scope boundaries (in/out), and measurable success metrics. No additional requirements discovery is needed.

2. **Domain is well-understood.** Execution tracing and structured logging are established engineering practices. The codebase already demonstrates the relevant patterns (tool-call interception, session identity, JSON serialization). No external research is needed.

3. **Codebase comprehension and implementation analysis are sufficient.** The moderate complexity and bounded design decisions mean that understanding the existing code and planning the implementation will address all open questions.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Backward Compatibility | Trace capture must not change the behavior or API contract of existing tools |
| Performance | Trace recording must not measurably impact tool call latency |
| MCP Protocol | New trace retrieval must be exposed as MCP tools, consistent with existing patterns |
| Session Scope | Traces are per-session; cross-session aggregation is out of scope |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Trace completeness | Every tool call in a workflow session appears in the trace | 100% of tool calls captured |
| Trace retrievability | Traces accessible after session completion | Retrievable via MCP tool without relying on stderr logs |
| Debugging utility | A workflow issue can be diagnosed from trace data alone | Trace includes activity transitions, step manifests, checkpoint resolutions |
| Zero regression | Existing tests pass without modification | `npm test` passes |

---

## Notes

- The `withAuditLog` wrapper in `logging.ts` is the natural interception point — it already wraps every tool handler and captures tool name, parameters, result status, and duration.
- Session identity is available via `decodeSessionToken` — traces can be keyed by the combination of workflow ID + session timestamp.
- The existing `start_session` tool is the natural trace initialization point; a corresponding retrieval tool would follow the server's existing patterns.
