# Design Philosophy

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**PR:** [#83](https://github.com/m2ux/workflow-server/pull/83) — fix: resolve behavioral prism findings — correctness, diagnostics, and performance  
**Created:** 2026-03-29

---

## Problem Statement

PR #83 resolves 14 of 16 behavioral findings identified by a four-lens behavioral prism analysis of the workflow-server codebase (~3k LOC TypeScript MCP server). The findings span five problem areas:

- **Type safety** — An unsafe generic cast in `decodeToon<T>()` erases all runtime type guarantees, allowing unvalidated data to propagate through three of six loader modules (BF-01, BF-16)
- **Error handling** — 13 bare `catch {}` blocks across six loader files destroy error type, message, and stack trace, making failures invisible to callers and preventing downstream caching (BF-02, BF-14)
- **Validation correctness** — Validation functions treat missing data as "no constraint applies," collapsing three distinct error conditions into the same success return value. The first `next_activity` call bypasses all transition validation (BF-04, BF-09)
- **Performance** — All tool responses are pretty-printed with 2-space indentation for a machine-to-machine protocol, adding ~25-35% whitespace overhead per payload (BF-15). A partial fix threads pre-decoded session payloads to reduce redundant crypto operations (BF-03 partial)
- **Infrastructure** — TraceStore silently drops events for uninitialized sessions (BF-05), rules loading has no validation and masks parse errors as not-found (BF-06), activity validation returns success on failure (BF-08), crypto key fallback skips length validation (BF-10), path security derives from `process.cwd()` (BF-11), transition scope is inconsistent between two functions (BF-12), and condition evaluation silently fails on string/number type mismatches (BF-13)

The core pattern across all findings: abstraction boundaries consistently sacrifice information fidelity for interface simplicity, and this information destruction propagates across error handling, performance, implicit contracts, and API promises simultaneously. Fixing any single dimension shifts cost to the others; effective fixes must operate at the boundary itself.

### System Context

The workflow-server is a TypeScript MCP server that orchestrates AI agent workflows through a Goal → Activity → Skill → Tools model. Agents discover, navigate, and execute structured workflows via tool calls. The server manages session tokens (HMAC-signed), workflow/activity/skill/resource loading from TOON files, state persistence, and execution traces.

The codebase has ~36 source files with a loader layer (workflow, activity, skill, resource, rules), a tools layer (workflow-tools, resource-tools, state-tools), utility modules (session, crypto, validation, toon), and infrastructure (trace, logging, errors).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High — 2 Critical + 5 High findings among the 14 addressed |
| Scope | 17 source files modified across loaders, schemas, tools, utils, and tests |
| Business Impact | Unresolved findings create silent data corruption paths, invisible failures, misleading error messages, and unnecessary resource consumption |

---

## Problem Classification

**Type:** Specific Problem  

**Subtype:**  
- [x] Cause Known (direct fix)  
- [ ] Cause Unknown (investigate first)  
- [ ] Improvement goal  
- [ ] Prevention goal  

**Complexity:** Moderate  

**Rationale:** Each of the 14 findings has a documented root cause with specific file locations and line numbers from the behavioral prism analysis. The changes are targeted fixes, not architectural redesigns. However, the aggregate scope (14 fixes across 17 files, +154/-71 lines) requires careful review for interaction effects between fixes, backward compatibility implications, and test coverage adequacy — only 2 of 14 findings have dedicated test changes.

---

## Workflow Path Decision

**Selected Path:** Research-only (skip elicitation, include research before review)

**Activities Included:**  
- [ ] Requirements Elicitation — Skipped (review mode; requirements defined by the 14 findings)  
- [x] Codebase Comprehension — Understand the codebase areas affected by changes  
- [x] Research — Verify fix correctness and completeness against the behavioral analysis  
- [ ] Plan & Prepare — Skipped (implementation already complete)  
- [x] Post-Implementation Review — Code review, test review, change block index  
- [x] Strategic Review — Scope focus and artifact cleanliness  
- [x] Complete — Deliverables summary and retrospective  

**Rationale:** The behavioral prism analysis provides a comprehensive problem definition (eliminating the need for elicitation), but a research phase is warranted to verify that each fix correctly addresses its finding and to identify any interaction effects between the 14 changes. The analysis artifacts (REPORT.md, behavioral-errors/costs/changes/promises/synthesis.md) serve as the reference baseline for evaluating fix correctness. Post-implementation review then examines the actual code changes against these verified expectations.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Scope | 14 of 16 findings; BF-03 (full triple-decode fix) and BF-07 (workflow caching) are explicitly deferred — they require handler-pattern changes |
| Backward Compatibility | All changes must be backward-compatible; BF-08 (activity validation return path change) is the highest-risk item |
| Test Coverage | Only 2 of 14 findings have dedicated test changes; review must assess whether additional test coverage is warranted |
| Dependencies | No external dependencies; all changes are internal to the workflow-server codebase |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Finding resolution | Each fix verifiably addresses its documented root cause | 14/14 findings resolved |
| No regressions | Existing tests continue to pass | `npm test` passes |
| Type safety | No new TypeScript errors introduced | `npm run typecheck` passes |
| Backward compatibility | No breaking changes to tool API contracts | All tool response shapes preserved |
| Test coverage assessment | Each finding's test coverage evaluated | Coverage gaps documented with risk assessment |

---

## Notes

- The behavioral prism analysis artifacts in the planning folder (REPORT.md, behavioral-errors.md, behavioral-costs.md, behavioral-changes.md, behavioral-promises.md, behavioral-synthesis.md) serve as the authoritative reference for what each finding describes and what correct resolution looks like.
- Two findings are explicitly deferred to a separate PR: BF-03 full fix (eliminate triple session token decode — requires modifying `withAuditLog` return type and `advanceToken` signature across all handlers) and BF-07 (workflow caching — requires in-memory cache with mtime invalidation, replacing sequential with parallel I/O, and converting `existsSync` to async).
- The PR includes a partial BF-03 fix: `advanceToken` now accepts an optional pre-decoded payload, enabling callers to skip one of the three decode operations.
