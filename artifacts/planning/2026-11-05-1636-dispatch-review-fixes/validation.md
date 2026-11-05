# Dispatch Review Fixes Validation

## Scope

The three reviewed defects are corrected on `skill/1636-dispatch-review-fixes`, based on workspace `03d353300ca4804194fd50d316d73e3bf1270d1d`, after PR #1636 and the lane integration merged. The new PR targets workspace. Existing disclosure cleanup remains outside these fixes.

## Retained Worktrees

Eight real-Git tests exercise the Delivery Branches validation command. A prepared checkout can be validated repeatedly without recreating its branch. Foreign ownership, branch or revision mismatch, detached HEAD and tracked or untracked changes are rejected with the checkout preserved. A full recorded preparation revision is required.

Unit Dispatch selects creation for a new unit and validation for a retained preparation. The preparation carries each worktree's creation head and retains its base and component context. The brief is populated from that context after validation.

## Stable Blockers

Six added orchestration tests retain observed run and unit failures across successive surveys. A missing capability stops the run before publication or a hold. A unit failure excludes its joined rows and preparations while independent work can start. The start validator rejects a stale selected batch when a current blocker applies. Clearing a blocker requires new evidence of resolution.

The coordinator's Dispatch Delivery Units procedure owns result routing. Artifact failures return unit blockers; missing harness capability returns a run blocker; capacity loss retains a preparation. Queue refreshes retain unresolved blockers.

## Priority Order

Six added integration cases exercise the real survey and batch selector, including a current queue that retains priority-1 active work beside priority-10 Ready work. One free slot selects the priority-10 unit. Other cases cover initiative priority ahead of sibling-epic priority, deterministic ties, cross-repository parent links, the largest valid priority label, lane admission and joined units.

Priority label parsing has one shared implementation used by the queue, survey and standup reader. Delivery Plan exports the survey's order; Dispatch Batch applies scope, occupancy, blockers and capacity to that sequence.

## Planner Suite

Result: 943 tests, OK, with one opt-in live Development-link test skipped because no live test issue and draft pull request were supplied. Command: the worktree's absolute scripts/sbx launcher with `python3 -m unittest discover -s test`, from `skills/work-planner`. [Complete output](planner-tests.txt).

The final focused suite contains 31 orchestration tests; the retained-worktree suite contains 8 tests. These include the 20 regressions added for the three findings.

## Shared Checks

- Shared skill-checker suite: 208 tests, OK.
- Document and checkout contract checks: 18 tests, OK.
- Skill-file checker: 55 files, zero findings.
- Diff whitespace check: no findings.

## Disclosure Verification

Two independent fresh-context readers traced retained resumption and run/unit failure routing. They confirm the validation branch preserves the retained preparation and reaches its first worker start; capability failure terminates before holding, while a unit failure is retained through Advance, Fetch and Survey so independent work proceeds. No new delivery confirmation is required within the retained authorization.

These are source and prose dry runs, supported separately by executable local regression tests. The readers performed no GitHub writes or real worker starts. One optional reader probe could not execute inside its unprivileged sandbox. The source changed during the initial reads; the readers reread the affected procedures before returning their final traces. This is not a fixed-revision baseline or a claim of consistent retrieval.

The inherited exclusion limitation remains: 23 direct Deliver prerequisites load unrelated hot-fix, review, issue and worker material. One reader measured 237,071 bytes of direct prerequisites; the other counted 46 retrieved documents and 56,081 words including transitive guidance. Truncated reads were recovered. These measurements establish their stated content volume, not token savings. Disclosure exclusion remains partial and is reported separately from functional verification.
