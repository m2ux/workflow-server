# Retrospective: Dual Packaging for One Migration (Dead PR Links, Premature Worktree Removal)

> 2026-08-01 · workflow-authoring resume of `2026-08-01-migrate-legacy-structured-step-conditions-to-when`

## Problem statement (operator)

One corpus migration (#338 W7) was packaged as **two branches and two PRs**, which read as “two workflows for the same work.” That is incorrect: there was **one** planning folder and **one** client session. The failure is **duplicate git/PR packaging**, not a second authoring run.

## Symptoms

1. At meta close-out the operator reported that **all PR links were dead**.
2. The operator required that the **edit worktree must not be deleted until closure is confirmed**.
3. The operator then asked why there were **two workflows for the same work** — the dual branch/PR surface.

## What existed (single job, dual packaging)

| Layer | Count | Identity |
|-------|-------|----------|
| Planning folder | 1 | `2026-08-01-migrate-legacy-structured-step-conditions-to-when` |
| Client session | 1 | `ZR4PDX` (workflow-authoring under meta `6R3YO2`) |
| Migration commit | 1 | `6e12c4c1` |
| Branches (before cleanup) | 2 | `workflow/338-when-migration`, `workflow/corpus-when-migration` (same tip after FF) |
| PRs (before cleanup) | 2 | #374 (seeded empty draft), #378 (full diff on renamed branch) |

| Link in artifacts | Head branch | At investigation | Files on PR |
|-------------------|-------------|------------------|-------------|
| [PR #374](https://github.com/m2ux/workflow-server/pull/374) | `workflow/338-when-migration` | Open **draft**; HTTP 200 | **0** (scaffold tip `e2e70e68` only) |
| [PR #378](https://github.com/m2ux/workflow-server/pull/378) | `workflow/corpus-when-migration` | Open ready; HTTP 200 | **30** (migration tip `6e12c4c1`) |

Neither URL returned HTTP 404 from the API or the web HTML. “Dead” meant **no usable delivery surface** on the official link, plus a **second PR** for the same tip:

1. **#374 looked empty** — draft whose head was still the “open work branch” chore with **zero file changes** against `workflows`.
2. **#378 was a second PR** for the same change — opened because the run’s `workflow_branch` diverged from #374’s head. README pointed at #374; close-out pointed at #378.
3. **Wrong-base compare** — `main...workflow/*` has **no common ancestor** (orphan `workflows` history). Base must be `workflows`.

## Root causes

### 1. Empty draft PR left as the “official” link

Intake seeded Links to [#374](https://github.com/m2ux/workflow-server/pull/374) from the user request (“start … for PR #374”). That PR’s head stayed on the **branch-open chore** (`e2e70e68`) while drafting happened on a **renamed work branch** `workflow/corpus-when-migration` ending at `6e12c4c1`. Nothing advanced `workflow/338-when-migration`, so #374 never gained a diff until repair.

### 2. Second PR instead of updating the first head (the “two workflows” illusion)

`validate-and-commit` / create-pr treated `workflow/corpus-when-migration` as a **new** publication head and opened **#378** against `workflows` rather than fast-forwarding `workflow/338-when-migration` (or retargeting #374’s head).

That is the core defect: **one logical delivery was allowed to mint a second PR and a second branch name** instead of updating the already-linked PR. Operators correctly experienced this as duplicate workstreams.

### 3. Premature worktree removal

`workflow-authoring` `validate-and-commit` runs `remove-worktree` when `worktree_created && commit_approved` **inside the same activity as open-pr**, before meta `end-workflow` and before the operator confirms **completion-confirmed**.

Operator invariant:

> The worktree should **not** be deleted until closure is confirmed.

The activity definition does not encode that invariant. The worker deleted:

`/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-migrate-legacy-structured-step-conditions-to-when`

before meta close-out.

### 4. Not a false URL / auth failure

- `gh api repos/m2ux/workflow-server/pulls/{374,378}` returned live PR objects.
- Web HTML titles and Open/Draft badges rendered; `og:url` matched.
- `mergeable_state: blocked` with **no check runs** is a separate merge-gate signal, not a dead link.

## Fixes applied this session

1. **Restored the edit worktree** at the planning path @ `6e12c4c1`.
2. **Fast-forwarded** `origin/workflow/338-when-migration` to `6e12c4c1` so **#374 shows 30 files**.
3. **Closed #378** as a duplicate with a comment pointing at #374.
4. **Deleted redundant remote branch** `workflow/corpus-when-migration` (tip already on #374’s head).
5. **Removed spare local worktree** `.worktrees/pr3-when-migration` (stale checkout of the pre-FF `338-when-migration` tip) so the planning worktree could hold `workflow/338-when-migration`.
6. **Re-bound planning worktree** to `workflow/338-when-migration` @ `6e12c4c1`.
7. **Repointed planning README / COMPLETE** to #374 and `workflow/338-when-migration`; #378 noted only as closed duplicate.
8. **Held closure** — meta `completion-confirmed` remains open until the operator confirms after verifying links.

Attempted REST `PATCH` with `"draft": false` on #374 did not clear the draft flag in this environment. Marking #374 ready may need a manual “Ready for review” in the UI.

## Canonical delivery surface (after cleanup)

| Resource | Value |
|----------|--------|
| PR | [#374](https://github.com/m2ux/workflow-server/pull/374) only |
| Head branch | `workflow/338-when-migration` @ `6e12c4c1` |
| Base | `workflows` |
| Closed duplicate PR | [#378](https://github.com/m2ux/workflow-server/pull/378) |
| Deleted branch | `workflow/corpus-when-migration` |
| Edit worktree | `.worktrees/2026-08-01-migrate-legacy-structured-step-conditions-to-when` on `workflow/338-when-migration` |

## Recommended process / definition follow-ups

| ID | Finding | Suggested fix |
|----|---------|----------------|
| R1 | `remove-worktree` runs on commit approval, not session closure | Move teardown to meta `end-workflow` after `completion-confirmed`, or gate on an explicit “close confirmed” variable; do not destroy `{target_path}` while checkpoints remain. |
| R2 | Existing open PR head not updated when `workflow_branch` renames | Before `open-pr`, if `pr_number` / Links already name a PR, **push the migration tip to that PR’s head ref** (or PATCH head) instead of opening a sibling PR. |
| R3 | Empty scaffold PRs stay linked as delivery | After first real commit, verify `pulls/{n}/files` length > 0 before treating the PR as published; fail or repair if zero. |
| R4 | Orphan `workflows` base is easy to mis-compare | PR body and README should state base branch `workflows` explicitly; never imply default `main` compare. |
| R5 | Dual branch names (`338-when-migration` vs `corpus-when-migration`) | Prefer one branch name for the whole run, or retarget the open PR when the work branch is renamed; delete the abandoned remote branch in the same publish step. |
| R6 | Second PR reads as “second workflow” | Publication must be idempotent against an already-linked PR: one issue → one PR → one head branch for the run. |

## Verification checklist (operator)

- [x] [PR #374](https://github.com/m2ux/workflow-server/pull/374) Files changed shows ~30 paths
- [x] Base is `workflows`, head is `workflow/338-when-migration` @ `6e12c4c1`
- [x] [PR #378](https://github.com/m2ux/workflow-server/pull/378) is closed as duplicate
- [x] Remote branch `workflow/corpus-when-migration` deleted
- [x] Worktree exists on `workflow/338-when-migration`: `.worktrees/2026-08-01-migrate-legacy-structured-step-conditions-to-when`
- [ ] Draft → ready performed if still draft
- [ ] Meta `completion-confirmed` when operator accepts delivery

## Session ids (for audit)

- Meta: `6R3YO2`
- Client: `ZR4PDX`
- Planning folder: `.engineering/artifacts/planning/2026-08-01-migrate-legacy-structured-step-conditions-to-when`
