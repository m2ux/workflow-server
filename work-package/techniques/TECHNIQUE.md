---
metadata:
  version: 1.0.0
---

## Capability

Base contract inherited by sibling techniques. Any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in the set, and any Protocol here is prepended (and renumbered) before each technique's own. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### planning_folder_path

Path to this work package's planning folder under `.engineering/artifacts/planning/` — where techniques that persist planning artifacts read prior artifacts and write their own (the server-provided `artifactPrefix` is applied to the filename); not every technique produces one.

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
