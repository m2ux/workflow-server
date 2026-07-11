# Scope Manifest & Structural Design — Review-Mode Diff-Scope Fix

**Session:** HS4VHZ · **Workflow:** workflow-design · **Activity:** scope-and-draft
**Date:** 2026-07-09 · **Mode:** UPDATE · **Target:** `work-package` (v3.25.0 → 3.26.0)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-09-review-mode-diff-scope` (branch `workflow/203-review-diff-scope`)
**Basis:** confirmed design spec + `05-impact-analysis.md` (both in this planning folder)

---

## 1. Worktree Verification

- Worktree present and checked out at the expected path; branch `workflow/203-review-diff-scope` (off `workflows`). ✅
- All 8 target files exist at the expected paths under `work-package/`. ✅
- No activity-YAML edits required (bare-string bindings + same-name output landing — confirmed in impact §3.3).

## 2. Precondition resolutions (impact §5 caveats closed)

- **`pr_number` availability at activity 05 (§5.4):** RESOLVED — no gap. `review-mode-detection` (bound in `01-start-work-package.yaml` on the review path) declares `pr_number` as an output; it lands in the bag by same-name binding at activity 01, well before activity 05. `review-baseline-state` can add `pr_number` as an input and it resolves by same-name binding with **no `step.technique.inputs` deviation** — so `05-implementation-analysis.yaml` stays untouched.
- **`base_branch` source:** `review-baseline-state` and `review-diff` already carry `base_branch`/`{$base_branch}`. The fix derives the authoritative PR base via `gh pr view {pr_number} --json baseRefName` rather than a `main`/`master` heuristic; no new workflow variable.
- **File count 6 → 7 (§5.1):** include `review-test-suite.md` (shared findings-constraint rule only) — it is a finding producer per RR-5.
- **`review-summary` gains `changed_files` input (§5.2):** add it (same-name binding).
- **`base_pr_diff` dead output (§5.3):** RETAIN, repurposed to hold the corrected three-dot diff. No signature deletion.

## 3. File Manifest (8 files — all MODIFY; no create/remove)

| # | Path (under `work-package/`) | Action | Type | Version | Change summary |
|---|------------------------------|--------|------|---------|----------------|
| 1 | `techniques/review-baseline-state.md` | modify | technique | 1.0.0 → 1.1.0 | Add `pr_number` input + `changed_files` output; step 3 two-dot → authoritative surface (`gh pr view --json files` / fresh three-dot); new merge-in-guard step; new `authoritative-authored-surface` + `merge-in-guard` rules; retain/repurpose `base_pr_diff` |
| 2 | `techniques/strategic-review/review-scope.md` | modify | technique | 1.1.0 → 1.2.0 | Step-1 two-dot commands → three-dot `{base_branch}...HEAD` scoped to `{changed_files}`; new shared `findings-constraint` rule |
| 3 | `techniques/review-diff.md` | modify | technique | 1.1.0 → 1.2.0 | Step-1 `{$base_branch}` heuristic → authoritative PR base (`gh pr view --json baseRefName`); merge-in guard note (diff-form already three-dot) |
| 4 | `techniques/review-code.md` | modify | technique | 2.0.0 → 2.1.0 | Step-1 unspecified `git diff` range → consume canonical `{changed_files}`; new shared `findings-constraint` rule |
| 5 | `techniques/review-test-suite.md` | modify | technique | 2.0.0 → 2.1.0 | New shared `findings-constraint` rule only |
| 6 | `techniques/review-summary.md` | modify | technique | 1.1.0 → 1.2.0 | Add `changed_files` input; step-2 enforce findings-constraint at consolidation (drop / separate pre-existing findings outside authored set) |
| 7 | `resources/review-mode.md` | modify | resource | 1.4.0 → 1.5.0 | Baseline Capture narrative → GitHub-list authoritative surface; add reconciliation rule (GitHub list is authoritative, never overridden by local counts); add findings-constraint text at Consolidated Review Format |
| 8 | `workflow.yaml` | modify | workflow | 3.25.0 → 3.26.0 | Root version bump only |

**No implicit files.** No file created; none removed. No activity YAML touched.

## 4. Shared `findings-constraint` rule (single canonical wording, files 2/4/5)

> ### findings-constraint
> Every finding must name a file within the authored surface `{changed_files}` (the PR's changed-files set). A candidate finding whose file lies outside `{changed_files}` is pre-existing — not introduced by this PR — and is dropped, or separated under a clearly-labelled "Pre-existing / not introduced by this PR" grouping rather than mixed into the PR's findings.

`review-summary` (file 6) enforces the same constraint at consolidation; `review-mode.md` (file 7) carries the narrative echo.

## 5. Drafting Order

Per the activity rule (`workflow.yaml` first, then activities, then techniques, then resources, then README) and the reference-dependency chain:

1. `workflow.yaml` (root version bump — no dependents)
2. `techniques/review-baseline-state.md` (canonical **producer** of `changed_files` — precedes its consumers)
3. `techniques/review-code.md` (consumer)
4. `techniques/review-test-suite.md` (consumer)
5. `techniques/strategic-review/review-scope.md` (consumer)
6. `techniques/review-diff.md` (base-source correction)
7. `techniques/review-summary.md` (consolidation enforcement — last technique, reads all findings)
8. `resources/review-mode.md` (narrative owner — reflects the finalized technique behavior)

(No activity files and no README in scope, so those tiers are empty here.)

## 6. Comparison against adopted patterns

- **Producer→consumer via same-name binding** (impact §3.2): `review-baseline-state` lands `changed_files` under its own id; the 3 review-path consumers already declare `changed_files` as an input — resolves by implicit same-name binding, honouring `canonical-rename-over-args` / `generic-not-overfit`. No per-call rename.
- **Additive / correction-in-place** (impact §4): every edit is a correction on an existing protocol step / narrative section or an added rule/input/output. No `## Rules` entry, protocol step, input, output, resource section, or cross-reference is deleted. `has_unflagged_removals = false`.
- **Structure over prose:** technique protocol/inputs/outputs/rules carry semantics; no ordered-procedure prose added to any activity/step `description`.
