# W06 Delivery Evidence

Delivery head: `7fd013a339b55bf07e4ffbae5304e8a168cc137e` on `i11/e09/w06-configuration-from-the-evaluated`. Base: `f03df4884afef499fa9d6fe8c0172f19bc05d152` (`i11/e09/workspace`).

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

`python3 -m pytest skills/work-planner/test` passes 485 tests and 1026 subtests on the delivery head. Survey tests in `test_deliver.py` read the names through `--project` and `--revision` against a git fixture. Before this unit, pytest reported a collection error because `sync.test_plan_agreement` and the `test_plan` body builder carried pytest's test prefix; they are renamed and the suite collects cleanly. [Full output](tests.log).

## Documents

`python3 skills/scripts/check_skill_files.py skills/work-planner` checks 50 files with zero findings. [Checker output](documents.log).

## Review

- The diff touches the 15 paths the work item declares; none is declared by the concurrent W03 delivery.
- `main_working_tree` and the invoking-directory fallback in `sync.py` are removed. No reader of `config/branches` remains outside `long_lived_names`, which reads only `git cat-file blob <commit>:config/branches`.
- Every command that reads the names (`--names`, Sync Epic, Compute Available Work) takes `--revision`, and every caller passes the revision the Branches field names for its run.
- Unevaluable configuration still exits as before; naming the epic checks it leaves unmade is W07.

## Plan Changes

Recorded after delivery; see [Delivery](#delivery).

## Delivery

Pending merge.
