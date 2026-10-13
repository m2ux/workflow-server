---
metadata:
  version: 1.1.1
---

## Capability

The work package's session context: where its planning artifacts live, what problem and requirements they serve, and which worktree, branch, pull request and repository the work runs against.

## Inputs

### planning_folder_path

Path to this work package's planning folder under `.engineering/artifacts/planning/`.

### requirements

*(optional)* Elicited requirements with success criteria and scope. Absent when the run has not elicited them.

### problem_statement

*(optional)* Clear problem definition with system understanding. Absent when the run has not written one.

### target_path

*(optional)* Filesystem path to the work package's target submodule worktree — the codebase being analysed, built, and operated on. Absent when the run has not opened that worktree.

### branch_name

*(optional)* The work package's feature branch. Absent when the run has not opened one.

### pr_number

*(optional)* The work package's pull request number. Absent when the run has not opened a pull request.

### component_git_dir

*(optional)* Absolute path of the component's git working tree — the checkout whose `origin` remote names the component's repository. Absent when the run has not resolved that checkout.

### target_repo

GitHub repository as `owner/repo` for the repository the session is bound to.

## Rules

### findings-constraint

Every finding a review pass states names a file within the authored surface that pass was scoped to. Findings inside that surface form the pull request's findings; findings outside it form a separate "pre-existing" grouping, so a reader can tell what the change introduced from what it merely sits beside.
