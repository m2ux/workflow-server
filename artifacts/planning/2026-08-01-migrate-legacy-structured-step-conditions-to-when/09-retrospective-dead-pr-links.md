# Retrospective: Dead PR Links and Premature Worktree Removal

> 2026-08-01 · workflow-authoring resume of `2026-08-01-migrate-legacy-structured-step-conditions-to-when`

## Symptoms

At meta close-out the operator reported that **all PR links were dead**, and that the **edit worktree must not be deleted until closure is confirmed**.

## What the links actually were

| Link in artifacts | Head branch | At investigation | Files on PR |
|-------------------|-------------|------------------|-------------|
| [PR #374](https://github.com/m2ux/workflow-server/pull/374) | `workflow/338-when-migration` | Open **draft**; HTTP 200 | **0** (scaffold tip `e2e70e68` only) |
| [PR #378](https://github.com/m2ux/workflow-server/pull/378) | `workflow/corpus-when-migration` | Open ready; HTTP 200 | **30** (migration tip `6e12c4c1`) |

Neither URL returned HTTP 404 from the API or the web HTML. “Dead” here meant **no usable delivery surface**:

1. **#374 looked empty** — GitHub renders a draft PR whose head is still the “open work branch” chore commit with **zero file changes** against `workflows`. Conversation loads; Files changed is empty. That matches a broken or unfinished PR in practice.
2. **#378 was a second PR** for the same change, opened because the run’s `workflow_branch` / worktree tip diverged from the head #374 already tracked. Operators following the original planning README (#374) saw an empty PR; operators following close-out (#378) saw a different number than the seeded issue/PR trail.
3. **Wrong-base compare** — `main...workflow/corpus-when-migration` has **no common ancestor** (orphan `workflows` history). Any UI or bookmark that assumes default-branch base yields a hard compare failure even when the correct base `workflows` compare is healthy (`ahead_by: 2`, 36 files in git compare).

## Root causes

### 1. Empty draft PR left as the “official” link

Intake seeded Links to [#374](https://github.com/m2ux/workflow-server/pull/374) from the user request (“start … for PR #374”). That PR’s head stayed on the **branch-open chore** (`e2e70e68`) while drafting happened on a **renamed/rebased work branch** `workflow/corpus-when-migration` ending at `6e12c4c1`. Nothing advanced `workflow/338-when-migration`, so #374 never gained a diff.

### 2. Second PR instead of updating the first head

`validate-and-commit` / create-pr treated `workflow/corpus-when-migration` as the publication head and opened **#378** against `workflows` rather than fast-forwarding `workflow/338-when-migration` (or retargeting #374’s head). Result: two open PRs, one empty, one full — and artifact links split across them (README had pointed at #374; close-out pointed at #378).

### 3. Premature worktree removal

`workflow-authoring` `validate-and-commit` runs `remove-worktree` when `worktree_created && commit_approved` **inside the same activity as open-pr**, before meta `end-workflow` and before the operator confirms **completion-confirmed**.

Operator invariant stated on this resume:

> The worktree should **not** be deleted until closure is confirmed.

The activity definition does not encode that invariant today. The worker followed the YAML (`09-validate-and-commit.yaml` step `remove-worktree`) and deleted:

`/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-migrate-legacy-structured-step-conditions-to-when`

before meta close-out. That left no local edit surface when PR links needed investigation and repair.

### 4. Not a false URL / auth failure

- `gh api repos/m2ux/workflow-server/pulls/{374,378}` returned live PR objects.
- Web HTML titles and Open/Draft badges rendered; `og:url` matched.
- `mergeable_state: blocked` on #378 with **no check runs** is a separate merge-gate signal, not a dead link.

## Fixes applied this session

1. **Restored the edit worktree** at the canonical planning path on `workflow/corpus-when-migration` @ `6e12c4c1` (before any further close-out).
2. **Fast-forwarded** `origin/workflow/338-when-migration` to `6e12c4c1` so **#374 shows 30 files** (same tip as the migration commit).
3. **Closed #378** as a duplicate with a comment pointing at #374 (delivery PR).
4. **Repointed planning README Links** to #374 and `workflow/338-when-migration` (and will keep #378 noted only as closed duplicate in this note).
5. **Held closure** — meta `completion-confirmed` remains open until the operator confirms after verifying links.

Attempted REST `PATCH` with `"draft": false` on #374 did not clear the draft flag in this environment (response still `draft: true` after head update). Marking #374 ready may need a manual “Ready for review” in the UI or a supported REST path on the host’s GitHub version.

## Recommended process / definition follow-ups

| ID | Finding | Suggested fix |
|----|---------|----------------|
| R1 | `remove-worktree` runs on commit approval, not session closure | Move teardown to meta `end-workflow` after `completion-confirmed`, or gate on an explicit “close confirmed” variable; do not destroy `{target_path}` while checkpoints remain. |
| R2 | Existing open PR head not updated when `workflow_branch` renames | Before `open-pr`, if `pr_number` / Links already name a PR, **push the migration tip to that PR’s head ref** (or PATCH head) instead of opening a sibling PR. |
| R3 | Empty scaffold PRs stay linked as delivery | After first real commit, verify `pulls/{n}/files` length > 0 before treating the PR as published; fail or repair if zero. |
| R4 | Orphan `workflows` base is easy to mis-compare | PR body and README should state base branch `workflows` explicitly; never imply default `main` compare. |
| R5 | Dual branch names (`338-when-migration` vs `corpus-when-migration`) | Prefer one branch name for the whole run, or retarget the open PR when the work branch is renamed. |

## Verification checklist (operator)

- [ ] [PR #374](https://github.com/m2ux/workflow-server/pull/374) Files changed shows ~30 paths
- [ ] Base is `workflows`, head is `workflow/338-when-migration` @ `6e12c4c1` (or later)
- [ ] [PR #378](https://github.com/m2ux/workflow-server/pull/378) is closed as duplicate
- [ ] Worktree exists: `.worktrees/2026-08-01-migrate-legacy-structured-step-conditions-to-when`
- [ ] Draft → ready performed if still draft

## Session ids (for audit)

- Meta: `6R3YO2`
- Client: `ZR4PDX`
- Planning folder: `.engineering/artifacts/planning/2026-08-01-migrate-legacy-structured-step-conditions-to-when`
