# Impact Analysis — Planning Retrospective Findings

**Workflow:** `workflow-design` v1.28.0 (primary) · `work-package` v3.33.0 (secondary)
**Mode:** Update (multi-target)
**Date:** 2026-07-21
**Change source:** [design specification](03-design-specification.md)
**Baseline:** [structural inventory](structural-inventory.md)

---

## Summary

In-place technique, activity-step, resource, and canon updates across both workflows — no activity add/remove/reorder. Topology stays intact; integrity checks pass at the planned shape. Material removals are concentrated in three soft checkpoints (Gate 2 open), the change-block index header/table form, and relocating `write-artifact` from protocol prose into bound steps.

**removal_count:** 7

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `workflow-design/activities/01-intake-and-context.yaml` | Bind `write-artifact` for intake inventory; MCP resource-read fallback in format-literacy path |
| `workflow-design/activities/03-requirements-refinement.yaml` | Bind `write-artifact` for design-spec persist; A-11 `assumption_decisions` binding-fidelity fix |
| `workflow-design/activities/05-impact-analysis.yaml` | Bind `write-artifact` for this activity's own persist step |
| `workflow-design/activities/04-pattern-analysis.yaml` | Bind `write-artifact` for pattern-analysis persist |
| `workflow-design/activities/06-scope-and-draft.yaml` | Bind `write-artifact`; move binding-fidelity checks earlier into `draft-attestation` |
| `workflow-design/activities/08-quality-review.yaml` | Bind `write-artifact` for findings-satellite persists |
| `workflow-design/activities/09-validate-and-commit.yaml` | Completed-steps manifest includes all executed steps; earlier binding-fidelity handoff |
| `workflow-design/activities/10-post-update-review.yaml` | Bind `write-artifact` where audit persists run |
| `workflow-design/activities/11-retrospective.yaml` | Bind `write-artifact` for completion/retrospective persists |
| `workflow-design/techniques/TECHNIQUE.md` | Canonical-home map gains `follow-ups.md` / `deferred-items.md` entries |
| `workflow-design/resources/anti-patterns.md` | MR-1..MR-4 authoring-guidance entries |
| `workflow-design/resources/format-conventions.md` (and/or transition-authoring canon peers) | Transition-condition quoting / `isDefault` guidance; plain-technical-language tightening |
| `workflow-design/techniques/*` with protocol `write-artifact` prose (~15 leaves) | Protocol prose refs become step-resolvable; tails trimmed per plain-technical-language |
| `work-package/activities/10-post-impl-review.yaml` | Wrap `block-interview` in `forEach` + confirm-before-exit; manual-edit detection |
| `work-package/activities/08-implement.yaml` | Remove or soften `switch-model-pre-impl` / `switch-model-post-impl` (A-3) |
| `work-package/activities/05-implementation-analysis.yaml` | Remove `analysis-confirmed`; autonomous gap-fill then auto-proceed (A-4) |
| `work-package/activities/01-start-work-package.yaml` | A-7 `project_type` seeding/binding placement (step `detect-project-type` already present) |
| `work-package/activities/14-complete.yaml` | Retrospective interview one-item-at-a-time / confirm-before-continuing shape |
| `work-package/resources/manual-diff-review.md` | Block titles → `file:line` hyperlinks; drop Instructions + file index table |
| `work-package/techniques/review-diff.md` | Protocol aligned to new index form |
| `work-package/resources/deferred-items.md` | Out-of-scope-only after follow-ups split |
| `work-package/techniques/manage-artifacts/TECHNIQUE.md` | Canonical-home map: in-task `follow-ups.md` vs out-of-scope `deferred-items.md` |
| `work-package/activities/README.md` | Diagram nodes for removed/restructured checkpoints |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `workflow-design/workflow.yaml` | Version bump; optional variable if A-11 needs a bag key |
| `work-package/workflow.yaml` | Version bump; loop/bag vars for block-interview `forEach` if new ids needed |
| `workflow-design/resources/design-context-readme.md` / peers | Progress/link slots if follow-ups register is indexed |
| `work-package/techniques/conduct-retrospective/*` | Interview loop discipline for dedicated retrospective session |
| `work-package/techniques/project-type-detection.md` | Output/default clarity if A-7 adjusts seeding contract |
| `work-package/resources/workflow-retrospective.md` | Format aligned to one-item interview |
| New `follow-ups.md` resource (+ optional technique) under each/both workflows | Formalize in-task follow-ups template currently absent from catalog |
| `workflow-design/README.md` / `work-package/README.md` | Orientation lines if checkpoint/artifact surface changes |

### Unaffected (summary)

Activity topology unchanged (9 + 15 activities). Remaining activity YAMLs, most work-package technique groups (research, strategic-review, update-pr, validate-build, etc.), and unrelated resources stay out of blast radius. ~75 + ~158 file trees: only the rows above are in scope.

---

## 2. Integrity checks

All three integrity checks pass at the planned shape (transitions/reachability, technique/resource refs, variables/`setVariable`/conditions); no exceptions.

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `work-package/activities/08-implement.yaml` · `switch-model-pre-impl` | Entire soft checkpoint (message, options `switched`/`continue-current`, 10s auto-advance) | Surrounding `task-cycle` steps (`implement-task`, tests, commit, provenance) |
| 2 | `work-package/activities/08-implement.yaml` · `switch-model-post-impl` | Entire soft checkpoint after post-impl assumptions record | `update-assumptions-log` and transition to `lean-coding-audit` |
| 3 | `work-package/activities/05-implementation-analysis.yaml` · `analysis-confirmed` | Entire soft gate (`confirmed`/`clarify`/`more-analysis`) | `document` → `update-assumptions-log` → analyse-challenge path; gap-fill loop replaces the gate (A-4) |
| 4 | `work-package/resources/manual-diff-review.md` · Header `## Instructions` | Reviewer instructions block under lean-header | Lean-header summary line; Block Rationale section |
| 5 | `work-package/resources/manual-diff-review.md` · File Index Table form | `Row \| Path \| File` table (row→rationale anchors) | Per-block rationale; Block titles hyperlink to `file:line` instead |
| 6 | `work-package/resources/deferred-items.md` (+ manage-artifacts canonical-home) | Claim that the register homes in-task / post-completion follow-ups | Out-of-scope deferred items only; in-task follow-ups move to new `follow-ups.md` home |
| 7 | `workflow-design/techniques/*.md` (write-artifact class) | Protocol-only markdown links that invoke `write-artifact` without a bound activity step | Persist intent via explicit `manage-artifacts::write-artifact` activity steps (pattern already in `15-codebase-comprehension.yaml`) |

Open Gate 2 judgements A-3 and A-4 govern whether rows 1–3 ship as full removals or soften-in-place; they remain inventoried so preservation is conscious either way.

---

## Decision ask

Confirm impact scope and intentional removals — or revise / preserve. Rows 1–3 await Gate 2 disposition; rows 4–7 are in-scope for this update as specified.
