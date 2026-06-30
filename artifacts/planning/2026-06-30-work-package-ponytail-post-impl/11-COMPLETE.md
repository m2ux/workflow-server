# Workflow Design: work-package — Complete ✅

**Date:** 2026-06-30
**Mode:** Update
**Status:** COMPLETED

---

## Summary

This session added a new `lean-coding-audit` activity to the `work-package` workflow (v3.13.0 → **v3.14.0**), inserted at slot 09 — after `implement` (08), before `post-impl-review` — binding the standalone `ponytail` workflow's techniques cross-workflow. The stage applies ponytail's lazy-senior-developer lean-coding lens (tag the change against the over-engineering taxonomy, produce a net-lines scoreboard, harvest deliberate simplifications as tracked `ponytail:` debt markers) against a non-negotiable safety floor, so leanness becomes a reviewed, recorded gate in the pipeline rather than an informal habit. It is complementary to — not duplicative of — `strategic-review`: ponytail judges lean-coding of whatever was implemented and runs early; strategic-review judges scope-vs-issue fit and runs late.

---

## What Was Delivered

Framed as added / modified against `work-package` v3.13.0.

- **Activities:**
  - **Added** `activities/09-lean-coding-audit.yaml` — NEW activity `id: lean-coding-audit`, `required: true`. Steps (id + technique + structural only, AP-64): `review-over-engineering` (`ponytail/review-over-engineering` → `review-findings.md`), `harvest-debt` (`ponytail/harvest-debt` → `debt-ledger.md`, sets `has_debt_markers`), `report-gain` (`ponytail/report-gain`, `when: has_debt_markers == true`), a blocking `audit-findings-confirmed` checkpoint (3 options, gated `is_review_mode != true`), and a bounded `simplification-apply-cycle` doWhile loop (`maxIterations: 3`, `when: is_review_mode != true`).
  - **Modified** `activities/08-implement.yaml` — sole outbound transition repointed `to: post-impl-review` → `to: lean-coding-audit`.
  - **Renamed** six downstream activity files (content untouched, git-tracked as renames): `09-post-impl-review` → `10-`, `10-validate` → `11-`, `11-strategic-review` → `12-`, `12-submit-for-review` → `13-`, `13-complete` → `14-`, `14-codebase-comprehension` → `15-`.
- **Techniques:** None created. The new activity binds existing `ponytail` standalone techniques cross-workflow (`ponytail/review-over-engineering`, `ponytail/harvest-debt`, `ponytail/report-gain`, `ponytail/apply-ladder`) and reuses ponytail's `review-findings.md` + `debt-ledger.md` artifacts.
- **Resources:** **Modified** `resources/review-mode.md` — renumbered two activity-file refs (`10-validate` → `11-`, `11-strategic-review` → `12-`) and added the `### lean-coding-audit` document-don't-fix review-mode section.
- **Variables / rules:**
  - **Added** 3 boolean variables (`type: boolean`, `defaultValue: false`): `audit_confirmed`, `needs_simplification`, `has_debt_markers`.
  - **Added** 4 rules to `rules.workflow[]`: `safety-floor-never-simplified` (structural), `report-before-apply` (structural), `leanness-reported-honestly` (guidance), `complementary-not-duplicative-with-strategic-review` (guidance). (A fifth candidate, `audit-after-implement-before-review`, was authored then removed at quality review as redundant with transition ordering.)
- **Docs:** **Modified** `README.md` and `activities/README.md` — activity count 14→15, tables, anchors, mermaid graphs, prefixes, feedback-loop tables, review-mode override table.
- **Follow-on (outside the original 12-item manifest, surfaced by validation):**
  - **Modified** `workflows/remediate-vuln/workflow.yaml` — repointed 4 numbered-filename imports, spliced `09-lean-coding-audit.yaml` into its imported activity band, added the 3 new boolean variables.
  - **Regenerated** `tests/e2e/__snapshots__/snapshot.test.ts.snap` — 6 work-package walk baselines.

---

## Design Decisions

### Decision 1: Bind ponytail cross-workflow, not dispatch_child
**Context:** The stage must reuse the standalone `ponytail` workflow's capability inside `work-package`.
**Decision:** Author a new `work-package` activity that binds ponytail's techniques directly via cross-workflow references, reusing ponytail's resources/artifacts.
**Rationale:** This is the established `work-package` convention — it already binds `cargo-operations::run-suite`, `review-assumptions::reconcile`, `gitnexus-operations::detect-changes`. `dispatch_child` is reserved for the `meta` orchestrator, not used inside `work-package`.
**Alternatives rejected:** Dispatching ponytail as a child workflow (off-convention for `work-package`); folding ponytail logic into `strategic-review` (conflates two distinct lenses).

### Decision 2: Cross-workflow ref uses the slash form `ponytail/<op>`, not `::`
**Context:** Earlier design prose used `ponytail::<op>`.
**Decision:** Author the slash form `ponytail/<technique-id>`.
**Rationale:** `::` is reserved for grouped operations; ponytail's ops are root-level standalone technique files, which bind exactly like `prism/structural-analysis`. Caught in pattern-analysis (04 §9) and confirmed by `check-all-refs.ts` (0 unresolved).
**Alternatives rejected:** The `::` form — would have produced unresolved refs.

### Decision 3: Linear default transition, no return-to-implement branch
**Context:** A disputed/failing audit could in principle bounce back to `implement`.
**Decision:** Single default transition `to: post-impl-review`; no `decisions` branch.
**Rationale:** Per 03-requirements §3 — the stage is a recorded gate, not a hard blocker that re-opens implementation; disputes are dispositioned at the checkpoint and recorded, then flow continues.
**Alternatives rejected:** A return-to-implement decision branch (over-engineered for the stage's recorded-gate purpose).

### Decision 4: Two native artifacts, reused from ponytail
**Context:** The stage produces findings and a debt ledger.
**Decision:** Reuse ponytail's `review-findings.md` + `debt-ledger.md` (gain scoreboard appended to the ledger foot) rather than a single folded `lean-coding-audit.md`.
**Rationale:** The technique owns its artifact name (generic-not-overfit); folding would overfit ponytail's outputs to this one caller.
**Alternatives rejected:** A single combined `lean-coding-audit.md` artifact.

### Decision 5: Bound `apply-ladder` (not `audit-repo`) in the apply loop
**Context:** The simplification-apply loop body needs ponytail's apply operation.
**Decision:** Bind `ponytail/apply-ladder` in the loop body.
**Rationale:** Its protocol applies the ladder while holding the safety floor and marking ceilings — change-scoped, matching this stage's per-change scope. `audit-repo` is repo-wide and deliberately not bound (03-requirements §4.3).
**Alternatives rejected:** `ponytail/audit-repo` (repo-scoped, wrong granularity for a per-change stage).

---

## Scope Outcome

*Comparison against the confirmed scope manifest (12 planned + 2 follow-on = 14 items).*

| Manifest item | Action | Status |
|---------------|--------|--------|
| `work-package/workflow.yaml` | modify (v3.14.0; +4 rules; +3 variables) | ✅ Done |
| `work-package/activities/09-lean-coding-audit.yaml` | create | ✅ Done |
| `work-package/activities/08-implement.yaml` | modify (transition) | ✅ Done |
| `09→10`, `10→11`, `11→12`, `12→13`, `13→14`, `14→15` (6 renames) | rename (git mv) | ✅ Done |
| `work-package/README.md` | modify | ✅ Done |
| `work-package/activities/README.md` | modify | ✅ Done |
| `work-package/resources/review-mode.md` | modify | ✅ Done |
| `remediate-vuln/workflow.yaml` | modify (follow-on) | ✅ Done |
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | regenerate (follow-on) | ✅ Done |

Drift (changes outside the manifest, or unaddressed items): **None.** Post-update scope-discipline audit reconciled 13 worktree-commit files + 1 parent-repo file against all 14 manifest items — every committed file is a manifest item, every manifest item is committed. The 2 follow-on items were surfaced by validation (not unplanned scope creep) and recorded in the manifest before commit.

---

## Known Limitations & Deferrals

- ⚠️ **`remediate-vuln` inherits the lean-coding-audit stage.** Because the shared `08-implement.yaml` now transitions `to: lean-coding-audit` and `remediate-vuln` imports work-package's post-implementation band by numbered filename, `remediate-vuln` must include `09-lean-coding-audit.yaml` and therefore now runs the leanness gate in its post-implementation band. This is a deliberate, user-accepted side effect — a behavioral addition to a workflow outside the original feature scope — consistent with `remediate-vuln`'s existing reuse of the post-impl band, and the minimal correct fix given the shared-file architecture.
- ⚠️ **`is_review_mode` is undeclared in `work-package/workflow.yaml` `variables[]`.** It is set via checkpoint `setVariable` effects and read by conditions across 9+ activities — a pre-existing workflow-wide pattern that predates this change. The new activity's review-mode gating correctly follows the established convention; the undeclared variable is a pre-existing observation for a future workflow-wide review, not a defect introduced here.
- ❌ **No return-to-implement branch.** Intentionally deferred (Decision 3): a disputed audit is dispositioned and recorded at the checkpoint, not bounced back to implementation. If experience shows disputes routinely require re-implementation, a future revision could add the branch.

---

## Lessons Learned

### What Went Well
- Pattern-analysis caught the `ponytail::` → `ponytail/` ref-form correction before any drafting, so the authored refs resolved on the first `check-all-refs.ts` pass.
- Modelling the new activity on two existing reference shapes (`post-impl-review` for the blocking-gate + bounded-fix-loop pattern, `codebase-comprehension` for cross-workflow standalone-technique binding) kept it conformant — the post-update review found zero new findings.
- The apply→re-review loop edge composed by pure same-name binding (`apply-ladder` emits `lean_change`, `review-over-engineering` declares optional input `lean_change`), so no per-call `step.technique.inputs` rename was needed (honours generic-not-overfit).

### What Could Be Improved
- **Hidden cross-workflow coupling via numbered filenames.** `remediate-vuln` imports work-package activities by *numbered filename*, so the renumber broke its load (11 test failures) — only surfaced by the full `vitest` suite, not by pattern-analysis, which had assumed renames are safe because "transitions reference ids." Renaming numbered activity files in any workflow that others import by filename should trigger a deliberate cross-workflow-import sweep up front.
- **Quality review earned its keep.** It caught that `simplification-apply-cycle` was dead config — a doWhile that always exited after one pass (the body unconditionally reset the loop driver), making `maxIterations: 3` unreachable. Fixed to a real bounded cycle (`reset-simplification-flag` → `reassess-simplification`, which re-scores and re-raises the flag). A loop body that unconditionally clears its own driver is a smell worth a dedicated lint.
- **workflow-design checkpoint-replay defect (noted for the design workflow itself).** The dimension-elicitation loop and the assumption-interview loop reuse a *static* checkpoint id, so after the first resolution the remaining iterations auto-replay the same option. This made the multi-dimension confirmation pass feel like a single decision rather than per-dimension gates — worth fixing in `workflow-design` so each iteration carries a distinct checkpoint identity.

---

**Status:** ✅ COMPLETE
