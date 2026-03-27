# Design Philosophy

**Work Package:** WP-10: Server Core Cleanup  
**Issue:** #67 — Quality & Consistency Audit Remediation  
**Created:** 2026-03-27

---

## Problem Statement

The server core layer (7 files: `server.ts`, `trace.ts`, `logging.ts`, `config.ts`, `index.ts`, `errors.ts`, `result.ts`) contains 14 findings from the structural prism analysis. Five medium-severity issues affect correctness and operational reliability: config mutation, unbounded session growth, incomplete token validation, double-append on error, and a key-generation race condition. Nine low-severity issues reduce type safety, operational predictability, and error fidelity.

### System Context

These files form the server bootstrap, configuration, tracing, error handling, and logging infrastructure. They are used by every tool handler and resource registration path. Changes here affect all downstream tool behavior but are themselves leaf-level — no other core modules depend on `result.ts` or `errors.ts` in complex ways.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium (5 findings) + Low (9 findings) |
| Scope | Server startup, tracing, error handling, logging |
| Business Impact | Memory leak under sustained use; corrupted trace data on error; missed token validation could accept malformed payloads |

---

## Problem Classification

**Type:** Specific Problem  
**Subtype:** Cause Known (direct fix) — all 14 findings have identified root causes from the audit  
**Complexity:** Simple-to-Moderate  
**Rationale:** 14 findings across 7 files, but each fix is localized and independent. No architectural redesign required. The fixes follow established patterns already present in the codebase (e.g., WP-08 already hardened utils with similar patterns). The trace store eviction is the most complex change but follows standard LRU approaches.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (direct to planning → implementation)

**Activities Included:**
- [x] Design Philosophy (this document)
- [ ] ~~Requirements Elicitation~~ — not needed, findings are fully specified
- [ ] ~~Research~~ — not needed, solutions use standard patterns
- [x] Change Plan
- [x] Risk Assessment
- [x] Assumptions Review
- [x] Implementation
- [x] Post-Implementation Review

**Rationale:** All 14 findings have explicit root causes and straightforward fixes. No requirements ambiguity exists — each finding specifies what is wrong and the success criteria are clear (typecheck + tests pass, behaviors corrected). The patterns needed (shallow clone, LRU eviction, field validation, typed unions) are well-understood.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Part of larger audit remediation; should be efficient |
| Technical | Must maintain backward compatibility — no public API changes |
| Dependencies | Rebased onto main with WP-01,02,03,05,07,08 merged |
| Resources | Single-agent execution |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| All 14 findings addressed | Code review against finding list | 14/14 |
| Type safety | `npm run typecheck` passes | Zero errors |
| Test suite | `npm test` passes | All passing |
| No regressions | Existing behavior preserved | No test failures |
| Config immutability | `createServer` does not mutate input | Verified by code inspection |
| Session bound | `TraceStore` evicts old sessions | Configurable max |

---

## Notes

The `getOrCreateServerKey` race (QC-060) overlaps with WP-08's TOCTOU fix for the same function. WP-08 addressed the file-system TOCTOU in `crypto.ts`; QC-060 addresses the in-memory concurrency race where multiple callers could trigger parallel key generation. The fix here adds a module-level promise lock in `trace.ts` where `getOrCreateServerKey` is called, not in the function itself.
