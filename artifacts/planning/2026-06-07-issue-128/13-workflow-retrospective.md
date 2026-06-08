# Workflow Retrospective: Canonical Identifier Naming Convention (Issue #128)

**Date:** 2026-06-08
**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129) (draft, → `main`), [#130](https://github.com/m2ux/workflow-server/pull/130) (→ `workflows`)

---

## Session Analysis

> **Scope of this analysis.** This retrospective is conducted by the `complete` activity worker, which does not have the raw user-message transcript. The signal below is therefore grounded in the **recorded checkpoint history** (`session.json`), the planning artifacts, and the provenance log — not a verbatim message count. Counts of free-text clarifications/corrections are reported as "not separately captured" where the transcript would be required to enumerate them honestly.

**Checkpoint Responses:** 9 (recorded in `session.json#checkpointResponses`)
**Non-Checkpoint Interactions:** not separately captured (no transcript available to the worker)

Recorded checkpoint decisions:

| Activity | Checkpoint | Option chosen |
|----------|-----------|---------------|
| start-work-package | pr-creation | `proceed` |
| design-philosophy | classification-confirmed | `confirmed` |
| design-philosophy | workflow-path-selected | `research-only` (over the agent's `skip-optional` recommendation) |
| research | research-findings | `sufficient` |
| research | context-scope-declaration | `web-retrieval` |
| post-impl-review | file-index-table | `rationale-confirmed` |
| strategic-review | review-findings | `acceptable` (`review_passed = true`) |
| submit-for-review | dco-sign-off | `certify` |
| submit-for-review | merge-strategy-reminder | `acknowledged` |

---

## Observations

### Clarification Requests

Not separately captured (no transcript available to the worker). No clarification-driven artifact rewrites are evident in the planning record.

### Corrections Made

No corrections are recorded in the checkpoint history or planning artifacts. Notably, `strategic-review` passed on the first pass (`review_passed = true`, `review_requires_changes = false`) with no rework loop, and there is no record of a checkpoint being re-presented.

### Process Questions

None recorded.

### Frustration Signals

None recorded in the checkpoint history.

### Notable Decisions (non-friction signals)

| # | Decision | Context | Interpretation |
|---|----------|---------|----------------|
| 1 | User selected `research-only` over the agent's recommended `skip-optional` | design-philosophy / workflow-path-selected | A deliberate risk-trade choice (accept extra research time for a better-grounded convention), not a workflow defect. Recorded transparently in [02-design-philosophy.md](02-design-philosophy.md#workflow-path-decision). |
| 2 | Migration scope expanded to 91 files in PR #130 | implement | The original plan targeted a small deviation set; the AP-60 audit reports surfaced a broader qualified-identifier sweep mid-implementation. The plan's "broad but shallow" framing held, but the file count materially exceeded the plan's named targets. |
| 3 | PR #129 kept as a draft | submit-for-review / complete | A deliberate human gate to review the coordinated #129/#130 pair before either lands. The `complete` activity's merge-gated steps (ADR acceptance, status flip) are correctly blocked by this. |

---

## Improvement Recommendations

### High Priority

None. The session ran cleanly through all activities with no rework loop.

### Medium Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | The migration sweep expanded well beyond the plan's named targets (91 files vs. the handful itemized in T4–T6) only after the AP-60 audit ran during implementation. | Run the corpus-wide AP-60 audit (`ap60-corpus-compliance-audit`) during **plan-prepare**, not implementation, so the migration is sized before commitment. | plan-prepare / implementation-analysis |
| 2 | The `complete` activity has several steps gated on PR merge (ADR acceptance, plan-status flip, worktree removal), but the workflow reaches `complete` while the PR is still an unmerged draft. | The merge-gated steps already degrade gracefully (hold ADR at Proposed, mark COMPLETE.md pre-merge, defer worktree removal), but the activity could make the "PR not yet merged" branch explicit rather than leaving it to worker judgement. | complete activity / finalize-documentation technique |

### Low Priority / Observations

| # | Observation | Consideration |
|---|-------------|---------------|
| 1 | `validate-workflow-toon.ts` could not run on the reference `main` checkout (missing `skill.schema.ts`); the lighter `validate-activities.ts` was substituted. | Align validator availability across branches, or document the substitution in the validate technique so it is not re-discovered each run. |
| 2 | The architecture summary referenced `squash_merge_supported` while the plan referenced renaming `squash_merge_available`; the landed name is `squash_merge_supported`. | Minor; the artifacts were internally consistent by validation time. Worth a single canonical-name note when a rename target is chosen. |

---

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Activities completed | 12 (start-work-package → submit-for-review) + complete in progress | Research-only path; elicitation skipped, comprehension + research ran |
| Checkpoints triggered | 9 | All resolved on first presentation; no re-presentation |
| User corrections | 0 recorded | No rework loop; strategic-review passed first time |
| Workflow deviations | 0 | Path followed as selected; no skips beyond the planned elicitation skip |

---

## Summary

**Overall Session Quality:** Smooth.

**What Worked:** The research-only path produced an externally-grounded convention (FDG, collection-naming, OPA/Rego, DDD) that let AP-60 *codify the dominant shape* rather than impose churn — the migration was correctly "broad but shallow." Per-surface grep-parity caught the one real failure mode (silent transition mis-fire) that no automated guard covers. Strategic review passed without a rework loop, indicating the planning and post-impl-review artifacts were sound.

**Lessons Learned:** A corpus-wide audit that drives migration breadth should run at plan time, not implementation time, so the file count is known before commitment. Merge-gated completion steps need an explicit "PR not yet merged" branch when the workflow can reach `complete` on an intentionally-drafted PR.

**Key Takeaway:** The work package executed cleanly end-to-end; the only real friction was that the true migration breadth (91 files) surfaced during implementation rather than planning.

**Action Required:** No — informational only. The two medium-priority items are candidate workflow refinements, not blockers; raise as workflow-improvement issues if the pattern recurs.
