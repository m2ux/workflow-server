---
metadata:
  version: 1.1.0
---

## Capability

The work package's session context: where its planning artifacts live, what problem and requirements they serve, and which worktree, branch, pull request and repository the work runs against.

## Inputs

### planning_folder_path

Path to this work package's planning folder under `.engineering/artifacts/planning/`.

### requirements

Elicited requirements with success criteria and scope

### problem_statement

Clear problem definition with system understanding

### target_path

Filesystem path to the work package's target submodule worktree — the codebase being analysed, built, and operated on

### branch_name

The work package's feature branch

### pr_number

The work package's pull request number

### component_git_dir

Absolute path of the component's git working tree — the checkout whose `origin` remote names the component's repository.

### target_repo

GitHub repository as `owner/repo` for the repository the session is bound to.
