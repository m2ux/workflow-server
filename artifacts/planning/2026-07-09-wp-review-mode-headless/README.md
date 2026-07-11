# work-package — Design Session

**Created:** 2026-07-09
**Mode:** Update
**Status:** Planning

---

## 🎯 Executive Summary

This session updates the existing `work-package` workflow (v3.20.0) so that **review mode runs headless after activation**: once review mode is active and the PR is known, every subsequent checkpoint that fires in review mode auto-resolves to its recommended/default option with no user prompt. Normal (create) mode is unchanged. The request is the systematic follow-on to PR #190, which reduced review-mode checkpoint friction incrementally.

**Confirmed boundary — headless AFTER activation.** The two activation checkpoints stay interactive and are OUT of scope: `start-work-package :: review-mode-detection` ("yes, this is a review") and `start-work-package :: review-pr-reference` (supply the PR). They must NOT be touched. Every OTHER checkpoint that fires once `is_review_mode == true` is in scope for headless treatment via mechanism (a) auto-advance or (b) gate-out.

---

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses.*

- **Feasibility: YES — no schema or engine change required.** The engine already supports headless checkpoints via `defaultOption` + `autoAdvanceMs` on a `kind: checkpoint` step, resolved by the meta-orchestrator through `respond_checkpoint { auto_advance: true }` (server-enforced timer; see `src/tools/workflow-tools.ts` ~L802–820 and `schemas/README.md` checkpoint table). The `work-package` workflow ALREADY uses this pattern for 6 checkpoints (e.g. `classification-and-path-confirmed`, `analysis-confirmed`, `elicitation-complete`, `context-scope-declaration`, `comprehension-sufficient`, plus create-only `github-issue-missing`/`issue-review`/`pr-creation`).
- **Constraint to resolve at design time:** the workflow-design rule `checkpoint-discipline-explicit-user-decision` forbids the meta-orchestrator from auto-resolving a checkpoint without explicit user selection. `auto_advance` is the sanctioned exception (it consumes the declared `defaultOption` after the full timer). Making review-mode checkpoints headless therefore means *either* (a) adding `defaultOption`+`autoAdvanceMs` to the checkpoints that fire in review mode, *or* (b) gating those checkpoints out entirely in review mode (`condition: is_review_mode != true`) when the prompt carries no review-mode value — mirroring how PR #190 already gated several submit-activity checkpoints. Design choice between per-checkpoint (a) vs (b) is deferred to requirements-refinement/scope.
- **Two mechanism families exist for "skip in review mode":** (1) condition-gate the checkpoint out (`is_review_mode != true`); (2) keep it but make it auto-advance. (1) is right when the decision is meaningless in review mode; (2) is right when a decision genuinely exists but a safe default suffices.

## Checkpoints that still FIRE and BLOCK in review mode (the friction to remove)

*Scope target — confirmed against all 15 activity files. Excludes checkpoints already gated `is_review_mode != true`, already auto-advancing, or in the skipped `implement` activity.*

| Activity | Checkpoint | Blocking? | Nature in review mode |
|----------|-----------|-----------|-----------------------|
| start-work-package | `review-mode-detection` | yes | **OUT OF SCOPE** — activation gate, stays interactive |
| start-work-package | `review-pr-reference` | yes | **OUT OF SCOPE** — supplies the PR, stays interactive |
| start-work-package | `jira-project-selection` | yes | Gated on `issue_platform==jira` only, not mode; fires in review mode if jira |
| design-philosophy | `ticket-completeness` | yes | Review-only checkpoint (`is_review_mode==true`) — candidate for default |
| research | `research-convergence` | yes | Fires if research runs; candidate for default |
| research | `research-assumption-interview` | yes | Per open assumption; candidate for gate/default |
| implementation-analysis | `analysis-assumption-interview` | yes | Per open assumption; candidate for gate/default |
| post-impl-review | `file-index-table` | yes | Provenance attestation — low value in review mode; strong candidate |
| post-impl-review | `block-interview` | yes | Per flagged block; candidate |
| strategic-review | `review-findings` | yes | Fires when findings exist (likely in review mode); candidate for default |
| submit-for-review | `review-summary-approval` | yes | Review-only; the "post review to PR" gate — candidate for default |

---

## Compliance Findings

| Severity | Finding | Location | Status |
|----------|---------|----------|--------|
| **Critical (RESOLVED)** | `defaultOption: "{recommended_strategic_option}"` was a template string. The server matches `defaultOption` against option ids by literal string equality (`workflow-tools.ts:815`, no interpolation anywhere); on `auto_advance` it throws `Default option '{recommended_strategic_option}' not found`. Schema-valid (`defaultOption` is `type:string`) but the advertised auto-advance was unusable — would break this checkpoint's headless path in every mode (checkpoint is not review-gated). | `activities/12-strategic-review.yaml` → `review-findings` | **Fixed** — reverted `review-findings` to v3.20.0 form (interactive `blocking: true`, no `defaultOption`/`autoAdvanceMs`) and reverted the file's version bump, making `12-strategic-review.yaml` 0-diff (dropped from change set → 7 files). Docs (`REVIEW-MODE.md`, `README.md`) updated to state the checkpoint stays interactive but is bypassed in review mode by the unconditional `is_review_mode==true → submit-for-review` transition. Re-validated: schema PASS, guard OK 0-NEW. Corpus convention holds: 28/28 remaining `defaultOption`s are literal ids. |

---

## Scope Manifest

**Final change set — 7 files** (quality-review dropped `12-strategic-review.yaml` after the Critical fix reverted it to 0-diff):

| File | Change |
|------|--------|
| `work-package/workflow.yaml` | version 3.20.0 → 3.21.0 |
| `work-package/activities/02-design-philosophy.yaml` | `ticket-completeness` auto-advance → `proceed-with-gaps`; version bump |
| `work-package/activities/04-research.yaml` | `research-convergence` auto-advance → `accept-research`; assumption-interview loop gated `is_review_mode != true`; version bump |
| `work-package/activities/05-implementation-analysis.yaml` | assumption-interview loop gated `is_review_mode != true`; version bump |
| `work-package/activities/10-post-impl-review.yaml` | `file-index-table` → `rationale-confirmed`, `block-interview` → `issue-recorded` auto-advance; version bump |
| `work-package/REVIEW-MODE.md` | headless-after-activation section (3 mechanisms: auto-advance, gate-out, transition-bypass) |
| `work-package/README.md` | headless-after-activation note |

No `src/` change (feasibility held). `12-strategic-review.yaml` NOT in the set — its `review-findings` checkpoint stays interactive and is bypassed by the unconditional review-mode transition.

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Pattern Analysis / Impact Analysis | Create / Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ⬚ Pending |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete |
| 10 | Post-Update Review | Update | ✅ Complete |
| 11 | Retrospective | All | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Review-mode guide | `workflows/work-package/REVIEW-MODE.md` |
| Prior art | PR #190 (incremental review-mode friction reduction) |

---

**Status:** ✅ Session complete. Committed state (commit `5d6bb23e`, PR #194) audited clean (**0 new findings**); the 7-file set matches the manifest with no drift; docs match wired behaviour; create-mode paths unaffected ([10-post-update-review.md](./10-post-update-review.md)). Close-out summary and retrospective recorded in [11-COMPLETE.md](./11-COMPLETE.md). Workflow-design workflow complete — no further activity.
