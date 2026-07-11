# Requirements Refinement — Review-Mode Diff-Scope Fix

**Session:** HS4VHZ · **Workflow:** workflow-design · **Activity:** requirements-refinement
**Date:** 2026-07-09 · **Mode:** UPDATE (`is_update_mode = true`) · **Target:** `work-package` (v3.25.0)
**Source of truth:** GitHub issue [#203](https://github.com/m2ux/workflow-server/issues/203) (guidance only — design authority delegated)

> **Delegated design authority.** The user delegated design authority for this fix ("determine the best fix that avoids over-engineering; issue body is guidance only"). Each design dimension below is therefore *derived* from the issue and the existing corpus, favouring the MINIMAL correct change (no new activities/checkpoints/variables unless strictly required; prefer fixing technique/resource text). Reasoning is recorded per dimension. The blocking `dimension-confirmed` checkpoint is still yielded per checkpoint discipline, with a recommended option + rationale.

---

## Design Dimensions (update mode)

Ordered dimensions elicited this activity: **purpose · activity list · checkpoints · artifacts · rules**.
(Update mode omits activity-model, variables, and techniques as standalone dimensions; each is derived and folded into the four above with the variable question surfaced under Artifacts/Rules.)

---

### Dimension 1 — Purpose

**Captured.** Correct the `work-package` workflow's **review-mode PR diff-scoping** so the authored surface a review examines is exactly what the PR changed — no more, no less.

- **Outcome of a run:** a review whose examined file set and findings are constrained to the PR's *authored* changes, eliminating the over-scoping seen in PR #1711 (~390–480 files examined vs ~60 authored; 9/12 findings out of scope).
- **Who/when:** the reviewing agent running `work-package` in review mode (`is_review_mode = true`), during implementation-analysis, strategic-review, and submit-for-review.
- **Value over status quo:** removes two coupled defects —
  1. **Wrong diff base:** review scopes with a **two-dot** diff (`{base_sha}..HEAD`) against a *stored/stale* base SHA captured at checkout; when the PR merges its base back in, unrelated merged commits are swept in.
  2. **Inverted reconciliation:** the flow treats GitHub's correct changed-files list as an understatement and overrides it with the (larger, wrong) local two-dot count.
- **Fix direction (derived):** make GitHub's changed-files list (`gh pr view <n> --json files`, or three-dot `merge-base...head`) the **authoritative authored surface**; never a stored/stale two-dot base; drop the "diff-scope correction" override; add a merge-in guard; constrain every downstream finding to the authored file set.

**Scope discipline:** a focused behavioural correction to review-mode diff-scoping. It touches the diff-base techniques, the review-mode resource, and a downstream finding-constraint. It must NOT expand into a broader review-mode redesign.

---

### Dimension 2 — Activity list

**Captured — NO activity changes.** The fix is entirely behavioural (technique protocol/rules + resource text) inside existing review-mode-gated steps. No activity is added, removed, reordered, or re-gated.

Affected existing activities (unchanged in shape; only their bound techniques/resource change):

| Activity | Role in the fix |
|----------|-----------------|
| `05-implementation-analysis` | binds `review-baseline-state` (review-only) — the primary diff-base defect site; establishes the authored surface. |
| `12-strategic-review` | binds `strategic-review::review-scope` — two-dot defect site; must scope against the authored surface. |
| `13-submit-for-review` | consumes findings via `review-summary` — finding-constraint enforcement point. |
| `10-post-impl-review` | compares PR vs expected changes — reads the authored surface. |

**Reasoning:** the intake structural inventory and update-mode-guide classify this as *modify technique(s) + resource*; no phase is missing and no routing changes. Adding an activity would be over-engineering.

---

### Dimension 3 — Checkpoints

**Captured — NO new checkpoints.** No new user decision gate is introduced.

**Reasoning (explicitly weighed against the issue's merge-in guard):** the issue's guard ("if the head is a merge commit or the branch contains merges from base, explicitly compute the three-dot set and **log** the merge-in") is a **logging / structural guard inside a technique protocol + rule**, not a user decision. It has one correct resolution (recompute the three-dot set and log the discrepancy), so a checkpoint would be friction with no decision to make. Per prior review-mode-optimisation direction (headless-after-activation), review mode deliberately minimises interactive gates. The guard is therefore encoded as a protocol step + a technique `## Rules` entry, not a checkpoint. **No checkpoint changes.**

---

### Dimension 4 — Artifacts & the canonical variable question

**Captured — NO new artifact files.** The existing review artifacts (`implementation-analysis.md`, `code-review.md`, `strategic-review.md`, `test-suite-review.md`, `review-summary.md`) keep their shapes; their *content* becomes correctly scoped.

**Canonical authored-file-set variable — RECOMMENDATION: introduce ONE canonical output, do NOT add a `workflow.yaml` variable.**

- The value that must be authoritative and shared is *the PR's authored changed-file list*. Today the techniques bind diff data by **same-name variable binding** through the bag (`changed_files`, `base_pr_diff`, `base_branch`) — there is no explicit `workflow.yaml` `variables[]` entry for them, and no per-step input deviation; they flow implicitly.
- **Minimal correct change:** have `review-baseline-state` (the review-mode baseline step, run first in implementation-analysis) **produce the authoritative authored file set as its canonical output**, and have the existing consumers (`review-scope`, `review-code`, `review-summary`) read it by the **same canonical name** via implicit same-name binding — honouring `generic-not-overfit` and `canonical-rename-over-args` (unify producer and consumers on one canonical name rather than bridging with per-call renames).
- **Canonical name recommendation:** reuse/repurpose the existing `changed_files` bag name as *the authored surface* (it is already the consumer input on `review-code` and `review-scope`), and have `review-baseline-state` emit it from GitHub's list. This maximises implicit same-name binding and avoids inventing a parallel `authored_files`/`pr_changed_files` name that would need renames at three call sites.
- **`workflow.yaml` `variables[]`:** NOT required. The value is produced and consumed within the review-mode path and flows through the bag like the other diff variables (which are not declared as workflow variables either). Declaring a workflow variable would be inconsistent with the existing pattern and is not needed for cross-activity gating (no `condition`/`transition` reads it). **Recommend: no new workflow variable.**

**Reasoning:** the issue's 5th bullet (constrain findings to the authored set) needs a single authoritative set that producers and consumers agree on — that is exactly one canonical bag output, not a new artifact or a new declared workflow variable.

---

### Dimension 5 — Rules

**Captured.** The correction is encoded as **structure** (protocol steps + technique `## Rules`), per the activity rule "encode critical constraints as structure, not just text." Derived rule set:

1. **Authoritative authored surface (new `## Rules` entry on `review-baseline-state`, echoed in `resources/review-mode.md`).**
   The authored file set is taken from GitHub's changed-files list — `gh pr view {pr_number} --json files` (or the three-dot `git diff --name-only {merge_base}...HEAD` where `{merge_base} = git merge-base {base_branch} HEAD`, freshly recomputed). It is NEVER a stored/stale `{base_sha}..HEAD` two-dot diff.

2. **No stored/stale two-dot base (protocol correction).**
   `review-baseline-state` step 3 `git diff {base_sha}..HEAD` → three-dot against a freshly recomputed merge-base (or GitHub's list); `strategic-review::review-scope` step 1 `git diff <base-branch> HEAD` → `git diff {base_branch}...HEAD`. Local git is used only to read *content* at the reviewed SHA, never to enumerate the authored set from a stale base.

3. **Reconciliation is not inverted (new `## Rules` entry + resource text).**
   GitHub's changed-files list is authoritative. When a local diff disagrees (reports more files), the LOCAL diff is what is wrong (stale base / merged-in commits) — the file list is NOT "corrected" upward. Drop any "diff-scope correction" that overrides the GitHub list.

4. **Merge-in guard (new protocol step + `## Rules` entry, NOT a checkpoint).**
   If HEAD is a merge commit, or the branch contains merges from the base, explicitly compute the three-dot authored set and **log** the merge-in so the discrepancy between two-dot and three-dot counts cannot be silently misread as "more files to review."

5. **Findings constrained to the authored set (new `## Rules` entry on the finding producers; enforced at `review-summary`).**
   A finding on a file NOT in the authoritative authored file set is dropped, or clearly separated as "pre-existing / not introduced by this PR." Applies to `review-code`, `strategic-review::review-scope`, `review-test-suite`, and is enforced at consolidation in `review-summary` / `resources/review-mode.md`.

**Enforcement classification:** all five are **structural** (protocol step + technique `## Rules`), none guidance-only, none needing a checkpoint or a `validate` action. No `workflow.yaml` cross-activity rule is added — the constraints are local to the review-mode techniques/resource, so they live there (avoids a global rule that would read as broader than the fix).

---

## Design Assumptions (surfaced for reconciliation)

See the Assumptions Log section below. The material design decisions this refinement rests on:

| # | Assumption | Category |
|---|------------|----------|
| A1 | The merge-in guard is a logging/structural guard, not a user checkpoint (one correct resolution). | Checkpoint Necessity |
| A2 | No new `workflow.yaml` variable is needed; the authored set flows through the bag as a canonical technique output, consistent with existing diff variables. | Variable State / Schema Construct Choice |
| A3 | The canonical authored-surface name reuses the existing `changed_files` bag name rather than introducing `authored_files`/`pr_changed_files`. | Variable State |
| A4 | No new activity/technique file; the fix is protocol + rule edits to existing techniques (`review-baseline-state`, `review-scope`, `review-code`, `review-diff`, `review-summary`) + `resources/review-mode.md`. | Activity Boundaries / Technique Selection |
| A5 | Findings-constraint is enforced at the consolidation point (`review-summary`) plus a shared rule on producers, not via a new dedicated filtering technique. | Technique Selection / Rule Scope |
| A6 | `review-diff.md` (already three-dot) needs only to source `{$base_branch}` from the authoritative PR base and add the merge-in guard — not a base-form change. | Rule Scope |

---

## Outcome

A settled specification for a minimal, structural correction to review-mode diff-scoping: five defect-site techniques/resource edited to (a) source the authored surface from GitHub's changed-files list / fresh three-dot merge-base, (b) drop the inverted reconciliation, (c) add a merge-in logging guard, and (d) constrain findings to the authored set — with no new activities, checkpoints, workflow variables, or technique files.
