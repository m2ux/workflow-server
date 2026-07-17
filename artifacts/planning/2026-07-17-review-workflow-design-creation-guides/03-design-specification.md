# Design Specification — fix pattern_analysis Output + persist cite anchors + quality-review auto-fix

**Workflow:** `workflow-design` v1.24.4  
**Mode:** Update  
**Date:** 2026-07-17  
**Change categories:** Technique, Activity, README  
**Change request:** Declare undeclared `{pattern_analysis}` Output (High); normalize persist-guide cites to `#template` (Low); **[return-to-draft addition]** make quality-review fix findings automatically, without a per-pass user checkpoint  
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)  
**Source:** [08-compliance-review.md](08-compliance-review.md); return-to-draft directive from `validate-and-commit` pre-commit rejection (2026-07-17)

---

## Purpose

Keep Workflow Design’s purpose: create, update, or review a workflow definition through structured activities and human checkpoints.

This update closes two compliance findings on the PR #254 worktree, and — added on return-to-draft — removes the four quality-review per-pass disposition checkpoints so audit-fixable findings are fixed automatically instead of asking the user to elect a disposition on each pass. It does not change activity boundaries, mode routing, or creation-guide structure.

| Goal | Meaning |
|------|---------|
| Output fidelity | `pattern-analysis` declares every braced product it assembles |
| Cite consistency | Persist steps land on the same `#template` home as assemble steps |
| Automatic remediation | `quality-review`'s four audit passes fix findings without a per-pass user checkpoint; the critical-blocker gate stays the sole hard stop |

**Out of scope:** Resource guide rewrites; binding-fidelity baseline refresh; catalog pin bump; the review-mode `review-disposition` checkpoint; the `blocker-gate` decision.

---

## Activity list

**No activities added, removed, or reordered.** Same 9 activities and mode branches.

| Activity | Role in this change |
|----------|---------------------|
| `pattern-analysis` | Technique Output fix only — activity YAML and gate unchanged |
| `quality-review` | **[return-to-draft addition]** Removes 4 disposition checkpoints; audit-fix logic now reads finding counts directly |
| All others | Unchanged flow; Low cite edits touch techniques used across later stages |

---

## Checkpoints

| Gate family | Change |
|-------------|--------|
| Technique cite/Output fixes | None — technique markdown only |
| `quality-review` per-pass disposition | **Removed** — `expressiveness-confirmed`, `conformance-confirmed`, `rule-hygiene-confirmed`, `enforcement-confirmed`. Each pass still emits a zero-finding action message (`*-clean`) when clean, and a non-checkpoint flagged-findings action message when findings remain, since the fix cycle now always applies |
| `quality-review` critical-blocker gate | **Unchanged** — `blocker-gate` decision still returns to `scope-and-draft` on any Critical finding |
| Review-mode `review-disposition` | **Unchanged** — out of scope; distinct purpose (user chooses whether to enter update mode at all) |

---

## Artifacts

No new planning artifact kinds. Content contracts for existing guides stay lean.

| Surface | Target shape |
|---------|--------------|
| `techniques/pattern-analysis.md` | Add `### pattern_analysis` Output; keep `{pattern_analysis_path}` artifact; bump technique version |
| Persist cite sites (`pattern-analysis`, `intake-classification`, `assemble-file-approach`, `review-drafted-file`, `review-draft-yaml`, `persist-design-specification`, `compile-report`) | Align bare guide links on persist (and compile) lines to `…md#template` |
| `activities/08-quality-review.yaml` | Remove 4 disposition checkpoints; add 4 flagged-findings action steps; rebase `classify-audit-findings` / `reassess-audit-fixes` set-messages on finding counts; patch bump |
| `activities/README.md` | Update the Quality Review blurb to describe automatic fixing instead of per-pass confirmation checkpoints |

---

## Rules

| Rule / principle | Application |
|------------------|-------------|
| `technique-outputs-declared` / binding fidelity | Every `{id}` assembled in Protocol is a declared Output |
| Description Hygiene / cite consistency | Persist and assemble cite the same guide anchor |
| Output Economy | Spec and later artifacts stay purpose + deltas — no encyclopedia restatement |
| Critical rules structurally enforced | `blocker-gate` stays the structural stop for Critical findings; removing an advisory disposition checkpoint does not weaken it |

No new workflow-level rule slug.

---

## Confirmation ask

Approve if the seven technique-markdown fixes plus the quality-review checkpoint removal are the full update scope before re-drafting. Needs-changes if activity boundaries, the critical-blocker gate, or additional files should be in scope.

---

## Return-to-draft addition — binding-fidelity dead-output / orphan-input fixes (2026-07-17)

**Change request:** `validate-and-commit`'s schema-validation step ran `scripts/check-binding-fidelity.ts` against the branch and reported 21 NEW violations relative to the committed baseline — 20 `dead-output` findings (an own-file Output nothing outside that file consumes) and 1 `orphan-input` finding (an own-declared Input with no producer in the binding workflow). The user directed a content fix, not a baseline update, per the guard script's own guidance.

**Source:** `check-binding-fidelity.ts` output at return-to-draft (2026-07-17); [06-scope-manifest.md §Return-to-draft](06-scope-manifest.md#return-to-draft-binding-fidelity-pass--2026-07-17) and [06-draft-attestation.md §Return-to-draft](06-draft-attestation.md#return-to-draft-binding-fidelity-pass--2026-07-17) carry the full file-by-file list.

**Goal for this addition:**

| Goal | Meaning |
|------|---------|
| Every declared Output has a real external consumer | An Output read only within its own declaring file is either given a genuine cross-file consumer or demoted to a `{$local}` |
| Every declared Input has a producer | `synthesize-update-specification.md` inherits `user_description` from Root `TECHNIQUE.md` instead of redeclaring it with no in-workflow producer |
| Fixes land in workflow content, not the baseline | No `--update-baseline` run this pass; the 4 previously-baselined findings that are also no longer present are a byproduct, left in the baseline (server-scripts change, out of scope) |

**Update dimensions touched:**

- **Techniques** — 17 technique-markdown files: 9 move an `#### artifact` marker from a `_path` Output onto its paired content Output (Pattern A); 5 demote a same-file-only Output to a `{$local}` (Pattern B, one file — `review-drafted-file.md` — shared with a Pattern A edit, so 13 unique files across A+B); `persist-report.md` gains a `report_content` Input and `compile-report.md` gains two optional satellite-path Inputs (Pattern C); `synthesize-update-specification.md` drops a redundant own Input (Pattern E); `publish-workflow-pr.md` (shared with Pattern B) and `work-package/techniques/update-pr/mark-ready.md` add explicit captures of two meta Outputs (Pattern D) — 17 unique technique files in total.
- **Activities** — 3 activity files (`08-quality-review.yaml`, `09-validate-and-commit.yaml`, `10-post-update-review.yaml`) bind `persist-report`'s new `report_content` Input to the prior assemble product (`{compliance_report}` on the review path, `{findings_summary}` on the post-update path) at each of the technique's three call sites.
- **No activity boundaries, checkpoints, or the critical-blocker gate change.** `workflow.yaml` stays at v1.24.4 — no root-metadata edit this pass.

**Out of scope:** Resource guide rewrites; `scripts/binding-fidelity-baseline.json` shrink; any change to `review-disposition` or `blocker-gate`.
