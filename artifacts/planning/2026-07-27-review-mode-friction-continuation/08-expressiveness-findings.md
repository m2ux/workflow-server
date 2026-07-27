# Schema Expressiveness Findings — `work-package`

**Mode:** update · **Date:** 2026-07-27
**Pass:** expressiveness
**Target:** `work-package` v3.35.4

Post-commit re-walk of every prose passage in the four committed files (`dd1521ba`) against the [schema construct inventory](../../../../workflows/workflow-design/resources/schema-construct-inventory.md) and the Schema Expressiveness / Description Hygiene families. No prose substitutes for a checkpoint, loop, decision, transition, variable, or artifact construct — the change adds no behaviour and no step. The three pre-commit findings are all confirmed **Applied** in the committed tree. One new finding remains, introduced by the `08` fix cycle's own edit.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Low | The fenced base URL slots every variable part of the link (`{ENG_REPO_OWNER}`, `{ENG_REPO_NAME}`, `{ARTIFACT_PUBLISH_REF}`, `{PLANNING_FOLDER}`) except the one part that is *also* variable: the layout-dependent path segment. The fence shows only the engineering-checkout arm (`artifacts/planning/`), while the prose two lines below states both arms. A renderer copying the fence verbatim in the in-tree layout drops the `.engineering/` segment and 404s — the same defect class this change closes. | `resources/review-mode.md:39` (fence) vs `:42` (prose) | Mark the segment in the fence as the layout-dependent one the following sentence defines (e.g. a trailing comment or an elided prefix), so the fence cannot be copied as if it were single-arm. Does **not** require promoting a new slot — G-3 and [A-4](03-assumptions-log.md) stay intact. |

**Finding count:** 1

## Notes

- Pass method: prose-passage walk over the committed diff surface, not the whole workflow. Pre-existing prose outside the change surface is not re-audited here — the `work-package` tree is 110 techniques and 15 activities, and its standing state is tracked in [deferred items](01-deferred-items.md).
- **Prior (pre-commit) pass — all three findings verified Applied in `dd1521ba`,** retained here because find-or-update keeps one instance per bare filename: **F-1** (High, AP-128 `unproduced-value-read`) the publish-ref guard tested "when it is bound" against a variable declaring `defaultValue: ""`, making the fallback unreachable → now reads `when it is non-empty` at `techniques/review-summary.md:56`. **F-2** (Medium, AP-126 `variable-description-one-line`) the two-sentence description with a `defaultValue` restatement and sequencing tail → now one line at `workflow.yaml:341`. **F-3** (Low, AP-119 residue) the "at first render, before the publish step has run" ordering clause in the Inputs entry → dropped, emptiness declaration kept at `techniques/review-summary.md:34`.
- F-1 above is a *consequence* of the prior pass's own conformance fix: making the prose two-arm without touching the fence left the two halves of one statement disagreeing. Recorded so the fix cycle's residue is not lost between passes.
