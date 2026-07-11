# Workflow Design: work-package — Complete

> Update · 2026-07-09

## Summary

This session updates the `work-package` workflow's review mode to resolve issue [#203](https://github.com/m2ux/workflow-server/issues/203): review scoping. Review mode now takes GitHub's changed-files list — the canonical `changed_files` produced by `review-baseline-state` from `gh pr view --json files` or a freshly recomputed three-dot `{base}...HEAD` set — as the authoritative authored surface, guards against base-branch merge-ins by recomputing and logging, and constrains all downstream findings to that authored set. The change ships as protocol, rule, input, and output edits to five techniques and one resource (v3.25.0 → 3.26.0), committed to draft PR [#204](https://github.com/m2ux/workflow-server/pull/204) at SHA `6be95ea8`.

## What Was Delivered

Update mode — all changes against `work-package` v3.25.0, delivered as v3.26.0. Eight files, all modified.

- **Activities:** none changed. `review-baseline-state` binds bare-string at activity 05 and `pr_number` lands by same-name binding from the `review-mode-detection` output at activity 01, so no activity YAML needed editing.
- **Techniques (modified):**
  - `review-baseline-state.md` (1.0.0 → 1.1.0) — gains a `pr_number` input and a `changed_files` output; step 3 derives the authoritative authored surface; a merge-in-guard step recomputes and logs the three-dot set; adds the `authoritative-authored-surface` and `merge-in-guard` rules; `base_pr_diff` is retained and holds the corrected three-dot diff.
  - `review-code.md` (2.0.0 → 2.1.0) — consumes the canonical `{changed_files}` in review mode with a create-mode local-diff fallback; carries the shared `findings-constraint` rule.
  - `review-test-suite.md` (2.0.0 → 2.1.0) — carries the shared `findings-constraint` rule.
  - `strategic-review/review-scope.md` (1.1.0 → 1.2.0) — scopes a three-dot `{$base_branch}...HEAD` diff to `{changed_files}` with a create-mode fallback; derives `{$base_branch}` from the PR target (`gh pr view {pr_number} --json baseRefName`) in step 1; carries the shared `findings-constraint` rule.
  - `review-diff.md` (1.1.0 → 1.2.0) — gains a `pr_number` input and derives the base branch from the authoritative PR target; adds the merge-in note.
  - `review-summary.md` (1.1.0 → 1.2.0) — gains a `changed_files` input and enforces the findings-constraint at consolidation.
- **Resources (modified):** `resources/review-mode.md` (1.4.0 → 1.5.0) — Baseline Capture describes the GitHub-list authoritative surface and reconciliation rule (the GitHub list governs); carries the findings-constraint narrative. Command protocol lives in `review-baseline-state`; the resource references it narratively.
- **Variables / rules:** no new `workflow.yaml` variable. The authored set flows through the bag under the canonical `changed_files` name. Three techniques carry the byte-identical shared `findings-constraint` rule; `review-baseline-state` adds `authoritative-authored-surface` and `merge-in-guard`. `workflow.yaml` takes a root version bump to 3.26.0.

## Design Decisions

Canonically recorded in [`assumptions-log.md`](assumptions-log.md) (RR-1 through RR-6) and the [planning README](README.md) Design Decisions section. Two decisions were confirmed by user interview (RR-1: the merge-in guard is a structural log-only guard, not a user checkpoint, consistent with headless-after-activation review mode; RR-5: the findings-constraint is a shared `## Rules` entry plus enforcement at `review-summary` consolidation, not a new finding-filter technique). The remaining four were audit-validated.

One decision surfaced during drafting and is recorded only here:

- **Context:** Repointing `review-code` and `review-scope` step 1 at the review-mode-only `changed_files` producer would have left create/authoring mode with no scope source.
- **Decision:** Each consumer takes a one-clause fallback — consume canonical `{changed_files}` in review mode, otherwise derive from the local working-tree diff against base.
- **Rationale:** Preserves create-mode behaviour while adopting the authoritative surface in review mode.
- **Alternatives rejected:** A separate create-mode scope technique (heavier than a one-clause fallback); a declared workflow variable for the authored set (same-name bag binding already carries it).

## Scope Outcome

All 8 manifest items delivered ([manifest](06-scope-manifest.md)); the committed diff at `6be95ea8` matches the manifest with no drift (see [`10-post-update-review.md`](10-post-update-review.md) scope-discipline audit). `has_unflagged_removals = false` — every edit is a correction-in-place or additive.

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **F-PU1 (Medium, AP-58) — resolved in this session.** `review-scope.md` initially read `{$base_branch}` without a producing step; fixed by mirroring `review-diff`'s base-branch derivation. Included in the final committed SHA `6be95ea8`.
- **Systemic follow-ups shipped separately as PR [#205](https://github.com/m2ux/workflow-server/pull/205)** against `workflow-design`: a documentation-voice criterion wired into `audit-conformance`, and an AP-85 (resource-protocol) scan added to `audit-anti-patterns`. These harden the design workflow itself against the two classes of issue this session surfaced; they are out of scope for the `work-package` fix on PR #204.
- **PR #204 remains draft.** Merge readiness and the flip out of draft are a downstream decision.

## Workflow Retrospective

[messages: substantive session — 4 non-checkpoint user interactions of note · session quality: Minor friction]

### Observations

<!-- One line per signal, only for categories that occurred. -->
- [clarification] "merge-in guard — checkpoint or structural?" — requirements refinement (RR-1) — resolved by user interview to a structural log-only guard; consistent with headless review mode.
- [clarification] "findings-constraint — new technique or shared rule?" — requirements refinement (RR-5) — resolved by user interview to a shared rule plus consolidation enforcement.
- [correction] "documentation used negative/contrastive prose" — drafting + quality-review (audit-conformance) — the drafted content narrated evolution ("not a main/develop heuristic", "never a stored/stale two-dot base"); the `.engineering` documentation-voice rule requires positive declarative present tense. The user caught it after commit because neither the drafting step nor the quality-review audit screened documentation voice. Fixed across 7 files.
- [correction] "gh command protocol added to resources/review-mode.md" — drafting (AP-85) — command protocol belongs in the `review-baseline-state` technique, which already owned it. The anti-pattern audit walked AP-41..67 and did not reach AP-85. Resource reverted to a narrative reference.
- [process] startup dispatch friction — bootstrap — the first intake worker was blocked on a pointer mismatch because the client session pointer had not been advanced via `next_activity` before the first activity worker was dispatched. Recovered by advancing the pointer and re-dispatching.

### Recommendations

<!-- Prioritized, specific, actionable. -->
1. **High:** documentation-voice violation reached a commit → a documentation-voice screen is wired into workflow-design `audit-conformance` (shipped as PR #205). The screen scans drafted technique/resource content for evolution-narration markers and rejects them before commit.
2. **High:** the anti-pattern audit missed AP-85 (resource-protocol) → the AP-85 scan is added to workflow-design `audit-anti-patterns` (shipped as PR #205), closing the gap left by the audit walking only AP-41..67.
3. **Medium:** the bootstrap advanced the client pointer after dispatching the first activity worker → advance the client session pointer via `next_activity` before dispatching the first activity worker, so the worker's `get_activity` pointer check passes on the first attempt.

**Key takeaway:** The `work-package` fix landed clean and minimal; the two review-caught issues (documentation voice, AP-85) both trace to audit coverage gaps in the design workflow itself, and both gaps are now closed structurally in PR #205.
**Action required:** no — the systemic fixes are captured in PR #205; issue #203 is addressed by PR #204.
