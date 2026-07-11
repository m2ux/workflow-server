# work-package — Design Session

**Created:** 2026-07-09
**Mode:** Update
**Status:** Session complete — v3.26.0 on draft PR [#204](https://github.com/m2ux/workflow-server/pull/204) at final SHA `6be95ea8` (F-PU1 fixed); close-out recorded in [`COMPLETE.md`](COMPLETE.md); systemic audit hardening shipped as PR [#205](https://github.com/m2ux/workflow-server/pull/205)

---

## 🎯 Executive Summary

This session updates the **`work-package`** workflow's **review mode** to fix a diff-scoping defect ([issue #203](https://github.com/m2ux/workflow-server/issues/203)): review mode scopes a PR's authored surface with a two-dot diff against a stored/stale base, sweeping in commits merged from the base branch and over-scoping reviews by an order of magnitude. The fix makes GitHub's changed-files list (three-dot / `gh pr view --json files`) the authoritative authored surface, removes the inverted "diff-scope correction," and constrains downstream findings to the authored file set.

---

## Design Decisions

Settled in requirements refinement (see [`03-requirements-refinement.md`](03-requirements-refinement.md) and [`assumptions-log.md`](assumptions-log.md)):

- **No new activity, checkpoint, workflow variable, or technique file.** The fix is protocol + rule edits to five existing techniques/resource. (RR-4)
- **Authoritative authored surface** = GitHub's changed-files list (`gh pr view {pr_number} --json files`) or a freshly recomputed three-dot `{merge_base}...HEAD`; never a stored/stale two-dot base. Canonical bag name reuses the existing `changed_files` — no new declared workflow variable. (RR-2, RR-3)
- **Merge-in guard is structural** (protocol step + technique `## Rules`), not a user checkpoint — recompute the three-dot set and log the merge-in; one correct resolution, consistent with headless-after-activation review mode. (RR-1)
- **Findings-constraint** = a shared `## Rules` entry on the finding producers plus enforcement at `review-summary` consolidation; not a new finding-filter technique. (RR-5)
- **Enforcement classification:** all five rules are structural (protocol step + technique rule); no `workflow.yaml` cross-activity rule added.

---

## Compliance Findings

Quality-review passes: expressiveness / conformance / rule-hygiene / rule-enforcement all clean (0 findings each). One verified High from `verify-high-findings`, now fixed.

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High (resolved) | F1 — create-path `changed_files` producer removed: repointing `review-code`/`review-scope` to the review-mode-only `review-baseline-state` left authoring/create mode with no source | `techniques/review-code.md`, `techniques/strategic-review/review-scope.md` (step 1) | Applied: one-clause create-mode fallback — consume canonical `{changed_files}` in review mode, else derive from local working-tree diff against base. Prose-only; re-audit + all guards clean |

---

## Scope Manifest

Confirmed during scope-and-draft (see [`06-scope-manifest.md`](06-scope-manifest.md)). 8 files, all MODIFY — no create/remove, no activity-YAML edits. Drafted and validated in worktree `workflow/203-review-diff-scope`.

| File (under `work-package/`) | Version | Change |
|------------------------------|---------|--------|
| `workflow.yaml` | 3.25.0 → 3.26.0 | Root version bump only |
| `techniques/review-baseline-state.md` | 1.0.0 → 1.1.0 | + `pr_number` input, `changed_files` output; step-3 two-dot → authoritative surface; +merge-in-guard step; +`authoritative-authored-surface` / `merge-in-guard` rules; `base_pr_diff` repurposed (retained) |
| `techniques/review-code.md` | 2.0.0 → 2.1.0 | Consume canonical `{changed_files}` (review mode) with create-mode local-diff fallback (F1); +`findings-constraint` rule |
| `techniques/review-test-suite.md` | 2.0.0 → 2.1.0 | +`findings-constraint` rule only |
| `techniques/strategic-review/review-scope.md` | 1.1.0 → 1.2.0 | Two-dot → three-dot `{$base_branch}...HEAD` scoped to `{changed_files}`, with create-mode local-diff fallback (F1); +`findings-constraint` rule |
| `techniques/review-diff.md` | 1.1.0 → 1.2.0 | + `pr_number` input; base derived from authoritative PR base; merge-in note |
| `techniques/review-summary.md` | 1.1.0 → 1.2.0 | + `changed_files` input; enforce findings-constraint at consolidation |
| `resources/review-mode.md` | 1.4.0 → 1.5.0 | Baseline Capture → authoritative surface + reconciliation rule; +findings-constraint narrative |

**Non-destructive:** `has_unflagged_removals = false` — every edit is correction-in-place or additive; nothing deleted. Validation: `workflow.yaml` loads clean via server loader; all 99 techniques pass the unanchored-reference check; technique-template, review-mode-gating, and self-provisioned-input guards all pass.

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete |
| 10 | Post-Update Review | Update | ✅ Complete |
| 11 | Retrospective | All | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Source issue | [#203](https://github.com/m2ux/workflow-server/issues/203) |
| Pull request | [#204 (draft)](https://github.com/m2ux/workflow-server/pull/204) |
| Systemic hardening | [#205](https://github.com/m2ux/workflow-server/pull/205) |
| Close-out | [`COMPLETE.md`](COMPLETE.md) |

---

**Status:** Session complete — v3.26.0 on draft PR [#204](https://github.com/m2ux/workflow-server/pull/204) at final SHA `6be95ea8` (F-PU1 fixed); close-out and retrospective recorded in [`COMPLETE.md`](COMPLETE.md). Systemic audit hardening (documentation-voice screen + AP-85 scan) shipped as PR [#205](https://github.com/m2ux/workflow-server/pull/205).
