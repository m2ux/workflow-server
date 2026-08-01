---
metadata:
  version: 1.1.0
---

## Capability

Query GitHub for the repo's allowed merge strategies (specifically, whether squash merging is enabled).

## Inputs

### component_name

*(optional)* Basename of the component when nested under `{host_repo_path}`

### host_repo_path

Path to the product repo root (monorepo or standalone).

## Outputs

### squash_merge_supported

Boolean — true if the repo allows squash merges

## Protocol

1. Identify the component git directory `{$component_git_dir}`: `{host_repo_path}/{component_name}` when that path exists, otherwise `{host_repo_path}`. Any checkout of the component repo carries the same remote.
2. Apply [view-repo](../../../meta/techniques/github-cli-protocol/view-repo.md) with `repo_path` `{$component_git_dir}`; set `{squash_merge_supported}` from the op.
