# 03 — Requirements Refinement

**Workflow:** `work-package` (v3.20.0) · **Mode:** Update · **Session:** 573RKC
**Change:** Make `work-package` review mode headless *after activation* — every checkpoint that fires once `is_review_mode == true` either auto-resolves to its recommended option or is gated out, with ONE exception: `review-summary-approval` stays interactive as the single confirmation before the review is posted to the GitHub PR. The two activation checkpoints also stay interactive. Normal (create) mode unchanged.

This is an UPDATE to an existing workflow, so only the dimensions this change touches are elicited in depth. Purpose, activity list, artifacts, and rules are settled by intake and carried forward with a single confirmation each; **checkpoints** is the dimension where the genuinely-open decisions live.

---

## Dimension 1 — Purpose (confirmed, unchanged by this update)

The `work-package` workflow orchestrates a full engineering work package (intake → design → research → implementation → review → submit). **Review mode** (`is_review_mode == true`) repurposes the same activity graph to review an existing PR rather than produce a new implementation. This update's purpose: when review mode is active, the workflow should run **headless** — no interactive prompting for decisions that either have a single correct answer in review mode or are meaningless in review mode. The value: a review-mode run can be dispatched and left to complete, matching the "review an existing PR" use case where a human is not sitting at each gate. This is the systematic follow-on to PR #190 (incremental review-mode friction reduction).

## Dimension 2 — Activity list (confirmed, unchanged by this update)

No activities are added, removed, or reordered. The review-mode path is unchanged: `assumptions-review → lean-coding-audit → post-impl-review → validate → strategic-review → submit-for-review` (the `implement` activity is skipped in review mode via the existing `assumptions-review` gated transition to `lean-coding-audit`). Confirmed by tracing transitions: `post-impl-review` IS reached in review mode, so its checkpoints are correctly in scope.

## Dimension 3 — Checkpoints (the design work of this update)

**Mechanism-selection principle:**
- **Gate-out** (`condition: is_review_mode != true`) when the decision is meaningless or inapplicable in review mode — the checkpoint (or its enclosing loop) simply does not fire.
- **Auto-advance** (add `defaultOption` + `autoAdvanceMs`) when the checkpoint still needs to "occur" but the recommended option is always the right call in review mode.

**Out of scope — must NOT be touched** (activation stays interactive):
- `start-work-package :: review-mode-detection`
- `start-work-package :: review-pr-reference`

### Per-checkpoint design

| # | Checkpoint | Activity | Mechanism | Recommended resolution | `autoAdvanceMs` |
|---|-----------|----------|-----------|------------------------|-----------------|
| 1 | `ticket-completeness` | design-philosophy | auto-advance | `proceed-with-gaps` (record gaps, don't block) | 30000 |
| 2 | `research-convergence` | research | auto-advance | `accept-research` | 30000 |
| 3 | `research-assumption-interview` | research | **gate-out the enclosing loop** | loop does not run in review mode | — |
| 4 | `analysis-assumption-interview` | implementation-analysis | **gate-out the enclosing loop** | loop does not run in review mode | — |
| 5 | `file-index-table` | post-impl-review | auto-advance | `rationale-confirmed` | 30000 |
| 6 | `block-interview` | post-impl-review | auto-advance | `issue-recorded` (records finding, no input demanded) | 30000 |
| 7 | `review-findings` | strategic-review | auto-advance | recommended option (`{recommended_strategic_option}`, workflow-computed) | 30000 |
| — | `review-summary-approval` | submit-for-review | **stays INTERACTIVE (excluded from headless)** | user confirms before the review posts to the PR | — |
| — | `jira-project-selection` | start-work-package | **no change (out of scope)** | never fires in review mode — see finding below | — |

### ⚠️ Decision — `review-summary-approval` stays interactive (user correction)

`review-summary-approval → post-review` is the ONE checkpoint whose recommended option has an outward-facing side effect: it posts the consolidated review summary as a comment on the GitHub PR (via the `post-pr-review` step, `update-pr::render`). The user's correction (RR-6, rejected): **do NOT auto-advance it.** It stays interactive as the single confirmation guarding the sole outward-facing action — the user wants exactly one prompt in review mode, gating the post-to-PR; everything else in review mode is headless. This checkpoint is therefore **excluded from headless treatment** and gets **no change** (it already blocks interactively). "Headless after activation" means headless for every review-mode checkpoint EXCEPT this one final post-to-PR confirmation.

### Structural findings that shaped items 3 and 4

- The `research-assumption-interview` (research) and `analysis-assumption-interview` (implementation-analysis) checkpoints are **not inline** — both use `ref: assumption-interview`, resolving to the shared `fragments.checkpoints.assumption-interview` body in `work-package/workflow.yaml`.
- **That fragment already carries a `condition`** (`has_open_assumptions == true`). The fragment resolver (`src/loaders/fragment-resolver.ts` L127–131) rejects a ref step that adds a *second* `condition` when the fragment already has one — a load-time error. So the review-mode gate **cannot** be added at the ref site.
- **Chosen mechanism: gate the enclosing `forEach` loop** (`assumption-interview` loop in research; the assumption-interview loop in implementation-analysis) with `condition: is_review_mode != true`. The whole interview loop is skipped in review mode; assumptions are still collected/recorded/reconciled by the surrounding non-interview steps. This keeps the shared fragment generic (does not bake review-mode semantics into a generically-named fragment) and mirrors the intent of `assumptions-review :: assumption-decision` (07), which is already gated `is_review_mode != true`.
- Rejected alternative (3b): mutating the shared fragment's condition to `has_open_assumptions == true AND is_review_mode != true`. It would gate both ref sites at once (both in scope), but overloads a generic fragment with mode-specific semantics — less clean.

### `jira-project-selection` finding (confirmed out of scope)

`jira-project-selection` (start-work-package) is gated `issue_platform == jira` and sits in the issue-**creation** branch (`needs_issue_creation`). Review mode references an **existing** PR/issue; no issue creation occurs. Therefore this checkpoint never fires in review mode and needs no change. Documented rather than modified.

## Dimension 4 — Artifacts (confirmed, unchanged by this update)

No new artifact types. Existing per-activity planning artifacts are unaffected. The workflow's `REVIEW-MODE.md` guide and `README.md` will be updated during scope-and-draft to describe the headless-after-activation behaviour (documentation, not new artifacts).

## Dimension 5 — Rules (confirmed, unchanged by this update)

No new workflow-level rules. The design already conforms to the `checkpoint-discipline-explicit-user-decision` invariant: `auto_advance` (consuming a declared `defaultOption` after the full server-enforced `autoAdvanceMs` timer) is the sanctioned exception to "no auto-resolve without explicit selection". Every auto-advance in this design uses that mechanism; every gate-out removes the decision rather than fabricating one. No schema or engine change is required.

---

## Scope manifest (files this design will change — confirmed here, executed in scope-and-draft)

All under `workflows/work-package/` (the `workflows` submodule; changes go in a dedicated worktree off the `workflows` branch):

- `activities/02-design-philosophy.yaml` — add `defaultOption`/`autoAdvanceMs` to `ticket-completeness`
- `activities/04-research.yaml` — add `defaultOption`/`autoAdvanceMs` to `research-convergence`; add `condition: is_review_mode != true` to the `assumption-interview` loop
- `activities/05-implementation-analysis.yaml` — add `condition: is_review_mode != true` to the assumption-interview loop
- `activities/10-post-impl-review.yaml` — add `defaultOption`/`autoAdvanceMs` to `file-index-table` and `block-interview`
- `activities/12-strategic-review.yaml` — add `defaultOption`/`autoAdvanceMs` to `review-findings`
- `REVIEW-MODE.md`, `README.md` — document headless-after-activation behaviour, noting `review-summary-approval` stays interactive
- Version bump on `workflow.yaml` and each touched activity file per convention

Not touched: `01-start-work-package.yaml` (`review-mode-detection`, `review-pr-reference`, `jira-project-selection`); `activities/13-submit-for-review.yaml` (`review-summary-approval` stays interactive, per user correction RR-6). No `src/` schema/guard change.
