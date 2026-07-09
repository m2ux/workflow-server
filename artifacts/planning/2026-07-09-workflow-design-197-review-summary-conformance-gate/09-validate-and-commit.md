# Validate and Commit — Review-Comment Posting Fix (issue #197)

**Mode:** UPDATE · **Target:** `work-package` (v3.24.0) · **Activity:** `validate-and-commit` (v1.4.0)

Validation half executed by the worker dispatch. The commit / branch / PR half is **PREPARED, not executed** — the orchestrator lands it from a dedicated worktree with user authorization at the `pre-commit-attestation` blocking checkpoint.

---

## Validation result — `all_files_validated = true`

Run via `audit-schema-validation` (step `run-schema-validation`), all commands from repo root (`/home/mike1/projects/main/workflow-server`):

| Check | Command | Result |
|-------|---------|--------|
| Schema validation | `npx tsx scripts/validate-workflow-yaml.ts workflows/work-package` | **PASS** — workflow.yaml (work-package v3.24.0) + all 15 activities + 99 techniques valid; no unanchored protocol refs |
| Reference resolution | `npx tsx scripts/check-all-refs.ts` | **PASS** — work-package 2 refs resolve; **0 unresolved** across all workflows |
| Binding fidelity | `npx tsx scripts/check-binding-fidelity.ts` | **PASS after re-snapshot** — see below |

### Binding-fidelity drift disposition

First run reported **4 NEW** violations + **2 fixed** (stale baseline entries). All 4 NEW are confirmed intentional artifacts of the #197 design, so the baseline was re-snapshot per the technique's own protocol (`--update-baseline` when a flagged change is intentional). Re-run: `268 total, 268 baselined, 0 NEW, 0 fixed — OK`.

| Flagged | Location | Disposition |
|---------|----------|-------------|
| `[dead-output] review_posted` | `update-pr/post-review-comment.md` | Intentional. The real producer of `review_posted` is the `review-summary-approval` checkpoint (`setVariable` on both `post-review`/`skip-posting` options in `13-submit-for-review.yaml`); the technique's declared output is redundant-but-honest. |
| `[orphan-input] review_type` | `update-pr::post-review-comment` | Intentional. Optional input with a **prose-derived default** ("derive from the summary's Overall Rating") — no bag producer by design; the checker does not read prose defaults. |
| `[read-resolution] {sha}` | `review-summary.md:45` | Intentional. Prose token in the protocol sentence describing the attribution footer, resolved at authoring time per the format instruction — not a bag interpolation. |
| `[read-resolution] {user}` | `review-summary.md:45` | Intentional. Same as `{sha}`. |

**IMPORTANT — baseline is a SERVER-REPO change, NOT a workflows-submodule change.** The re-snapshot wrote `scripts/binding-fidelity-baseline.json` (main repo, `+20/-10`). It is entirely separate from the 6 workflows-submodule files and must land via the **server-side follow-up**, never in the workflows commit. The workflows submodule working tree is unchanged by the re-snapshot (still exactly the 6 files).

### Scope manifest — verified complete

Step `verify-scope-manifest`: all 6 manifest items in [06-scope-manifest.md](06-scope-manifest.md) addressed; file presence + action match the draft (5 modify + 1 create, 0 remove). One flagged removal (the `post-pr-review` binding replacement) — intentional, `render` keeps 3 other live bindings, `has_unflagged_removals = false`.

### README steps — no-op (by scope)

Steps `verify-planning-readme` / `readme-authoring`: README.md and REVIEW-MODE.md edits are explicitly OUT of scope (no new activities/transitions/variables → no workflow README change required). Planning-folder README progress row updated to reflect this activity.

---

## Commit / branch / PR — EXECUTED

`pre-commit-attestation` resolved **`approved`** (effect `all_files_validated = true`). The orchestrator executed the plan below from the dedicated worktree with user authorization.

| Output | Value |
|--------|-------|
| Worktree | `/home/mike1/projects/work/workflows/2026-07-09-197-review-comment-verbatim` |
| Branch (`workflow_branch`) | `workflow/197-review-comment-verbatim` (base `workflows`), pushed to origin |
| Commit | `16f6cbcd` — "fix(work-package): post the approved review summary verbatim to the PR (v3.24.0)" — 6 files, +57/-8, Signed-off-by + Co-Authored-By trailers |
| PR (`pr_url` / `pr_number`) | [#199](https://github.com/m2ux/workflow-server/pull/199) (base `workflows`) |
| Dedicated-worktree rule | Satisfied — only the worktree branch received the commit; main `workflows` checkout clean |
| Baseline re-snapshot | Correctly EXCLUDED from this commit; lands via separate server→main follow-up |

The plan as prepared (executed verbatim by the orchestrator):

### Branch

`workflow/197-review-comment-verbatim`  (base: `workflows`)

### Dedicated worktree

`/home/mike1/projects/work/workflows/2026-07-09-197-review-comment-verbatim`

### Files to commit (the 6, workflows submodule only)

```
work-package/activities/13-submit-for-review.yaml   (modified)
work-package/resources/review-mode.md               (modified)
work-package/techniques/review-summary.md           (modified)
work-package/techniques/update-pr/TECHNIQUE.md      (modified)
work-package/workflow.yaml                           (modified)
work-package/techniques/update-pr/post-review-comment.md   (new)
```

EXCLUDE the untracked `.idea/` (unrelated IDE dir, not part of #197).

### Trailer policy

No `AGENTS.md` exists in the workflows submodule. The established submodule commit convention **includes** both a DCO `Signed-off-by` trailer and the `Co-Authored-By` trailer (verified in recent submodule history). Both are therefore INCLUDED below.

### Commit message

```
fix(work-package): post the approved review summary verbatim to the PR (v3.24.0)

The review-mode post-pr-review step was mis-bound to update-pr::render, which
PATCHes the PR description body from a template and ignores the consolidated
review summary the user approves at review-summary-approval. The approved
content therefore never reached the PR as a review comment.

Rebind post-pr-review to a new update-pr::post-review-comment op that writes
{review_summary} to a file and posts it verbatim via
`gh pr review {pr_number} --{review_type} --body-file <file>`, selecting the
flag from the approval choice and the summary's Overall Rating. Codify the
attribution footer in the Consolidated Review Format so it renders into the
summary and posts intact. No conformance-verify loop, no new checkpoint, no
new variables.

- techniques/update-pr/post-review-comment.md: new verbatim-posting op (v1.0.0).
- techniques/update-pr/TECHNIQUE.md: add op to the group index + light
  posting.review-comment-verbatim rule (2.1.0 -> 2.2.0).
- activities/13-submit-for-review.yaml: rebind post-pr-review from
  update-pr::render to update-pr::post-review-comment (1.8.0 -> 1.9.0).
- resources/review-mode.md: attribution footer in the Consolidated Review
  Format template body + {user}/{sha} resolution guidance (1.3.0 -> 1.4.0).
- techniques/review-summary.md: render the footer + present the rendered
  artifact verbatim, never a paraphrase (1.0.0 -> 1.1.0).
- workflow.yaml: 3.23.0 -> 3.24.0.

Closes #197.

Signed-off-by: Mike Clay <mike.clay@shielded.io>
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

### PR title

`fix(work-package): post the approved review summary verbatim to the PR (v3.24.0)`

### PR body (base = `workflows`)

```
## What

Fixes issue #197: in review mode, the `post-pr-review` step was mis-bound to
`update-pr::render`, which PATCHes the PR *description* body from a template
and ignores the consolidated review summary the user approves at
`review-summary-approval`. The approved content never reached the PR as a
review comment.

## Change (minimal, root-cause)

- **New op** `update-pr::post-review-comment` (v1.0.0) — writes `{review_summary}`
  to a file and posts it **verbatim** via
  `gh pr review {pr_number} --{review_type} --body-file <file>`.
- **Rebind** `post-pr-review` (`13-submit-for-review.yaml`) from
  `update-pr::render` to `update-pr::post-review-comment` — the root-cause fix.
- **Attribution footer** codified in the Consolidated Review Format
  (`review-mode.md`) so it renders into the summary and posts intact; the
  `review-summary` technique renders it and presents the artifact verbatim.
- **`update-pr` group**: op added to the Capability index + a light
  `posting.review-comment-verbatim` rule.

No conformance-verify loop, no new checkpoint, no new variables. One flagged
binding replacement; `update-pr::render` retains its 3 other live bindings.

## Versions

work-package 3.23.0 -> 3.24.0 · activity 1.8.0 -> 1.9.0 ·
update-pr group 2.1.0 -> 2.2.0 · review-mode.md 1.3.0 -> 1.4.0 ·
review-summary 1.0.0 -> 1.1.0.

## Validation

- `validate-workflow-yaml.ts workflows/work-package` — PASS (workflow + 15
  activities + 99 techniques).
- `check-all-refs.ts` — 0 unresolved.
- `check-binding-fidelity.ts` — clean after an intentional baseline re-snapshot
  (server-repo `scripts/binding-fidelity-baseline.json`, landed separately).

Closes #197.
```

### Server-side follow-up (separate from this PR)

`scripts/binding-fidelity-baseline.json` (main repo, `+20/-10`) accepts the 4 intentional new binding entries and drops 2 stale ones. Land it in the **server repo** (not the workflows submodule) — via the existing server→main PR flow, mirroring the known "server-side binding baseline shrink follow-up on merge" pattern.

---

## Activity outcome — COMPLETE

All steps done. Validation CLEAN (`all_files_validated = true`); `pre-commit-attestation` approved; commit/branch/PR executed by the orchestrator from the dedicated worktree (commit `16f6cbcd`, branch `workflow/197-review-comment-verbatim`, PR [#199](https://github.com/m2ux/workflow-server/pull/199)). Steps `prepare-workflow-branch`, `stage-and-commit`, `verify-commit`, `publish-workflow-pr` all executed. UPDATE mode → transitions to **`post-update-review`** (`is_update_mode == true`).
