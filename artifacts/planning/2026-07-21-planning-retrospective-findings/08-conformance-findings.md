# Conformance Findings — `workflow-design` / `work-package`

**Mode:** update · **Date:** 2026-07-21
**Pass:** conformance
**Target:** `workflow-design` v1.29.0 (draft) · `work-package` v3.34.0 (draft)

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| C-1 | High | Compliance report is persisted twice: existing `persist-report` step remains and a sibling `persist-compliance-report-artifact` (`write-artifact`) was added for the same review-mode path | `workflow-design/activities/08-quality-review.yaml` (`persist-compliance-report` + `persist-compliance-report-artifact`) | Keep one persist path — either bind `write-artifact` with report inputs and drop `persist-report`, or keep `persist-report` and remove the extra write-artifact step |
| C-2 | Medium | Procedural work encoded as `action: message` steps while siblings put detection/manifest rules in techniques | `work-package/activities/10-post-impl-review.yaml` (`detect-manual-review-edits`); `workflow-design/activities/09-validate-and-commit.yaml` (`assert-completed-steps-manifest`) | Remove the action steps; keep the already-drafted protocol bullets in `review-diff.md` / `commit-verification.md` (match assumption-interview / verify patterns) |
| C-3 | Medium | New soft checkpoint uses confirm-imperative opener (“Confirm before continuing…”) vs sibling statement-shaped messages (e.g. assumption-interview) | `work-package/activities/14-complete.yaml` (`retrospective-confirm`) | Rewrite message as a subject statement; put the decision in option labels only |

**Finding count:** 3

## Notes

- Cross-workflow `work-package::manage-artifacts::write-artifact` qualification matches existing workflow-design binds — **justified**.
- Bare `write-artifact` binds without `inputs:` match `15-codebase-comprehension.yaml` — **justified for this pass** (still tracked as expressiveness F-3).
- `block-interview-loop` forEach + `#{…}` checkpoint shape matches `assumption-interview` — **conforming**.
- File naming (`follow-ups.md`), semver bumps on workflow.yaml, and resource front-matter versions — **conforming**.
