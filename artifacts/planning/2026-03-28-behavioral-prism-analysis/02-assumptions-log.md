# Assumptions Log

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**Created:** 2026-03-29  
**Activity:** design-philosophy, research

---

## Reconciliation Summary

```
Design-philosophy phase:
  Total: 10 | Validated: 1 | Partially Validated: 4 | Open: 4 | Newly Surfaced: 1
  Convergence iterations: 1

Research phase (assumption interview):
  Open assumptions interviewed: 7
  Confirmed: 5 (A-WP-01, A-WP-02, A-WP-03, A-RS-01, A-RS-02)
  Corrected: 1 (A-RS-03 — structural fix required for decodeToon)
  Deferred: 1 (A-PI-03 — deferred findings scope)

Final state:
  Total: 13 | Code-resolved: 6 | User-confirmed: 5 | User-corrected: 1 | Deferred: 1
  REQUIRED CHANGES: decodeToon must require schema parameter (CR-01)
```

---

## Problem Interpretation

### A-PI-01: Fix-to-finding correspondence
**Status:** Partially Validated  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** Each of the 14 fixes in PR #83 corresponds 1:1 to the BF-XX findings in REPORT.md, targeting the exact root cause described in each finding.  
**Finding:** 13 of 14 findings correctly map to their documented root causes. BF-16 is only partially resolved — the REPORT names both `readSkill` and `readResource` as lacking validation, but only `readSkill` received Zod validation. `readResource` in `resource-loader.ts` received only catch-block logging improvements (BF-02), not schema validation.  
**Evidence:** `src/loaders/resource-loader.ts` diff shows 2 catch-block changes (lines 213, 302) but no `safeValidate*` or `ResourceSchema` additions. Compare with `src/loaders/skill-loader.ts` diff which adds `safeValidateSkill` import and validation in `tryLoadSkill`.  
**Risk if wrong:** Review may conclude BF-16 is fully resolved when a data corruption path through `readResource` remains open.

### A-PI-02: PR changes section accuracy
**Status:** Partially Validated  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** The PR's Changes section accurately describes what each fix does — the actual code modifications match the prose descriptions.  
**Finding:** The PR description accurately describes what was implemented. However, the BF-16 entry ("Type safety (BF-01, BF-16): Add Zod validation to skill loading") correctly describes the action taken but does not surface the scope gap — BF-16's REPORT definition includes both `readSkill` and `readResource`, but only `readSkill` was fixed.  
**Evidence:** PR Changes section reviewed against full diff of all 18 files. All other descriptions match their corresponding code changes.  
**Risk if wrong:** Low residual risk — the scope gap is now documented.

### A-PI-03: Deferred findings scope
**Status:** Deferred-to-Stakeholder  
**Resolvability:** Not code-analyzable  
**Assumption:** BF-03 (full triple-decode fix) and BF-07 (workflow caching) are correctly scoped out because they genuinely require handler-pattern changes that would be inappropriate in this PR.  
**Rationale:** The PR states these require "handler pattern changes" but does not elaborate on what specific handler-pattern dependencies prevent inclusion.  
**Outcome:** Deferred to stakeholder review. Full deferral rationale captured in [deferred-findings.md](deferred-findings.md).

---

## Complexity Assessment

### A-CA-01: Fix independence
**Status:** Validated  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** The 14 fixes are largely independent — interaction effects between fixes are minimal.  
**Finding:** Traced all 14 fixes across the diff. Each operates on distinct code paths within its module. No cascading or emergent interactions found. BF-04/BF-09 are complementary changes in the same function (`validateActivityTransition`), which is expected and documented.  
**Evidence:** skill-loader validation (BF-01) and catch-block logging (BF-02) are sequential in `tryLoadSkill` — validation runs first, catch handles decode exceptions. Similar pattern in rules-loader (BF-06 validation before BF-02 catch). Activity-loader BF-08 return path and BF-02 catch are on separate exception vs. result paths. workflow-loader BF-12 and BF-02 are in different functions.

### A-CA-02: BF-08 backward compatibility risk
**Status:** Partially Validated  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** BF-08 is the highest backward-compatibility risk.  
**Finding:** BF-08 is confirmed high-risk: `readActivityFromWorkflow` now returns `err(ActivityNotFoundError)` instead of `ok(rawData)` on validation failure. This was previously the de facto backward-compatibility mechanism for schema evolution. However, BF-06 (rules validation) has comparable risk — the new `RulesSchema` requires id, version, title, description, precedence, and sections. If any existing rules file lacks these fields, ALL session creation blocks with a validation error instead of loading silently. Rules are a harder dependency than individual activities.  
**Evidence:** `src/loaders/rules-loader.ts` diff: `RulesSchema` is defined with 6 required top-level fields and a required sections array of objects. `readRules` returns `err(new RulesNotFoundError('Rules file exists but failed validation: ...'))` on validation failure.  
**Risk if wrong:** Review attention allocated only to BF-08 may miss equal or greater compatibility risk from BF-06.

### A-CA-03: Test coverage adequacy
**Status:** Partially Validated  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** The test coverage gap (12 of 14 findings without dedicated tests) represents acceptable risk.  
**Finding:** The gap is real and risk is not uniform. Highest-risk untested changes:  
1. **BF-04/BF-09** — Core validation logic changes (`validateActivityTransition`, `validateSkillAssociation`) that alter warning/error returns for missing-data conditions. No test coverage.  
2. **BF-06** — New RulesSchema validation gates ALL session creation. No test for the schema or validation path.  
3. **BF-08** — Return path change from `ok(rawData)` to `err(...)`. No test for the new behavior.  
4. **BF-12** — Transition scope expansion (decisions + checkpoints). No test verifying the unified scope.  
Lower-risk untested changes (BF-02 catch logging, BF-15 pretty-print removal, BF-11 parameter addition) are less likely to regress silently.  
**Evidence:** `tests/` diff shows only `skill-loader.test.ts` (3 cases for BF-01) and `trace.test.ts` (1 case for BF-05) modified. No test files exist for validation.ts, rules-loader validation, or workflow-loader transition scope.  
**Risk if wrong:** Untested validation logic and rules schema changes could regress silently in future changes, breaking core workflow functionality.

---

## Workflow Path

### A-WP-01: Analysis artifacts as research baseline
**Status:** Confirmed  
**Resolvability:** Not code-analyzable (resolved by user)  
**Assumption:** The behavioral prism analysis artifacts are complete and accurate and can serve as the reference baseline for evaluating fix correctness.  
**Rationale:** These artifacts were generated against the pre-PR codebase. Their accuracy has not been independently verified.  
**Outcome:** User confirmed. Reconciliation validated 13/14 fix-to-finding mappings. The one discrepancy (BF-16) was a PR implementation gap, not an analysis error.

### A-WP-02: Research-before-review value
**Status:** Confirmed  
**Resolvability:** Not code-analyzable (resolved by user)  
**Assumption:** Including a research phase before post-implementation review will meaningfully improve review quality by verifying the fix-to-finding mapping before examining code quality.  
**Rationale:** User selected "research-only" path. Research would verify fix correctness against the behavioral analysis before examining code quality.  
**Outcome:** User confirmed. Research identified 5 validating and 4 gap-identifying patterns, contextualized the PR's approach against MCP and Zod best practices, and surfaced 3 new assumptions.

### A-WP-03: Plan-prepare correctly skipped
**Status:** Confirmed  
**Resolvability:** Not code-analyzable (resolved by user)  
**Assumption:** Plan & Prepare is correctly skipped because implementation is already complete in PR #83.  
**Rationale:** In review mode, the implementation is a given. Planning typically precedes implementation.  
**Outcome:** User confirmed. PR description (with acceptance criteria, test plan, success metrics) and REPORT.md provide sufficient structured breakdown.

---

## Newly Surfaced (Reconciliation)

### A-NS-01: Resource validation gap
**Status:** Validated (gap confirmed)  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** BF-16 is fully resolved by the PR.  
**Finding:** BF-16 names both `readSkill` and `readResource` as lacking Zod validation. The PR adds validation to `readSkill` (via `safeValidateSkill` in `tryLoadSkill`) but NOT to `readResource`. The resource-loader.ts diff shows only catch-block logging improvements, not schema validation. `readResource` still calls `decodeToon<Resource>(content)` with no validation step, returning unvalidated data as `Result<Resource>`.  
**Evidence:** `src/loaders/resource-loader.ts` diff contains 2 catch-block changes (BF-02) but zero schema validation additions. `src/loaders/skill-loader.ts` diff shows the `safeValidateSkill` import and validation call that resource-loader lacks.  
**Impact:** Resource data corruption paths remain open. A malformed resource TOON file with field typos returns `success: true` with undefined fields.

---

## Research Phase Assumptions

### A-RS-01: logWarn is sufficient error visibility for catch blocks
**Status:** Confirmed  
**Resolvability:** Not code-analyzable (resolved by user)  
**Assumption:** The BF-02 approach of adding `logWarn()` to catch blocks (while preserving fallback returns) provides sufficient error visibility for the current use case.  
**Rationale:** Web research confirms that the Result type pattern's primary benefit is making errors explicit in function signatures. The `logWarn` approach adds operator observability (stderr) but does not make errors programmatically visible to callers — they still cannot distinguish "zero results" from "error occurred." However, changing catch blocks to propagate errors would require API shape changes affecting all tool handlers.  
**Outcome:** User confirmed logWarn is sufficient for this PR. Result-based error propagation (CR-02) remains a valid long-term improvement but is out of scope.

### A-RS-02: Advisory validation is the correct enforcement model
**Status:** Confirmed  
**Resolvability:** Not code-analyzable (resolved by user)  
**Assumption:** The BF-09 initialActivity check producing a warning (not a rejection) is the correct enforcement model, consistent with the server's validation-as-metadata design.  
**Rationale:** MCP best practices recommend structured error content for tool-level failures. The workflow-server uses an advisory model where validation results are informational metadata in `_meta.validation`. The BF-09 change is consistent with this existing pattern, but agents expecting enforcement may be surprised.  
**Outcome:** User confirmed advisory model is correct. Consistent with existing validation-as-metadata pattern. Blocking enforcement would be an architectural change beyond scope.

### A-RS-03: Call-site validation is preferable to decodeToon signature change
**Status:** Corrected  
**Resolvability:** Not code-analyzable (resolved by user)  
**Assumption:** The PR's approach of adding Zod validation at individual call sites (BF-01, BF-06) is preferable to the REPORT's recommended fix of requiring a schema parameter in `decodeToon<T>()` (CR-01).  
**Rationale:** The call-site approach is less invasive (doesn't change a shared function signature used by 10+ call sites) but leaves the `as T` cast in place — future callers can still skip validation. The structural approach (schema parameter) would enforce validation at every call site but requires touching all callers.  
**Outcome:** User corrected — structural fix required. `decodeToon<T>()` must accept a schema parameter per CR-01. Call-site approach is insufficient; the BF-16 resource gap is direct evidence of the caller-miss risk. **This is a REQUIRED CHANGE for PR #83.**
