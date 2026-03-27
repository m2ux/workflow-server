# Design Philosophy

**Work Package:** Tools Session Protocol (WP-07)  
**Issue:** #67 - Quality & Consistency Audit Remediation  
**Created:** 2026-03-27

---

## Problem Statement

The workflow-server tool handlers independently interpret session protocol requirements with no shared specification. A structural analysis identified 17 findings (10 medium, 7 low severity) across three files (`resource-tools.ts`, `state-tools.ts`, `workflow-tools.ts`) where protocol behavior is inconsistent, error handling is missing, or type safety is eroded.

### System Context

The tools layer comprises three files that implement MCP tool handlers:
- `resource-tools.ts` — `get_skills`, `start_session`, resource deduplication
- `state-tools.ts` — `save_state`, `load_state`, state encryption, workflow validation
- `workflow-tools.ts` — `get_trace`, activity transitions, tool protocol description

These handlers mediate between MCP clients (AI agents) and the workflow engine. They receive session tokens, validate requests, and return structured responses. The session protocol governs token lifecycle, error reporting, and response format — but exists only as prose in the `help` response, with handlers implementing divergent interpretations.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — no security vulnerabilities but operational reliability at risk |
| Scope | All tool handlers; affects every agent session |
| Business Impact | Silent failures cause agents to operate on incomplete data; protocol inconsistencies make conformance verification impossible |

---

## Problem Classification

**Type:** Specific Problem  

**Subtype:**  
- [x] Cause Known (direct fix)  
- [ ] Cause Unknown (investigate first)  
- [ ] Improvement goal  
- [ ] Prevention goal  

**Complexity:** Moderate  

**Rationale:** The 17 findings are individually straightforward (known cause, clear fix), but collectively span protocol-level concerns across 3 files. Coordinating fixes requires understanding cross-cutting patterns (token location, validation, error surfacing) and verifying that changes don't break the existing test suite. This is more than a simple bug fix but less than a complex architectural redesign.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (direct to comprehension → planning)

**Activities Included:**
- [x] Codebase Comprehension
- [x] Plan & Prepare
- [x] Assumptions Review
- [x] Implement

**Rationale:** The audit report provides a complete findings inventory with specific file locations, root causes, and suggested fixes. Requirements are fully defined — no elicitation needed. The codebase is the source of truth — no external research needed. Comprehension of the 3 target files is the only prerequisite before planning.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Scope | Changes limited to `src/tools/` — resource-tools.ts, state-tools.ts, workflow-tools.ts |
| Backward Compat | All fixes must preserve existing API contracts; no breaking changes |
| Dependencies | No dependency on other WPs (WP-07 is independent) |
| Testing | Must pass existing test suite after all changes |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| All 17 findings addressed | Each finding has a corresponding code change | 17/17 |
| No regressions | `npm test` and `npm run typecheck` pass | Zero failures |
| Backward compatible | No breaking API changes | No response shape changes that would break clients |
| Error surfacing | Previously silent failures produce actionable output | All swallowed errors surfaced |

---

## Notes

- QC-037 (token return location) requires verifying whether other tools already use `_meta` for tokens, or if this is specific to `start_session`. This will be resolved during codebase comprehension.
- QC-034/035 (encryption key hardcoding and rotation) may require a pragmatic approach — full key rotation with migration is out of scope for a bug-fix WP. A configurable key with documentation may suffice.
