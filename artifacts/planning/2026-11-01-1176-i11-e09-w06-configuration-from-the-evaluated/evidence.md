# W06 Delivery Evidence

Delivery head: `e4b04f8efbb63c294571a1bb4d8338623be41769` on `i11/e09/w06-configuration-from-the-evaluated`, which merges the epic base `i11/e09/workspace` at `804a7d5b8c297250b033483882c1c53b81cc6b14` (after W03's #1489) into the unit's commits `c208eb2c7`..`7fd013a33`. The unit was cut from `f03df4884`.

## Same Commit Across Worktrees

`LongLivedNames` in `test_sync.py` builds real git repositories and runs `sync.py --names --project <checkout> --revision <rev>`.

- **Divergent and dirty worktrees.** `test_one_commit_reads_alike_from_divergent_and_dirty_worktrees` evaluates one commit from the main working tree (holding an uncommitted `config/branches`), a linked worktree whose branch committed a different declaration, and a linked worktree checked out at that commit with a dirty `config/branches`. All three return `docker`, `main` and the identical `source:` line naming the path, commit and shared git directory.
- **Working files choose nothing.** `test_an_uncommitted_statement_is_not_read` and `test_each_worktree_head_reads_its_own_commit` show an uncommitted edit is ignored and `HEAD` in each worktree resolves to that worktree's commit.
- **No substitute revision.** A revision resolving to no commit, a declaration present only at another revision, and an empty declaration are each unevaluable; `--names` without `--revision` is refused.

This observes AC10. [Full output](tests.log).

## Pinned Epic Base

`PinnedEpicBase` in `test_sync.py` commits `docker`, `main` on `main` and `docker`, `main`, `workflows` on the epic base `i01/e00/workflows` in a linked worktree, and leaves a different uncommitted declaration in the main working tree.

- An epic sync with `--revision i01/e00/workflows` reports `draft: i01/e00/workflows` and a `source:` line naming the base commit.
- A complete epic synced at the base reports `closable: no (unmerged i01/e00/workflows)`.
- The same epic synced at `main` treats the base as no epic base and reports `closable: yes`, so the base's declaration, not the long-lived branch's or the working tree's, decides the result.

This observes AC12. [Full output](tests.log).

## Full Suite

`python3 -m pytest skills/work-planner/test` passes 499 tests and 1027 subtests on the delivery head (485 on the unit's own head before the epic base merge). Survey tests in `test_deliver.py` read the names through `--project` and `--revision` against a git fixture. Before this unit, pytest reported a collection error because `sync.test_plan_agreement` and the `test_plan` body builder carried pytest's test prefix; they are renamed and the suite collects cleanly. [Full output](tests.log).

## Documents

`python3 skills/scripts/check_skill_files.py skills/work-planner` checks 50 files with zero findings. [Checker output](documents.log).

## Review

- The diff touches the 15 paths the work item declares; none is declared by the concurrent W03 delivery.
- `main_working_tree` and the invoking-directory fallback in `sync.py` are removed. No reader of `config/branches` remains outside `long_lived_names`, which reads only `git cat-file blob <commit>:config/branches`.
- Every command that reads the names (`--names`, Sync Epic, Compute Available Work) takes `--revision`, and every caller passes the revision the Branches field names for its run.
- Unevaluable configuration still exits as before; naming the epic checks it leaves unmade is W07.

## Plan Changes

- **Applied — folded work.** [#1493](https://github.com/m2ux/workflow-server/issues/1493) (disagreeing declarations across an epic's bases) folded into I11:E09 W07: AC14 added to #1176 and to W07's Coverage, design added to W07's work item, #1493 closed as tracked there.
- **Held — placement.** [#1492](https://github.com/m2ux/workflow-server/issues/1492) (long-lived branches `main`, `workflows` and `docker` carry no `config/branches`) left standalone. Recommended: a new I11:E09 task committing the declaration to every long-lived branch. Held because its Open Question — whether product branches carry workspace configuration, or the contract names another source — is the plan owner's.

## Debt

- **Trivial, fixed.** pytest collected `sync.test_plan_agreement` (imported into `test_align`) and the `test_plan` body builder as tests, reporting a collection error. Both are renamed.
- **Deferred.** None.

## Delivery

Task PR [#1490](https://github.com/m2ux/workflow-server/pull/1490) merged into `i11/e09/workspace` as `3f7915377194f0685841ca272253cb0aed458383`, at the verified head `e4b04f8ef`. The base was unprotected with no active rules and no check runs or statuses; GitHub reported it clean and mergeable. `origin/workspace` was already contained in the epic base, so Update Epic Base merged nothing. The PR links no issue: W06 has no task issue.

Epic #1176 links W06 to #1490, ticks AC10 and AC12, and ticks W06 Done; the saved body read back exactly and no other row changed. The sync reports a pre-existing coverage disagreement: #1265's Test Plan names AC10 and AC11 while its W05 row covers AC9. Review PR #1487 gains a Branch Configuration area and cites #1490 as R4; its Overview is unchanged and the re-run sync reports its References matching the merges. The epic stays open with W04 and W07 undelivered.
