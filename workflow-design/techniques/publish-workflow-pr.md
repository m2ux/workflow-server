---
metadata:
  version: 1.4.0
---

## Capability

Compose the workflow-design PR title and body from bound planning artifacts — ready for the activity to bind meta push / create-pr / mark-ready as consecutive steps.

## Outputs

### title

PR title naming the workflow and the change (create / update).

### body

PR body summarizing the change, listing the scope manifest from `{scope_manifest}`, and linking the planning folder `{planning_folder_path}` (completion summary and review artifacts).

## Protocol

### 1. Compose PR Description

- Compose `{title}` and `{body}` from bound artifacts for the already-pushed `{pushed_branch}`: the title names the workflow and the change (create / update); the body summarizes the change, lists the scope manifest from `{scope_manifest}`, and links the planning folder `{planning_folder_path}` (its completion summary and review artifacts)
