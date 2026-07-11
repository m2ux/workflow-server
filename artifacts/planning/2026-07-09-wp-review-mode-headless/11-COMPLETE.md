# Workflow Design: work-package — Complete

> Update · 2026-07-09

## Summary

Updated the `work-package` workflow (v3.20.0 → 3.21.0) so **review mode runs headless after activation**: once review mode is active and the PR is known, every subsequent checkpoint auto-resolves or is gated out, except the single outward-facing gate that posts the consolidated review to the GitHub PR. This completes the systematic follow-on to PR #190's incremental review-mode friction reduction, and it needed no schema or engine change — the engine's existing `defaultOption` + `autoAdvanceMs` auto-advance path carried the whole design.

## What Was Delivered

- **Activities (modified):**
  - `02-design-philosophy.yaml` — `ticket-completeness` gains auto-advance → `proceed-with-gaps` (v1.9→1.10)
  - `04-research.yaml` — `research-convergence` auto-advance → `accept-research`; the `research-assumption-interview` `forEach` loop gated `is_review_mode != true` (v2.9→2.10)
  - `05-implementation-analysis.yaml` — the `analysis-assumption-interview` `forEach` loop gated `is_review_mode != true` (v2.9→2.10)
  - `10-post-impl-review.yaml` — `file-index-table` auto-advance → `rationale-confirmed`, `block-interview` auto-advance → `issue-recorded` (v1.15→1.16)
- **Techniques:** none changed.
- **Resources (modified):**
  - `REVIEW-MODE.md` — headless-after-activation section describing three mechanisms (auto-advance / gate-out / transition-bypass) plus a per-checkpoint table
  - `README.md` — headless-after-activation note
- **Variables / rules:** none added. All new auto-advancing checkpoints use `defaultOption` + `autoAdvanceMs: 30000` + `blocking: false`; the two loop gates use the base step `condition` field.
- **Workflow root:** `workflow.yaml` version 3.20.0 → 3.21.0.

## Design Decisions

Canonically recorded in the [assumptions log](./assumptions-log.md) (RR-1 … RR-6) and the planning [README Design Decisions section](./README.md#design-decisions). The load-bearing ones:

- **No schema/engine change (RR-5).** The engine already auto-resolves a `defaultOption`+`autoAdvanceMs` checkpoint via `respond_checkpoint { auto_advance: true }`; the workflow already used it for 6 checkpoints. This is the sanctioned exception to `checkpoint-discipline-explicit-user-decision`.
- **Two mechanisms for "skip in review mode."** (a) Auto-advance the checkpoint (when a real decision exists but a safe default suffices); (b) gate the checkpoint out via `condition: is_review_mode != true` (when the decision is meaningless in review mode). A third — transition-bypass — surfaced during the Critical fix (below).
- **Loop-level gate, not ref-site condition (RR-3).** Both assumption interviews are `ref: assumption-interview`, a shared fragment that already carries `condition: has_open_assumptions`. The fragment resolver forbids doubling a fragment's condition, so the review-mode gate goes on the enclosing `forEach` loop step, keeping the shared fragment generic. **Alternative rejected:** adding a second condition at the ref site (illegal per `src/loaders/fragment-resolver.ts:127-131`).
- **`review-summary-approval` stays interactive (RR-6, corrected).** The one checkpoint with an outward-facing, non-idempotent side effect (posting the consolidated review to the GitHub PR) is excluded from headless treatment and remains the single interactive stop. **Alternative rejected:** auto-advancing it too, which the initial design proposed before the user corrected it.

## Scope Outcome

Delivered exactly the 7-file post-fix manifest ([README Scope Manifest](./README.md#scope-manifest)); post-update review confirmed 0 drift.

One approved substitution: `12-strategic-review.yaml` was manifest item 7 in the original requirements but was reverted to 0-diff and dropped after the quality-review Critical fix. Its requirement (headless `review-findings`) is now satisfied by transition-bypass — the unconditional `is_review_mode==true → submit-for-review` transition already skips the checkpoint — rather than auto-advance. Documented substitution, not an omission.

## Known Limitations & Deferrals

- **`file-index-table` and `block-interview` auto-advance in create mode too** — they are not review-gated at the checkpoint level, so their auto-advance is live in every mode. Both defaults (`rationale-confirmed`, `issue-recorded`) carry no effect, so create-mode semantics are unchanged; the only behavioural shift is that an unattended run auto-proceeds after 30s instead of blocking indefinitely. Judged acceptable, not a regression.
- **Review-mode-gating guard baseline has one stale entry** — `strategic-review::review-findings` remains a baseline entry now unused after the revert. Advisory `--update-baseline` to shrink; deferred (cosmetic).
- **Server-side E2E snapshot regen (PR #195)** is a separate draft PR on base `main`, depends-on #194; it must land after the content PR merges.

## Lessons Learned

- A `defaultOption` value is matched by **literal string equality** against option ids — there is no interpolation. A template like `{recommended_strategic_option}` is schema-valid but a runtime defect the schema cannot catch. Never template a `defaultOption`.
- When a shared fragment owns its own `condition`, add mode/context gating at the **enclosing loop or step level**, not the ref site — the fragment resolver rejects a doubled condition, and loop-level gating keeps the fragment generic.

## Workflow Retrospective

[messages: ~9 total, ~7 non-checkpoint · session quality: Minor friction]

### Observations

<!-- Substantive (non-checkpoint) interactions only. -->
- [correction] RR-6 "review-summary-approval stays interactive" — requirements-refinement → checkpoint-necessity — initial design over-reached by proposing headless treatment for the one checkpoint with an outward-facing, non-idempotent side effect (posting to the GitHub PR). Root cause: the "headless after activation" framing invited a blanket sweep; the outward-facing side-effect distinction was not surfaced as a first-class scoping question up front.
- [clarification] Headless boundary scoping — the two activation checkpoints (`review-mode-detection`, `review-pr-reference`) are explicitly OUT of scope. Resolved early and cleanly; the "after activation" boundary was pinned before drafting, which prevented churn on the activation prompts.
- [checkpoint anomaly] Quality review caught a real **Critical** the schema passed — templated `defaultOption` on `review-findings` that the server never resolves. The adversarial re-derivation reproduced the exact server throw. This is the quality-review activity working as intended; the friction is that the defect was introduced during drafting rather than caught at draft time.

### Recommendations

1. **High:** Draft-time introduction of a templated `defaultOption` → add a lint/guard check that flags any `defaultOption` whose value is not a literal option id present in the checkpoint's `options[]` (catch it in scope-and-draft / validate, not only in quality review). Affected: the validation guard suite (`check-*` guards) and the drafting technique for checkpoint construction.
2. **Medium:** Outward-facing side effects are invisible to a "make it headless" sweep → have requirements-refinement explicitly enumerate, per in-scope checkpoint, whether its recommended option has a non-idempotent / externally-visible effect, and treat any that do as presumptively interactive. Affected: work-package requirements-refinement checkpoint-necessity analysis (would have surfaced RR-6 as a design input rather than a correction).

**Key takeaway:** For a "make it headless" change, the two things that bite are non-literal `defaultOption` values (a runtime defect the schema misses) and outward-facing side effects (which a blanket sweep silently swallows) — both are cheap to catch if named as explicit checks up front.
**Action required:** no — recommendation 1 is a guard enhancement worth an issue if the templated-`defaultOption` class recurs; recommendation 2 is a workflow-content refinement for a future work-package design pass. Neither blocks this delivery.
