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
