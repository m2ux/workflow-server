# Workflow Retrospective: Review-Mode Hardening — Config-Change & Interaction Defects

**Date:** 2026-07-01
**Work Package:** Review-Mode Hardening — Config-Change & Interaction Defects (#145)
**PR:** [#147](https://github.com/m2ux/workflow-server/pull/147)

> **Scope of this retrospective.** This session ran as an orchestrated `work-package` workflow with per-activity worker dispatch. The analysis below is grounded in the recorded session state (checkpoint responses, activity sequence, and the artifacts each activity produced) rather than a verbatim replay of every user turn. Where a friction point is inferred from a checkpoint decision or an artifact, it is labelled as such.

---

## Session Analysis

**Checkpoint Responses (recorded):** 9
**Non-Checkpoint Interactions:** Not individually reconstructed from worker context (see scope note); friction is inferred from checkpoint decisions and produced artifacts.

Checkpoints resolved (from session state):

| Checkpoint | Decision |
|-----------|----------|
| `resolve-target::repo-type-confirmed` | monorepo |
| `resolve-target::submodule-selection` | submodule-chosen |
| `start-work-package::pr-creation` | proceed (PR created) |
| `design-philosophy::classification-confirmed` | confirmed |
| `design-philosophy::workflow-path-selected` | skip-optional |
| `plan-prepare::approach-confirmed` | confirmed |
| `lean-coding-audit::audit-findings-confirmed` | apply-simplifications |
| `post-impl-review::file-index-table` | rationale-confirmed |
| `post-impl-review::rationale-amendment` | all-accurate |
| `strategic-review::review-findings` | acceptable |
| `submit-for-review::dco-sign-off-confirmation` | certify |

---

## Observations

### Process / Sequencing

| # | Observation | Context | Workflow signal |
|---|-------------|---------|-----------------|
| 1 | The change spanned two repos (definitions in the `workflows` orphan branch; E2E baseline in the server repo). | validate / complete | The baseline regeneration could not be committed within PR #147 — a cross-repo coordination seam surfaced only at validation time, not at planning. |
| 2 | The harness resolves workflow definitions from the main-checkout working tree, so validating the feature branch required a reversible detached checkout of the feature commit in the main checkout's `workflows` dir. | validate | Cross-branch validation is a manual dance; a harness flag to point at an arbitrary definitions path would make it first-class. |
| 3 | The lean-coding audit surfaced a genuine aug-2/aug-3 procedural duplication (the conservation walk restated in `review-code` and `structural-analysis`). | lean-coding-audit | The audit step earned its place — it caught a real duplication and the `apply-simplifications` decision collapsed it without behavior change. |

### Design deliberation (resolved without user friction)

The five augmentations were treated as one coupled defect-class remediation. The load-bearing decision — DD-1, reconcile the divergent severity scales by a documented render-time map rather than a full rename — was the crux, since the original real-world defect *was* a render-time downgrade. This was resolved at design time and confirmed at `plan-prepare::approach-confirmed` and `strategic-review::review-findings` (acceptable) without rework.

---

## Improvement Recommendations

### Medium Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | E2E baseline lives in a different repo from the definition change, forcing a coordinated two-repo follow-up to regenerate the `[review-mode]` snapshot. | Document a cross-repo baseline-regeneration runbook (submodule bump + `vitest -u` together) as a standing checklist item on the `complete` activity when the target is the `workflows` submodule; or co-locate the baseline with the definitions. | `complete` activity / e2e harness docs |
| 2 | Validating a feature branch of `workflows` requires a manual reversible detached-checkout in the main checkout because the harness resolves definitions from the working tree. | Add a harness option (env var / flag) to point at an arbitrary definitions path, making cross-branch validation first-class instead of a manual, error-prone restore dance. | `tests/e2e/harness.ts` |

### Low Priority / Observations

| # | Observation | Consideration |
|---|-------------|---------------|
| 1 | AP-43 condition-agnostic artifact-declaration spill surfaces the review-mode-only `prior-feedback-triage.md` artifact in all 6 policy snapshot declarations. | Cosmetic/declaration-level, not a gating defect. Worth noting so future readers of the snapshot diff do not mistake it for a gating leak. |
| 2 | Two severity vocabularies coexist by design (DD-1). | The documented render map bridges them; a future project-wide unification (out of scope for #145) would remove the bridge. Tracked as a follow-up. |

---

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Work-package activities completed | 11/11 | start-work-package → design-philosophy → codebase-comprehension → plan-prepare → assumptions-review → implement → lean-coding-audit → post-impl-review → validate → strategic-review → submit-for-review → complete |
| Checkpoints triggered | 9 (+2 in the outer meta target-resolution) | All resolved; none reopened |
| User corrections | 0 recorded in worker context | No rework observed across the recorded activity sequence |
| Workflow deviations | 0 | No skipped required activities; `skip-optional` path taken by design at `design-philosophy` |

---

## Summary

**Overall Session Quality:** Smooth.

**What Worked:** Leaves-before-callers sequencing (settle the shared severity vocabulary first, then producers, wiring, render, baselines last) kept the 6-policy walk green throughout and meant every augmentation bound against a settled contract. The lean-coding audit caught and fixed a real procedural duplication. The design frame — one coupled defect-class remediation, not five independent features — kept the render boundary coherent, which mattered because the motivating defect was itself a render-time downgrade.

**Lessons Learned:** The cross-repo seam between definition changes and E2E baselines is the main structural friction; it turns a mechanical baseline refresh into a coordinated two-repo follow-up and complicates in-branch validation. Both recommendations above target that seam.

**Key Takeaway:** The single most valuable structural improvement would be to remove the definitions/baseline cross-repo seam — either by co-locating the baseline or by making the harness accept an arbitrary definitions path — so validation and baseline regeneration are single-repo, first-class operations.

**Action Required:** No — informational. The two medium-priority recommendations are candidate follow-up items (see [select-next](#) hand-off in the close-out), not blockers for #147.
