---
metadata:
  version: 1.2.0
---

## Capability

Query GitHub for the component repository's allowed merge strategies (specifically, whether squash merging is enabled).

## Outputs

### squash_merge_supported

Boolean — true if the repo allows squash merges

## Protocol

### 1. Read the Repository's Merge Settings

- Apply [view-repo](/github/techniques/view-repo.md) with *repo_path*=`{component_git_dir}`; set `{squash_merge_supported}` from the op.
