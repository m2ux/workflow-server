# 08 — Quality Review (work-package v3.20.0 → 3.21.0, review-mode-headless)

**Mode:** Update · **Session:** 573RKC · **Date:** 2026-07-09
**Target:** drafted change set in worktree `2026-07-09-wp-review-mode-headless` (branch `workflow/wp-review-mode-headless`)

## Verdict

**Final: `has_critical_finding = false`, `needs_audit_fixes = false`.** One **Critical** finding was raised (verified by independent adversarial re-derivation), then **fixed** in the audit-fix cycle under orchestrator direction (see Resolution below). Schema validation passes; the Critical was a runtime/semantic defect the JSON schema cannot catch.

## Audit passes

| Pass | Result |
|------|--------|
| Expressiveness | 0 findings — every change uses formal fields (`defaultOption`, `autoAdvanceMs`, `blocking`, loop `condition`); no prose-for-construct. |
| Conformance | 1 divergence (= the Critical, now fixed): templated `defaultOption` vs corpus-wide literal-id convention (28/28 other `defaultOption`s are literal ids; `remediate-vuln`'s analogous strategic-review checkpoint uses `defaultOption: acceptable`). |
| Rule hygiene | 0 findings — no rules added; docs table entries are accurate and non-duplicative. |
| Rule enforcement | N/A — no new text-only rules introduced. |
| Schema validation | PASS — all 15 activities + workflow.yaml valid at v3.21.0. |
| review-mode-gating guard | OK — 7 total, 0 NEW, 1 fixed (`strategic-review::review-findings` baseline entry now unused; advisory `--update-baseline` to shrink). |

## Findings

### Critical — `review-findings` templated `defaultOption` never resolves

- **Location:** `work-package/activities/12-strategic-review.yaml`, checkpoint `review-findings`, `defaultOption: "{recommended_strategic_option}"` + `autoAdvanceMs: 30000` + `blocking: false`.
- **Adversarial re-derivation (independent, reproduced):** `respond_checkpoint`'s `auto_advance` branch resolves the default with `checkpoint.options.find(o => o.id === checkpoint.defaultOption)` at `src/tools/workflow-tools.ts:815`. `checkpoint` is the raw definition from `getCheckpoint` (`src/loaders/workflow-loader.ts:444`); no `defaultOption` interpolation exists anywhere (grep-confirmed). The literal string `{recommended_strategic_option}` matches none of the option ids (`acceptable`, `fix-findings`, `selective-fixes`, `defer-findings`, `more-review`), so `defaultOpt` is `undefined` and the server throws `Default option '{recommended_strategic_option}' not found in checkpoint 'review-findings'` (line 817). The auto-advance the config now advertises is unusable.
- **Blast radius:** the checkpoint is NOT review-gated (condition is `strategic_findings_summary != ""`), so it is live in normal mode too. The pre-existing `blocking: true` (interactive) has been converted to advertised-but-broken auto-advance in every mode. The "inert in review mode" claim in REVIEW-MODE.md rests on the `is_review_mode==true → submit-for-review` transition, but that transition is evaluated at the activity boundary AFTER all steps (incl. this checkpoint) run, so the checkpoint is still reached.
- **Resolution (applied):** Reverted the `review-findings` checkpoint to its v3.20.0 form — restored `blocking: true`, removed `defaultOption` and `autoAdvanceMs` — and reverted the file's version bump (2.8.0 → 2.7.0). This made `12-strategic-review.yaml` **0-diff** vs base, so it was **dropped from the change set** (7 files remain). The checkpoint stays interactive but is bypassed in review mode by the unconditional `is_review_mode==true → submit-for-review` transition. Docs updated: REVIEW-MODE.md now lists three headless mechanisms (auto-advance / gate-out / transition-bypass) and describes `review-findings` under transition-bypass; README.md note broadened. No template `defaultOption` remains anywhere (corpus stays 28/28 literal ids). Re-validated: schema PASS (15/15 + workflow.yaml), review-mode-gating guard OK 0-NEW.

## Confirmed correct (no finding)

- **Auto-advance defaults resolve:** `ticket-completeness → proceed-with-gaps` (02), `research-convergence → accept-research` (04), `file-index-table → rationale-confirmed` (10), `block-interview → issue-recorded` (10) — each names an existing option id; each has both `defaultOption` and `autoAdvanceMs: 30000`.
- **Loop gate-out shape valid, no collision:** `condition: is_review_mode != true` on the `assumption-interview` `forEach` loop step in 04 and 05 uses the base step `condition` field (schema-confirmed on loop kind). It sits on the loop step; the inner `ref: assumption-interview` checkpoint fragment carries its own `condition: has_open_assumptions` at a different construct/level — no collision.
- **RR-6 interactive preservation holds:** files 01 and 13 are 0-diff; `review-summary-approval` (13), `review-mode-detection`, `review-pr-reference` (01) unchanged and did not gain auto-advance.
- **`blocking: false` consistent with intent:** schema notes the auto-advance gate reads only `defaultOption` + `autoAdvanceMs`, not `blocking`.
- **Version bumps consistent (post-fix):** workflow 3.20→3.21; 02 1.9→1.10, 04 2.9→2.10, 05 2.9→2.10, 10 1.15→1.16. `12-strategic-review.yaml` reverted to 2.7.0 (0-diff, out of set). Every edited file bumped; no stale 3.20 refs.
- **Docs accurate (post-fix):** REVIEW-MODE.md and README.md corrected to describe `review-findings` as interactive-but-bypassed (transition-bypass), not auto-advancing.
