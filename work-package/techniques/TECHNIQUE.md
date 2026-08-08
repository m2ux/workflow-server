---
metadata:
  version: 1.1.0
---

## Capability

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

## Inputs

### planning_folder_path

Path to this work package's planning folder under `.engineering/artifacts/planning/` — where techniques that persist planning artifacts read and write (filename numbering: artifact-prefix); not every technique produces one.

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

GitHub repository as `owner/repo` for the repository the session is bound to. Bound into github-cli-protocol ops by name-match; domain techniques do not split it.
