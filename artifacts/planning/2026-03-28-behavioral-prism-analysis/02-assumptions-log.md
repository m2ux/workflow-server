# Assumptions Log

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**Created:** 2026-03-29  
**Activity:** design-philosophy

---

## Reconciliation Summary

```
Total: 10 | Validated: 1 | Partially Validated: 4 | Open: 4 | Newly Surfaced: 1
Convergence iterations: 1
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
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** BF-03 (full triple-decode fix) and BF-07 (workflow caching) are correctly scoped out because they genuinely require handler-pattern changes that would be inappropriate in this PR.  
**Rationale:** The PR states these require "handler pattern changes" but does not elaborate on what specific handler-pattern dependencies prevent inclusion.  
**What would resolve it:** Stakeholder judgment on whether the handler-pattern boundary is the right scoping criterion, or whether a larger PR could accommodate these changes.

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
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** The behavioral prism analysis artifacts are complete and accurate and can serve as the reference baseline for evaluating fix correctness.  
**Rationale:** These artifacts were generated against the pre-PR codebase. Their accuracy has not been independently verified.  
**What would resolve it:** Spot-checking a sample of findings against the pre-fix code (on the base branch) would validate the analysis, but this is a process decision.

### A-WP-02: Research-before-review value
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Including a research phase before post-implementation review will meaningfully improve review quality by verifying the fix-to-finding mapping before examining code quality.  
**Rationale:** User selected "research-only" path. Research would verify fix correctness against the behavioral analysis before examining code quality.  
**What would resolve it:** Stakeholder judgment on review thoroughness vs. time investment.

### A-WP-03: Plan-prepare correctly skipped
**Status:** Open  
**Resolvability:** Not code-analyzable  
**Assumption:** Plan & Prepare is correctly skipped because implementation is already complete in PR #83.  
**Rationale:** In review mode, the implementation is a given. Planning typically precedes implementation.  
**What would resolve it:** Stakeholder judgment on whether a retroactive plan artifact would aid the review.

---

## Newly Surfaced (Reconciliation)

### A-NS-01: Resource validation gap
**Status:** Validated (gap confirmed)  
**Resolvability:** Code-analyzable (resolved)  
**Assumption:** BF-16 is fully resolved by the PR.  
**Finding:** BF-16 names both `readSkill` and `readResource` as lacking Zod validation. The PR adds validation to `readSkill` (via `safeValidateSkill` in `tryLoadSkill`) but NOT to `readResource`. The resource-loader.ts diff shows only catch-block logging improvements, not schema validation. `readResource` still calls `decodeToon<Resource>(content)` with no validation step, returning unvalidated data as `Result<Resource>`.  
**Evidence:** `src/loaders/resource-loader.ts` diff contains 2 catch-block changes (BF-02) but zero schema validation additions. `src/loaders/skill-loader.ts` diff shows the `safeValidateSkill` import and validation call that resource-loader lacks.  
**Impact:** Resource data corruption paths remain open. A malformed resource TOON file with field typos returns `success: true` with undefined fields.
