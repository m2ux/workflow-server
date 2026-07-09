# Scope Manifest — Review-Comment Posting Fix (issue #197)

**Mode:** UPDATE · **Target workflow:** `work-package` (v3.23.0) · **Activity touched:** `13-submit-for-review` (v1.8.0)

Minimal, root-cause-only scope. The `post-pr-review` step is mis-bound to `update-pr::render`, which PATCHes the PR **description body** and ignores the user-approved `review_summary`. The fix rebinds it to a new posting op that emits the rendered consolidated review summary **verbatim** as a `gh pr review` comment, and codifies the attribution footer in the format the summary is authored to. No conformance checkpoint, no verify/re-render loop, no new variables.

## Worktree

`work-package` workflow lives under the workflows submodule at repo root (`/home/mike1/projects/main/workflow-server/workflows/work-package`). Drafting edits are applied there in place. Per the dedicated-worktree rule, the COMMIT of these changes must land in a dedicated workflows worktree/branch — flagged for the commit stage, out of scope for this drafting activity.

## File manifest

| # | Path (relative to `work-package/`) | Action | Type | Description |
|---|-------------------------------------|--------|------|-------------|
| 1 | `techniques/update-pr/post-review-comment.md` | **create** | technique (op) | New single-op file. Posts `{review_summary}` **verbatim** as a PR review comment: writes the summary text to a file and runs `gh pr review {pr_number} --approve\|--request-changes\|--comment --body-file <file>`, selecting the flag per the review-mode Review Type Selection table and the user's `review-summary-approval` choice. Mirrors the minimal style of `mark-ready.md`. Consumes `review_summary`, `pr_number`, `review_type`; emits `review_posted`. |
| 2 | `techniques/update-pr/TECHNIQUE.md` | **modify** | technique group | Add `post-review-comment` to the Capability enumeration (the group's only op index is that one prose sentence). Add a light `review-comment-verbatim` rule under a `posting` group: the posted comment is the rendered `{review_summary}` byte-for-byte, authored to the [Consolidated Review Format](../../resources/review-mode.md#consolidated-review-format) — no re-rendering, no paraphrase. Version bump 2.1.0 → 2.2.0. |
| 3 | `activities/13-submit-for-review.yaml` | **modify** | activity | Rebind the `post-pr-review` step (line 62) from `update-pr::render` to `update-pr::post-review-comment`. No new step/loop/checkpoint/variable. The `review-summary-approval` `post-review` option already gates it; the review-type flag derives from that choice + the format's Overall Rating. Activity version bump 1.8.0 → 1.9.0. |
| 4 | `resources/review-mode.md` | **modify** | resource | Codify the attribution footer in the **Consolidated Review Format** template body (in the fenced `## PR Review Summary` block, at its end), so the footer is part of the summary the technique renders and the posting op emits verbatim. Footer: `*Posted by an automated review agent on behalf of @{user}. The recommendation reflects an independent re-verification at head `<sha>`; the maintainers retain full discretion over disposition.*` Resource version bump 1.3.0 → 1.4.0. |
| 5 | `techniques/review-summary.md` | **modify (light)** | technique | (a) Add rendering the attribution footer to the Render step so `{review_summary}` carries it. (b) Item-4 wording: the approval checkpoint presents the rendered artifact verbatim (or a faithful excerpt), never a paraphrase. No new inputs/outputs, no new machinery. Version bump 1.0.0 → 1.1.0. |

**Files to create:** 1 (`post-review-comment.md`).
**Files to modify:** 4.
**Files to remove:** 0.

## Drafting order

Reference-dependency order: `resources/review-mode.md` (footer — the format authority) → `techniques/review-summary.md` (renders the footer) → `techniques/update-pr/post-review-comment.md` (new op) → `techniques/update-pr/TECHNIQUE.md` (group index + rule) → `activities/13-submit-for-review.yaml` (rebind) → `workflow.yaml` version bump.

No new activities/transitions → no transition-diagram change. No new variables (`review_summary`, `review_posted`, `pr_number` all pre-exist; `review_type` is a local binding on the new op derived from the approval choice).

## Flagged removal (non-destructive-update rule)

One binding replacement: `post-pr-review`'s `technique: update-pr::render` → `technique: update-pr::post-review-comment`. Intentional correction of a mis-binding; `update-pr::render` retains its three other live bindings (06-plan-prepare:77, 13:update-description, 13:rerender-body) so nothing is orphaned. No steps/checkpoints/transitions/rules/variables/sections deleted. `has_unflagged_removals = false` (this removal is flagged here).

## Delegated-authority resolutions

- **New op vs. reuse:** created ONE new op rather than reusing/extending `render`. `render`'s intrinsic contract is "PATCH the PR description from a template"; a `gh pr review` verbatim post is a distinct operation. Extending `render` with a review-comment branch would overload one op with two unrelated effects. `review-mode.md` already documents the exact `gh pr review --body-file` commands, so the op formalizes existing guidance.
- **Verbatim source:** the posting op writes `{review_summary}` to a file and `--body-file`s it, rather than plumbing a persisted `review-summary.md` artifact input through `review-summary.md`. This keeps `review-summary.md` changes light and puts the verbatim guarantee at the posting boundary where it belongs.
- **Footer home:** placed in the format template body (not only as prose), so it is rendered into `{review_summary}` and therefore posted verbatim — the single source of truth the comment carries.
- **Version bumps:** workflow minor (3.23.0 → 3.24.0, new op capability + rebind is behavior-affecting but backward-compatible); activity minor (1.8.0 → 1.9.0); group minor (2.1.0 → 2.2.0); resource minor (1.3.0 → 1.4.0); review-summary minor (1.0.0 → 1.1.0).

## Drafted-content review (block-indexed) + attestation

Drafted and schema-validated (`validate-workflow-yaml.ts`: workflow.yaml + all 15 activities + 99 techniques PASS; workflow now v3.24.0). Diff-stat: 5 modified + 1 created, 23 insertions / 8 deletions — minimal, no bulk rewrites.

| Block | File | Change | Rationale |
|-------|------|--------|-----------|
| `post-review-comment` op | `techniques/update-pr/post-review-comment.md` | **added** | New op: posts `{review_summary}` verbatim via `gh pr review {pr_number} --{review_type} --body-file <file>`; `review_type` defaults to derive from the summary's Overall Rating (no new variable). |
| `update-pr` group Capability + `posting.review-comment-verbatim` rule | `techniques/update-pr/TECHNIQUE.md` | **modified** (2.1.0→2.2.0) | Adds the op to the group's prose op-index sentence and a light rule fixing the verbatim-transport contract, distinct from `render`'s description-PATCH. |
| `post-pr-review` step binding | `activities/13-submit-for-review.yaml` | **modified** (1.8.0→1.9.0) | Rebound `update-pr::render` → `update-pr::post-review-comment` — the root-cause fix. Bare-string binding; `review_summary`/`pr_number` bind same-name, `review_type` uses its default. |
| Consolidated Review Format footer | `resources/review-mode.md` | **modified** (1.3.0→1.4.0) | Attribution footer added to the format template body + `{user}`/`{sha}` resolution guidance, so it renders into `{review_summary}` and posts verbatim. |
| `review-summary` render + present steps | `techniques/review-summary.md` | **modified** (1.0.0→1.1.0) | Render-footer bullet + "present the rendered artifact verbatim, never a paraphrase" (item 4). No new inputs/outputs. |
| workflow metadata | `workflow.yaml` | **modified** (3.23.0→3.24.0) | Minor bump: new op capability + rebind, backward-compatible. |

**Draft attestation:** every drafted block above is reviewed and intentional. The single flagged removal (the `post-pr-review` binding replacement) is deliberate and confirmed; `update-pr::render` retains its three other live bindings, so nothing is orphaned. `has_unflagged_removals = false`. No dropped machinery was introduced. All YAML schema-valid.

## Explicitly OUT of scope

`review-summary-non-conformant` checkpoint; `summary_conforms`/`summary_findings`/`summary_override_recorded` variables; `verify-review-summary` step + re-render loop; REVIEW-MODE.md/README.md headless-invariant doc edits.
