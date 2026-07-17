# Design Specification — fix pattern_analysis Output + persist cite anchors

**Workflow:** `workflow-design` v1.24.3  
**Mode:** Update  
**Date:** 2026-07-17  
**Change categories:** Technique  
**Change request:** Declare undeclared `{pattern_analysis}` Output (High); normalize persist-guide cites to `#template` (Low)  
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)  
**Source:** [08-compliance-review.md](08-compliance-review.md)

---

## Purpose

Keep Workflow Design’s purpose: create, update, or review a workflow definition through structured activities and human checkpoints.

This update closes two compliance findings on the PR #254 worktree. It does not change activity boundaries, mode routing, or creation-guide structure.

| Goal | Meaning |
|------|---------|
| Output fidelity | `pattern-analysis` declares every braced product it assembles |
| Cite consistency | Persist steps land on the same `#template` home as assemble steps |

**Out of scope:** Activity/YAML changes; resource guide rewrites; binding-fidelity baseline refresh; catalog pin bump.

---

## Activity list

**No activities added, removed, or reordered.** Same 9 activities and mode branches.

| Activity | Role in this change |
|----------|---------------------|
| `pattern-analysis` | Technique Output fix only — activity YAML and gate unchanged |
| All others | Unchanged flow; Low cite edits touch techniques used across later stages |

---

## Checkpoints

**No checkpoints added or removed.** Messages, options, and effects stay as-is.

| Gate family | Change |
|-------------|--------|
| All gates | None — technique markdown only |

---

## Artifacts

No new planning artifact kinds. Content contracts for existing guides stay lean.

| Surface | Target shape |
|---------|--------------|
| `techniques/pattern-analysis.md` | Add `### pattern_analysis` Output; keep `{pattern_analysis_path}` artifact; bump technique version |
| Persist cite sites (`pattern-analysis`, `intake-classification`, `assemble-file-approach`, `review-drafted-file`, `review-draft-yaml`, `persist-design-specification`, `compile-report`) | Align bare guide links on persist (and compile) lines to `…md#template` |

---

## Rules

| Rule / principle | Application |
|------------------|-------------|
| `technique-outputs-declared` / binding fidelity | Every `{id}` assembled in Protocol is a declared Output |
| Description Hygiene / cite consistency | Persist and assemble cite the same guide anchor |
| Output Economy | Spec and later artifacts stay purpose + deltas — no encyclopedia restatement |

No new workflow-level rule slug.

---

## Confirmation ask

Approve if these two technique-markdown fixes are the full update scope before impact analysis. Needs-changes if activity boundaries, checkpoint set, or additional files should be in scope.
