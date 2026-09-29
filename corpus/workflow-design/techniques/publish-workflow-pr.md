---
metadata:
  version: 1.6.0
---

## Capability

Workflow-design PR title and body composed from bound planning artifacts.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

### pushed_branch

The branch that was pushed, in `{remote_name}/{branch}` form or as the bare branch name.

## Outputs

### title

PR title naming the workflow and the change (create / update).

### body

PR body summarizing the change, listing the scope manifest from `{manifest_entries}`, and linking the planning folder `{planning_folder_path}` (completion summary and review artifacts).

## Protocol

### 1. Compose PR Description

- Compose `{title}` and `{body}` from bound artifacts for the already-pushed `{pushed_branch}`: the title names the workflow and the change (create / update); the body summarizes the change, lists the scope manifest from `{manifest_entries}`, and links the planning folder `{planning_folder_path}` (its completion summary and review artifacts)
