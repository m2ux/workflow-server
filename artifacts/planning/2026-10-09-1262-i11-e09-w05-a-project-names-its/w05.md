## Overview

The long-lived branches of a project are the names the project states in `config/branches` at its root, one per line. A run from a linked worktree resolves that worktree's main working tree and reads the statement that tree holds. Where no statement exists and no integration branch names a branch, the set is unevaluable and the report names the missing statement. Work Planner's sync and deliver scripts take that one reading, and this repository states its own four names.

## Problem

- **A directory of components answers as a set of branch names.**
  `long_lived_names` reads the [subfolder names of `.project`](https://github.com/m2ux/workflow-server/blob/360f0081/skills/work-planner/scripts/sync.py#L606-L611) in the main working tree. `.project` is a component directory, reserved for nothing, so a project keeping checkouts, notes or a scratch folder there is answered confidently with names that are not branches.
- **A linked worktree has no reading of its own.**
  The directory is untracked, so no worktree of this repository but the main one carries it. A session dispatched into `.worktrees/<unit>` has to be handed `--project <main>` by hand, and a run that forgets falls through to the integration-branch derivation or exits.
- **The statement is untracked, so it is not the project's.**
  `.project` is local to one checkout. A clone states nothing, and the set it yields depends on what one machine happens to hold.
- **The reading is described in six places.**
  `work-breakdown.md` under Long-lived branches, `commands.md` under List Long-Lived Branches and Sync Epic, the docstrings and `--help` text of `sync.py` and `deliver.py`, and `CLAUDE.md` at the repository root each state the directory rule, so a stale description reads as current fact wherever the reading is looked up.

## Proposal

A project states its long-lived branches in a tracked file at its root, `config/branches`, one branch name per line. The file is the only statement of the set; nothing beside it in the tree is read as a branch name. Where the project states none, the names are still the ones the initiative's integration branches carry, and where neither yields a name the set is unevaluable.

- **The statement is a file the project owns.**
  `config/branches` is tracked, so every clone and every worktree of the project states the same set, and a directory holding components is never mistaken for it. Blank lines are skipped; each remaining line is one branch name.
- **A linked worktree reads its main working tree.**
  A linked worktree's `.git` is a file naming the gitdir under `<main>/.git/worktrees/<name>`, whose `commondir` resolves to the main `.git`. The main working tree is that directory's parent, and the statement is read there. A main working tree resolves to itself.
- **Unevaluable names what is missing.**
  Where the resolved tree holds no `config/branches` and no integration branch of the initiative names a branch, the command exits naming the absent `config/branches` and the absent integration branch.
- **One reading serves both scripts.**
  `deliver.py` imports `long_lived_names` from `sync.py`, and the `--names` path prints what that function returns, so the epic bases a unit is offered and the names a sync closes against come from the same statement.
- **This repository states its own set.**
  `config/branches` names `docker`, `main`, `workflows` and `workspace`.
- **Every surviving description of the directory reading goes.**
  The guide, the two command specs, both scripts' docstrings and `--help` text, and the root `CLAUDE.md` state the file rule.

## Work Breakdown

| Part | Description |
| --- | --- |
| Analysis | How a linked worktree names its main working tree through `.git` and `commondir`, and which callers of `long_lived_names` pass a worktree path |
| Implementation | `long_lived_names` in `skills/work-planner/scripts/sync.py` resolving the main working tree and reading `config/branches`, the `--names` path and `deliver.py`'s `--project` taking that reading, and `config/branches` for this repository |
| Documentation | `references/work-breakdown.md` under Long-lived branches, `references/commands.md` under List Long-Lived Branches and Sync Epic, both scripts' docstrings and `--help` text, and `CLAUDE.md` under Commits and pushes |
| Review | A grep for every surviving description of the directory reading across the skill, the scripts and the repository root, and a read of each caller of `long_lived_names` against the new signature |
| Test | `skills/work-planner/test/test_sync.py`: `config/branches` names the set while a `.project` directory beside it names nothing (AC9); a fixture that is a linked worktree of a project, with its `.git` file and `commondir`, returns the names its main working tree returns (AC10); a project with no `config/branches` and refs carrying no integration branch exits unevaluable naming `config/branches` (AC11). The existing `LongLivedNames` and `InitiativeClose` cases and `test_deliver.py`'s base cases take the file statement. Run as `cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` |
