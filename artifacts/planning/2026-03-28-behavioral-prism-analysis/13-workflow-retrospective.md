# Workflow Retrospective

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**Date:** 2026-03-29  
**Mode:** Review  
**Activities Completed:** start-work-package → design-philosophy → codebase-comprehension → research → implementation-analysis → post-impl-review → validate → strategic-review → submit-for-review → complete

---

## What Went Well

1. **Assumption reconciliation caught the BF-16 gap early.** During the design-philosophy activity, targeted code analysis identified that `readResource` still lacks Zod validation — a gap the PR description did not surface. This finding shaped the entire review trajectory and led to the CR-01 structural validation requirement.

2. **Research phase added measurable value.** The user confirmed (A-WP-02) that research was valuable. It contextualized the PR's approach against Zod trust-boundary patterns, MCP error models, and Result type best practices. Three new assumptions surfaced that would not have emerged from code review alone (logWarn sufficiency, advisory vs enforcement, call-site vs structural validation).

3. **User-driven schema harmonization finding.** The manual diff review surfaced the `.passthrough()` → `.strict()` issue (RC-02), which led to a productive discussion about `execution_pattern` refactoring and TOON file harmonization. This would have been missed by automated review alone.

4. **Quantitative baselines grounded the review.** The implementation-analysis activity established precise counts (14 bare catch blocks, 4 unvalidated decode paths, 17 pretty-print sites, 26 existsSync calls) that made the review evidence-based rather than impression-based.

5. **Deferred findings documented thoroughly.** BF-03 and BF-07 deferral rationale was captured in `deferred-findings.md` with handler-pattern dependencies, performance impact estimates, and phased follow-up recommendations. This provides a clear path for the follow-up PR.

---

## What Could Improve

1. **Pre-answered checkpoints added friction.** The `review-mode-detection` and `review-pr-reference` checkpoints were yielded despite being pre-answered by the orchestrator. In review mode, these could be auto-resolved when the orchestrator provides the answers upfront.

2. **Assumption interview was one-at-a-time.** Interviewing 7 open assumptions required 7 sequential checkpoint round-trips. The `review-assumptions` skill recommends batch presentation but the checkpoint protocol required individual yields. A batch interview with a single checkpoint would reduce round-trips.

3. **Plan-prepare was correctly skipped but not formally.** The workflow path selected "research-only" which skips elicitation but doesn't explicitly skip plan-prepare. The activity was skipped by the orchestrator's transition logic, but a clearer mechanism (e.g., `skipActivities` in the mode definition) would reduce ambiguity.

4. **Comprehension activity scope.** For a review of targeted fixes in a codebase with 6 existing comprehension artifacts, the full comprehension protocol (architecture survey → abstractions → rationale → domain mapping → deep-dive → lens pass) was more thorough than needed. A lighter "review-mode comprehension" focused on the specific code paths being reviewed would be more efficient.

5. **Single-commit PR limits review granularity.** The PR packs 14 findings into one commit, making it impossible to review or revert individual fixes independently. This is a PR structure issue, not a workflow issue, but the review workflow could recommend commit splitting earlier.

---

## Lessons Learned

1. **`.passthrough()` vs `.strict()` is a design decision worth discussing early.** The `.passthrough()` on `SkillSchema` was added in the PR to preserve domain-specific fields during validation — a reasonable defensive choice. But it defeats the purpose of schema validation for unknown fields. This tension should be raised during design-philosophy, not discovered during manual diff review.

2. **Structural validation is more robust than call-site validation.** The BF-16 resource gap proves that voluntary call-site validation allows callers to be missed. Requiring a schema parameter in `decodeToon` (CR-01) enforces validation at the boundary itself. This principle — enforce at the boundary, not downstream — should be a review heuristic for future PRs.

3. **`ExecutionPatternSchema` is legacy infrastructure.** It was defined in `skill.schema.ts` but never wired into `SkillSchema`. The `execution_pattern` field in TOON files is better expressed through the existing `protocol` + `tools` constructs. Legacy schemas that aren't connected to their parent should be flagged during schema reviews.

4. **Advisory validation is a valid design choice but needs documentation.** The BF-09 `initialActivity` "enforcement" being advisory-only (warning, not rejection) is consistent with the server's design but surprising. The `validation-as-metadata` pattern should be documented in the server's architecture docs so reviewers and consumers understand that validation warnings are informational, not blocking.

5. **Review mode benefits from existing comprehension artifacts.** The 6 existing comprehension artifacts (orchestration.md, utils-layer.md, etc.) significantly accelerated the review. Building comprehension artifacts during implementation work packages pays dividends during subsequent reviews.

---

## Metrics

| Metric | Value |
|--------|-------|
| Activities completed | 10 |
| Artifacts produced | 14 (planning) + 1 (comprehension) |
| Assumptions identified | 13 |
| Assumptions resolved by code | 6 |
| Assumptions resolved by user | 6 (5 confirmed, 1 corrected) |
| Assumptions deferred | 1 |
| Required changes identified | 3 (CR-01, CR-02, CR-03) |
| Test recommendations | 5 (TR-01 through TR-05) |
| Findings correctly implemented | 13 of 14 |
| Validation | 209 tests pass, build clean, typecheck clean |
| PR review posted | Yes (comment — author self-review restriction) |

---

## Next Steps for PR Author

1. **Address 3 required changes** (CR-01, CR-02, CR-03):
   - Modify `decodeToon<T>()` to require schema parameter
   - Change `SkillSchema.passthrough()` → `.strict()`, harmonize meta skill TOON files
   - Create `ResourceSchema` for resource validation

2. **Add test coverage** (TR-01 through TR-05):
   - `tests/validation.test.ts` for BF-04/BF-09/BF-13
   - `tests/rules-loader.test.ts` for BF-06
   - Additional cases for BF-08, BF-12

3. **Consider structural improvements** (CR-04, CR-05, BH-2):
   - Extract `RulesSchema` to dedicated schema file
   - Document `advanceToken` `decoded` parameter
   - Split single commit into thematic commits
