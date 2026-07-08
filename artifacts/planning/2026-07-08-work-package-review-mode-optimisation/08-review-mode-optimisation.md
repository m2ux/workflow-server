# Compliance Review — `work-package` Review-Mode Path Optimisation

**Workflow reviewed:** `work-package` v3.18.0
**Mode:** workflow-design review (focused audit — review-mode checkpoint friction)
**Date:** 2026-07-08
**Evidence base:** workflow definitions (`workflow.yaml`, 15 activity files, `REVIEW-MODE.md`) + a real review-mode run (`2026-07-07-review-midnight-node-pr-1807`, `is_review_mode=true`).

---

## Executive summary

Review mode is expressed entirely as a boolean `is_review_mode` variable with per-step / per-checkpoint `condition` gates retrofitted onto a create-oriented workflow. That mechanism is sound where it was applied consistently (`validate`, `strategic-review`, `lean-coding-audit` are clean), but it was applied **incompletely**. The result is the friction reported: in review mode the user is presented checkpoints whose outcome is already determined by the mode — they must hand-decline "skip" prompts, and in several cases the **default option is the create/mutating action**, so leaving the checkpoint to auto-advance does the *wrong* thing.

There are two systematic root causes and six concrete findings. The highest-value fix is to **skip whole create-only activities via gated transitions** rather than relying on every internal step being individually gated — the current approach let two entire activities (`implement`, and the create-mode tail of `submit-for-review`) run in review mode despite `REVIEW-MODE.md` documenting them as skipped.

**Findings:** 6 (2 High, 1 High/Med, 2 Med, 1 Low/Med) + 1 documentation defect. None Critical (nothing schema-invalid).

---

## Root-cause analysis

**RC-1 — No activity-level skip.** Review mode has "no `skipActivities` list and no mode `defaults` block" by design (per `REVIEW-MODE.md`); an activity is "skipped" only if every one of its steps *and its inbound transition* is gated. This was never done for `implement` or the create-mode tail of `submit-for-review`. Because a transition condition is evaluated only at the **activity boundary**, an activity that is entered in review mode runs **all** of its ungated steps before the review-mode exit transition is even consulted.

**RC-2 — Un-gated proceed/skip checkpoints default to the create action.** Where a checkpoint's answer is predetermined by review mode, it was frequently left un-conditioned. The user is forced to manually decline it, and its `defaultOption` is the create/push/mutate branch (`pr-creation → "Create branch and PR"`, `review-outcome → "approved"`), so `autoAdvanceMs` auto-advance selects the wrong path in review mode.

---

## Findings

### F1 (HIGH) — `implement` activity is never skipped in review mode
- **Where:** `activities/07-assumptions-review.yaml` (default transition `→ implement`, ungated) + `activities/08-implement.yaml` (zero `is_review_mode` gating anywhere).
- **Effect:** In review mode the workflow enters `implement` and presents `switch-model-pre-impl` (per task), `switch-model-post-impl` (unconditional), and `implementation-assumption-interview`. These are model-switch/code-generation prompts for code that already exists and is not being written.
- **Contradiction:** `REVIEW-MODE.md` explicitly states implement "is **SKIPPED** — its steps and inbound transition are gated `when is_review_mode != true`." The definitions do **not** implement this. This is the clearest instance of the "checkpoints that prompt me to skip implementation" friction.

### F2 (HIGH) — `submit-for-review` create-mode tail runs in review mode
- **Where:** `activities/13-submit-for-review.yaml`.
- **Effect:** The review path (`consolidate-review-findings` → `generate-review-summary` → `review-summary-approval` → `post-pr-review`) is correctly gated `== true`, but the activity then continues through the ungated create-mode tail before the `is_review_mode → complete` transition fires at the boundary: `dco-sign-off-confirmation` (**blocking** DCO attestation for authored code), the `verify-pr-body-rerender` loop + `body-non-conformant`, `review-received` (**blocking**), `process-review-comments`, `analyze-review-outcome`, and `review-outcome`. Multiple spurious blocking checkpoints, plus a DCO certification prompt that is semantically wrong for a review (you are posting comments, not certifying your own contribution).

### F3 (HIGH/MED) — `pr-creation` checkpoint fires with the create-action as default
- **Where:** `activities/01-start-work-package.yaml`, checkpoint `pr-creation`.
- **Condition:** `issue_cancelled != true AND use_existing_pr != true` — **no `is_review_mode` gate.** In review mode both operands keep their defaults, so the checkpoint fires; `defaultOption` is `proceed = "Create branch and PR"`.
- **Observed:** the real run recorded the user selecting `skip-pr` here — a forced hand-decline. Auto-advancing would have created a branch and PR against a PR that already exists.

### F4 (MED) — `plan-prepare` runs create-mode work (incl. a PR-body overwrite) in review mode
- **Where:** `activities/06-plan-prepare.yaml` (no `is_review_mode` gating).
- **Effect:** `approach-confirmed` fires in review mode (observed in the real run). More seriously, the `update-pr::render` step (variant `initial`) is ungated and would **overwrite the reviewed PR's body** — a data-mutation risk, not merely friction.

### F5 (LOW/MED) — issue-creation checkpoints fire in review mode
- **Where:** `activities/01-start-work-package.yaml`: `issue-verification` (observed → `skip-issue`), `github-issue-missing` (default `create`), `issue-review` (default `create`).
- **Effect:** Review mode derives the ticket from the PR; being prompted to provide/create an issue (with a create-oriented default) is off-path.

### F6 (DOC) — `REVIEW-MODE.md` describes behaviour the definitions do not implement
- `REVIEW-MODE.md` documents `implement` and its inbound transition as gated (F1) and presents a clean skip flow. The doc is a good **specification of intent** — the fix is to make the definitions match it, then reconcile the doc.

---

## Clean examples (the target pattern — do not change)

These show the mechanism working and are the model for the fixes:

| Activity | How it stays clean in review mode |
|---|---|
| `lean-coding-audit` (09) | Read-only passes run; `audit-findings-confirmed` checkpoint and `simplification-apply-cycle` gated `!= true`. |
| `validate` (11) | `document-failures`/`assess-test-coverage`/`triage` gated `== true`; `fix-failures` + fix loop gated `!= true`. |
| `strategic-review` (12) | `document-cleanup-recommendations` vs `apply-cleanup` split by mode; explicit `is_review_mode == true → submit-for-review` transition. |

---

## Recommended optimisations

Ordered by value. All are definition-layer changes (no server source), consistent with the existing state-driven design.

**R1 (HIGH → fixes F1).** Skip `implement` via a gated transition. In `assumptions-review`, add a review-mode transition ahead of the default:
```yaml
transitions:
  - to: lean-coding-audit
    condition: { type: simple, variable: is_review_mode, operator: "==", value: true }
  - to: implement
    isDefault: true
```
Optionally gate implement's steps defensively. Removes `switch-model-pre-impl`, `switch-model-post-impl`, `implementation-assumption-interview` from review mode and restores the documented behaviour.

**R2 (HIGH → fixes F2).** End `submit-for-review` after `post-pr-review` in review mode. Gate every create-mode tail step and checkpoint on `is_review_mode != true` (`dco-sign-off-confirmation`, `verify-pr-body-rerender`, `body-non-conformant`, `await-review`, `review-received`, `process-review-comments`, `analyze-review-outcome`, `review-outcome`), or split the review branch so it transitions straight to `complete` after posting the summary.

**R3 (HIGH → fixes F3, F5).** Add `is_review_mode != true` to the `pr-creation` checkpoint's AND condition (so it dismisses via `condition_not_met` in review), and do the same for the create-oriented issue checkpoints (`issue-verification`, `github-issue-missing`, `issue-review`).

**R4 (MED → fixes F4).** In `plan-prepare`, gate the `update-pr::render` (initial) step and the `approach-confirmed` checkpoint on `is_review_mode != true`. Decide whether `plan-prepare` should run at all in review mode or be reframed as review-planning (the mermaid in `REVIEW-MODE.md` keeps it in-path, but its create artifacts must be gated).

**R5 (SYSTEMIC → prevents regression).** Adopt and enforce a review-mode gating invariant:
1. Every **create-only activity** gates its inbound transition on `is_review_mode != true` and provides a review bypass transition — do not rely on per-step gating alone (RC-1).
2. Every checkpoint with a proceed/skip option pair reachable in review mode must **either** carry an `is_review_mode` condition **or** set its `defaultOption` to the non-mutating option — never default to the create/push/mutate branch (RC-2).
3. Add a definition guard (extend the existing check suite, e.g. the `check-binding-fidelity` family) that flags (i) reachable-in-review checkpoints whose default option carries a create/mutating effect and lack an `is_review_mode` gate, and (ii) activities reachable in review mode with no `is_review_mode` gating on any step.
4. Reconcile `REVIEW-MODE.md` with the definitions (F6).

**R6 (VERIFICATION).** Add a review-mode E2E walk to the test harness asserting the review path presents **only** the review-appropriate checkpoints (`review-mode-detection`, `review-pr-reference`, `ticket-completeness`, `comprehension-sufficient`, `review-findings`, `review-summary-approval`) and never enters `implement` or the `submit-for-review` create tail.

---

## Impact if applied

Review-mode checkpoints presented to the user drop from the current set (which includes `pr-creation`, `approach-confirmed`, `switch-model-pre/post-impl`, `dco-sign-off-confirmation`, `review-received`, `review-outcome`, plus issue-creation prompts) to just the genuinely mode-relevant decisions. Every remaining checkpoint becomes one where the answer is *not* predetermined by the mode — which is the definition of a non-spurious checkpoint.
