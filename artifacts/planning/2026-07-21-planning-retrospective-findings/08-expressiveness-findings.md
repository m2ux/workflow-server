# Expressiveness Findings — `workflow-design` / `work-package`

**Mode:** update · **Date:** 2026-07-21
**Pass:** expressiveness
**Target:** `workflow-design` v1.29.0 (draft) · `work-package` v3.34.0 (draft)

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Critical | Inserting `manage-artifacts::write-artifact` steps between a technique bind and its `condition:` detached the step gate onto the persist step only; producer techniques now run ungated | `workflow-design/activities/08-quality-review.yaml` (`audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement`, `verify-high-findings`); `05-impact-analysis.yaml` (`impact-analysis`); `11-retrospective.yaml` (`create-completion-doc`) | Restore each producer’s original `condition` on the technique step; keep a separate gate on the persist step (mode and/or finding-count) |
| F-2 | High | Protocol still encodes “when finding_count > 0, persist” in prose while the new activity persist steps run whenever the (stolen) mode gate matches — no formal `condition` on `{*_finding_count}` / non-empty path | `08-quality-review.yaml` persist-\* findings steps; audit technique Persist sections that still narrate the count gate | Add `condition` on each findings persist step (`expressiveness_finding_count` / siblings `> 0`, or path non-empty); drop duplicate count-gate narration from protocol once the step gate owns it |
| F-3 | High | Bound `write-artifact` steps carry no `technique.inputs` deviations (`bare_filename`, `artifact_content` / report payload, `target_dir`); persist parameters remain only in calling-technique protocol prose | All new `work-package::manage-artifacts::write-artifact` steps under `workflow-design/activities/01`–`11` | Bind each persist step with explicit `inputs` (rename/template from producer outputs) so the operation signature is satisfied at the activity bind site |
| F-4 | Medium | Retrospective “one item, confirm before continue” remains protocol prose (+ a single end-of-technique checkpoint) rather than a `forEach` + per-item checkpoint like `block-interview` | `work-package/techniques/conduct-retrospective/retrospective.md`; `work-package/activities/14-complete.yaml` (`retrospective-confirm`) | Produce a bag list of interview items and wrap per-item confirm in `kind: loop` `forEach` + `checkpoint` `#{item}` (mirror `block-interview-loop`) |

**Finding count:** 4

## Notes

- F-1 is a systematic insert-before-condition drafting error (diff placed the new step between `technique:` and the following `condition:`).
- Intake `persist-structural-inventory` correctly gained its own `operation_type` or-gate and did not steal a producer condition.
- Work-package `block-interview` → `forEach` is schema-expressive and is not flagged.
