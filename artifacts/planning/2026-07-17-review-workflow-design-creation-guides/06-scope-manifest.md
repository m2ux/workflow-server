# Scope Manifest — pattern_analysis Output + #template cites + quality-review auto-fix

**Target:** `workflow-design` v1.24.4 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-17-workflow-design-slim-planning-artifacts/workflow-design` ✅ · folder layout unchanged

Nine files across two change blocks on the same PR branch: seven technique files (declare undeclared `{pattern_analysis}` Output; append `#template` on bare persist/compile guide cites), plus the quality-review auto-fix follow-on (`activities/08-quality-review.yaml` + `activities/README.md`). Intentional removals: **4** — the four per-pass disposition checkpoints ([impact §4](05-impact-analysis.md#4-follow-on-change--quality-review-auto-fix-2026-07-17-return-to-draft)).

`file_count` = **9**

---

## Return-to-draft (binding-fidelity pass) — 2026-07-17

`validate-and-commit`'s schema-validation step ran `scripts/check-binding-fidelity.ts` against the branch and surfaced **21 NEW** violations — 20 `dead-output` (an own-file Output nothing outside that file consumes) and 1 `orphan-input` (an own-declared Input with no producer in the binding workflow) — none hidden via `--update-baseline`. Twenty files across `workflow-design` and `work-package` close every one; `workflow.yaml` stays at v1.24.4 (no root-metadata change this pass).

`file_count` (this pass) = **20**

| # | Path | Type | Action | One-line change |
|---|------|------|--------|-----------------|
| 1 | `workflow-design/techniques/audit-expressiveness.md` | technique | modify | Move `#### artifact` from `expressiveness_findings_path` onto `expressiveness_findings`; bump 1.3.0 → 1.3.1 |
| 2 | `workflow-design/techniques/audit-conformance.md` | technique | modify | Move `#### artifact` from `conformance_findings_path` onto `conformance_findings`; bump 1.4.0 → 1.4.1 |
| 3 | `workflow-design/techniques/audit-rule-hygiene.md` | technique | modify | Move `#### artifact` from `rule_hygiene_findings_path` onto `rule_hygiene_findings`; bump 1.3.0 → 1.3.1 |
| 4 | `workflow-design/techniques/audit-rule-enforcement.md` | technique | modify | Move `#### artifact` from `enforcement_findings_path` onto `enforcement_findings`; bump 1.3.0 → 1.3.1 |
| 5 | `workflow-design/techniques/audit-anti-patterns.md` | technique | modify | Move `#### artifact` from `anti_pattern_findings_path` onto `anti_pattern_findings`; bump 1.12.0 → 1.12.1 |
| 6 | `workflow-design/techniques/audit-principles.md` | technique | modify | Move `#### artifact` from `principle_findings_path` onto `principle_findings`; bump 1.3.0 → 1.3.1 |
| 7 | `workflow-design/techniques/assemble-file-approach.md` | technique | modify | Move `#### artifact` from `drafting_plan_path` onto `drafting_plan`; bump 1.2.3 → 1.2.4 |
| 8 | `workflow-design/techniques/pattern-analysis.md` | technique | modify | Move `#### artifact` from `pattern_analysis_path` onto `pattern_analysis`; bump 1.2.3 → 1.2.4 |
| 9 | `workflow-design/techniques/review-drafted-file.md` | technique | modify | Move `#### artifact` from `file_review_note_path` onto `file_review_note`; convert `removal_inventory` Output to `{$removal_inventory}` local; bump 1.2.2 → 1.3.0 |
| 10 | `workflow-design/techniques/capture-dimension.md` | technique | modify | Convert `dimension_capture` Output to `{$dimension_capture}` local; bump 1.0.0 → 1.1.0 |
| 11 | `workflow-design/techniques/scope-definition.md` | technique | modify | Convert `structural_design`/`drafting_order` Outputs to `{$structural_design}`/`{$drafting_order}` locals; bump 1.2.1 → 1.3.0 |
| 12 | `workflow-design/techniques/intake-classification.md` | technique | modify | Convert `design_intent` Output to `{$design_intent}` local; bump 2.4.1 → 2.5.0 |
| 13 | `workflow-design/techniques/publish-workflow-pr.md` | technique | modify | Convert `pr_title`/`pr_body` Outputs to `{$pr_title}`/`{$pr_body}` locals (keep `pr_url`/`pr_number`); capture `{pushed_branch}` after push-branch and `{pr_status}` after mark-ready; bump 1.1.2 → 1.2.0 |
| 14 | `work-package/techniques/update-pr/mark-ready.md` | technique | modify | Protocol lands `{pr_url}` and `{pr_status}` (literal tokens) onto `{updated_pr}`; bump 1.1.0 → 1.1.1 |
| 15 | `workflow-design/techniques/synthesize-update-specification.md` | technique | modify | Remove own `user_description` Input (already inherited from `techniques/TECHNIQUE.md`); keep reading `{user_description}` in Protocol; bump 1.0.0 → 1.0.1 |
| 16 | `workflow-design/techniques/persist-report.md` | technique | modify | Add `report_content` Input; Protocol persists `{report_content}` instead of vague "the report content"; bump 2.1.2 → 2.2.0 |
| 17 | `workflow-design/techniques/compile-report.md` | technique | modify | Add optional `principle_findings_path` / `anti_pattern_findings_path` Inputs; link both from the rolled-up report per the existing "link satellite finding files" capability; bump 1.2.4 → 1.3.0 |
| 18 | `workflow-design/activities/08-quality-review.yaml` | activity | modify | `persist-compliance-report` step binds `report_content: "{compliance_report}"`; bump 1.12.4 → 1.12.5 |
| 19 | `workflow-design/activities/09-validate-and-commit.yaml` | activity | modify | `save-compliance-report` step binds `report_content: "{compliance_report}"`; bump 1.6.0 → 1.6.1 |
| 20 | `workflow-design/activities/10-post-update-review.yaml` | activity | modify | `save-review-snapshot` step binds `report_content: "{findings_summary}"`; bump 1.8.0 → 1.8.1 |

**Intentional removals this pass:** 4 Outputs demoted to same-file `$locals` (`dimension_capture`, `structural_design`, `drafting_order`, `design_intent`) plus 2 more on `publish-workflow-pr.md` (`pr_title`, `pr_body`) and 1 on `review-drafted-file.md` (`removal_inventory`) — each was already same-file-only; demoting to a local removes it from the bag-output signature without losing the value, since the file's own Protocol keeps using it. No behavior loss — `check-binding-fidelity.ts` confirms 0 NEW after the pass (21 → 0; 4 previously-baselined findings also resolved as a byproduct, left in the baseline per this pass's scope).

**Out of scope this pass:** Shrinking `scripts/binding-fidelity-baseline.json` for the 4 no-longer-present pre-existing findings (server-scripts change, not a workflow-content change); any resource-file edits; `workflow.yaml` version (stays 1.24.4).

---

## File manifest

| # | Path (under `workflow-design/`) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `techniques/pattern-analysis.md` | technique | modify | Add `### pattern_analysis` Output; persist cite → `#template`; bump 1.2.2 → 1.2.3 |
| 2 | `techniques/intake-classification.md` | technique | modify | Persist cite → `structural-inventory.md#template`; bump 2.4.0 → 2.4.1 |
| 3 | `techniques/assemble-file-approach.md` | technique | modify | Persist cite → `drafting-plan.md#template`; bump 1.2.2 → 1.2.3 |
| 4 | `techniques/review-drafted-file.md` | technique | modify | Persist cite → `file-review-note.md#template`; bump 1.2.1 → 1.2.2 |
| 5 | `techniques/review-draft-yaml.md` | technique | modify | Persist cite → `draft-attestation.md#template`; bump 1.1.2 → 1.1.3 |
| 6 | `techniques/persist-design-specification.md` | technique | modify | Persist cite → `design-specification.md#template`; bump 1.1.3 → 1.1.4 |
| 7 | `techniques/compile-report.md` | technique | modify | Guide/compile cites → `compliance-report.md#template`; bump 1.2.3 → 1.2.4 |
| 8 | `activities/08-quality-review.yaml` | activity | modify | Remove `expressiveness-confirmed` / `conformance-confirmed` / `rule-hygiene-confirmed` / `enforcement-confirmed` checkpoints; add a non-checkpoint flagged-findings action per pass; rebase `classify-audit-findings`/`reassess-audit-fixes` on finding counts; bump 1.12.2 → 1.12.3 |
| 9 | `activities/README.md` | readme | modify | Update Quality Review blurb — no more per-pass confirmation checkpoints, findings are fixed automatically |

**Out of scope this pass:**
- All remaining activity YAML files (01, 03, 04, 05, 06, 09, 10, 11), remaining techniques, all 22 resources, workflow README, technique container

---

## Structural design

```
workflow-design/
├── workflow.yaml           # patch bump only (v1.24.4, prior pass)
├── README.md                # unchanged
├── activities/
│   ├── 08-quality-review.yaml  # modified — 4 checkpoints removed, findings-driven fix logic
│   └── README.md               # modified — Quality Review blurb
├── techniques/               # 7 leaves modified (prior pass, unchanged this pass)
└── resources/                 # untouched
```

**Flow:** Topology unchanged — no activity add/remove/reorder; `initialActivity` and transitions intact. `quality-review`'s internal step sequence loses four checkpoint steps but keeps every technique/action step and the `audit-fix-cycle` loop + `blocker-gate` decision.

| Pattern | This change |
|---------|-------------|
| Outputs declare products | `pattern_analysis` Output matches assembled bag product (prior pass) |
| Assemble vs persist cite parity | Persist/compile steps use same `#template` anchor as assemble steps (prior pass) |
| Findings drive fixes, not elections | `needs_audit_fixes` derives from finding counts, not from a user-chosen disposition option (this pass) |
| Additive where possible | Prior pass is additive-only; this pass's 4 removals are intentional per explicit user directive, not discovered drift |

---

## Drafting order

1. **Techniques (Output first)** — `pattern-analysis.md` (declare Output + cite + version) *(prior pass)*
2. **Techniques (cite-only)** — intake-classification → assemble-file-approach → review-drafted-file → review-draft-yaml → persist-design-specification → compile-report *(prior pass)*
3. **Activity (quality-review auto-fix)** — `activities/08-quality-review.yaml` (remove checkpoints, add flagged-findings actions, rebase classification logic, bump version)
4. **README (orientation)** — `activities/README.md` (Quality Review blurb, drafted last so it describes the activity's final shape)

**Rationale:** High binding-gap fix first; independent one-line cite + patch bumps next; the activity's structural edit before the README that describes it, so the orientation doc never describes stale behavior.
