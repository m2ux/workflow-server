# Impact Analysis — Review-Comment Template Fix (issue #197)

**Mode:** UPDATE · **Target workflow:** `work-package` (v3.23.0)
**Scope (minimal, root-cause only):** Fix the review-mode "post to PR" path so the posted review comment is the rendered `review-summary.md` artifact and follows the Consolidated Review Format. No conformance gate, no loop, no new variables.

> Revision note: an earlier draft mirrored the full PR-body conformance machinery (verify step + re-render loop + `review-summary-non-conformant` checkpoint + three new variables). The user judged that over-engineered — "just ensure the review creation comment follows a template and add appropriate rules/technique if one does not exist. dont over-engineer it." This analysis is the minimal root-cause scope: rebind the posting step, ensure a light template rule exists, codify the footer.

## The defect being fixed (root cause)

`post-pr-review` binds `update-pr::render`. But `render` renders and PATCHes the PR **description body** (`gh api ... pulls/<n> -X PATCH -F body=@<file>`) from `planning_folder_path` using the review-mode template — it does **not** post a `gh pr review` comment and does **not** consume the `review_summary` the preceding `generate-review-summary` step produced and the user approved at `review-summary-approval`. Result: the summary the user confirms is not the bytes that reach the PR. The fix rebinds `post-pr-review` to post the rendered `review-summary.md` artifact **verbatim** as a review comment via `gh pr review {pr} --approve|--request-changes|--comment --body-file <review-summary.md>`. Because the posted bytes are exactly the artifact authored to the Consolidated Review Format, template conformance follows from the artifact itself — no separate verify/re-render machinery is needed.

## File inventory & impact classification

| File | Impact | Justification |
|------|--------|---------------|
| `activities/13-submit-for-review.yaml` (v1.8.0) | **Directly modified** | Rebind the `post-pr-review` step (lines 60–67) from `update-pr::render` to a posting op that emits the rendered `review-summary.md` verbatim via `gh pr review {pr} --approve\|--request-changes\|--comment --body-file <review-summary.md>`. No new step, loop, checkpoint, or variable. |
| `techniques/review-summary.md` (v1.0.0) | **Directly modified (light)** | (a) Ensure the produced `review_summary` is written to a file (`review-summary.md`) so the posting op can `--body-file` it verbatim. (b) A `review-summary-conformance`-style rule — ONLY IF one does not already exist. The technique already says "Follow the loaded format exactly … the review-mode resource is the authoritative owner of the format" (line 46) and binds the Consolidated Review Format (lines 8, 38), so prefer strengthening that existing wording over new machinery. (c) Optional (issue item 4) wording so the approval checkpoint presents the rendered artifact, not a paraphrase. |
| `resources/review-mode.md` (v1.3.0) | **Directly modified** | Codify the attribution footer in the **Consolidated Review Format** section (currently absent): `*Posted by an automated review agent on behalf of @{user}. …*`. This becomes the single source of truth the review comment carries. |
| The posting operation's home | **Directly modified OR created** | The rebind needs an op that posts the rendered artifact verbatim as a `gh pr review` comment. Concrete placement (strengthen an existing op vs. add one) is a scope-and-draft decision; reuse/strengthen preferred. It must NOT reuse `update-pr::render` (that PATCHes the PR *description*). |
| `activities/06-plan-prepare.yaml` (line 77) | **Unaffected but constrains design** | Also binds `update-pr::render`. `render` stays intact; only `post-pr-review`'s binding changes. |
| `activities/README.md` (review-mode flow diagram) | **Unaffected** | The flow "consolidate → generate summary → approval → post review" is unchanged in shape; only what the post step binds changes. No diagram edit required. |
| `workflow.yaml` (v3.23.0) | **Unaffected** | No new variables. A version bump, if any, is a draft-time decision — not required by this scope. |
| `REVIEW-MODE.md` / `README.md` | **Unaffected — DELIBERATELY** | No new checkpoint is added, so the documented "headless after activation / `review-summary-approval` is the single review-mode stop" invariant (REVIEW-MODE.md lines 49, 152; README.md line 190) stays true as-is. Leave intact. |
| `techniques/update-pr/*`, all other activities/techniques/resources | **Unaffected** | `verify-body`, `body_*`, the PR-body conformance loop, and every other construct are untouched. No references to the changed constructs elsewhere. |

There is no `techniques/README.md` and no operation-index; the `update-pr` operations set appears only in prose in that group's `TECHNIQUE.md` Capability line. If the posting op is homed in `update-pr`, that one Capability sentence is the only enumeration to touch; otherwise no index update is needed.

## Dependents of the changed constructs

- **`update-pr::render`** — bound at **four** sites: `06-plan-prepare.yaml:77`, and in `13-submit-for-review.yaml` at line 62 (`post-pr-review`, the mis-bind being corrected), line 117 (`update-description`), line 138 (`rerender-body`). Only the line-62 binding changes; the other three are untouched. This is why the fix rebinds one step rather than editing `render`.
- **`review_summary` variable** — produced by `review-summary` technique; consumed by nothing today. After the rebind it becomes the source the posting op emits (as `review-summary.md`). No conflicting consumers.
- **`review-summary-approval` checkpoint** (lines 36–59) — unchanged; still the single interactive confirmation before posting. Its `post-review` option's `--approve`/`--request-changes`/`--comment` selection maps to the `gh pr review` flag the rebound step uses.

## Rippling

None beyond `13-submit-for-review.yaml`. No new variables → no cross-activity reads. No new checkpoint → no headless-invariant ripple. No new activity → no transition-chain change. The change is contained to the one step's binding plus the two content files (`review-summary.md` wording, `review-mode.md` footer).

## Flagged removal (non-destructive-update rule)

**One non-additive change:** the `post-pr-review` step's `technique: update-pr::render` binding (line 62) is **replaced** by the verbatim-post binding. This is an intentional correction of a mis-binding — the intended "post the approved review to the PR" behavior is preserved and made correct. `update-pr::render` remains bound at its other three call sites, so nothing is orphaned. No steps, checkpoints, transitions, rules, variables, or resource sections are deleted. **Flag: one binding replacement at `post-pr-review` — intentional fix, confirm.**

## Integrity checks

- **Transition-chain integrity:** intact — no activities added/removed/reordered; `13`'s transitions (lines 307–326) untouched.
- **Reference integrity:** intact — the rebind points at a posting op (existing-strengthened or newly created); `review-summary` and `review-mode` refs unchanged; no orphaned references (`render` still has three live bindings).

## Impact set summary

**Files to change:** `activities/13-submit-for-review.yaml` (rebind one step), `techniques/review-summary.md` (write artifact to file + ensure a light conformance rule exists + optional item-4 wording), `resources/review-mode.md` (attribution footer in Consolidated Review Format).
**Files to create:** at most one posting-op file, IF the verbatim-post op does not fit an existing operation — decided at scope-and-draft; reuse/strengthen preferred.
**Flagged removal:** one binding replacement at `post-pr-review` (intentional correction; no orphans).
**Explicitly dropped as over-engineering:** `review-summary-non-conformant` checkpoint, `summary_conforms`/`summary_findings`/`summary_override_recorded` variables, `verify-review-summary` step + re-render loop, and any REVIEW-MODE.md/README.md doc edits.
