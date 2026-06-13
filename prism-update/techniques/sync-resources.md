---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 1
  legacy_id: 1
---

## Capability

Apply an approved change set to the resources directory, committing each change type separately for clean git history.

## Protocol

### 1. Sync Modified

- For each entry in `{change_set}.modified`, copy the upstream file over the resource file with `cp`.
  > If a copy fails, verify the upstream file exists and the resource directory is writable, then retry.
- Stage and commit: `feat: sync N modified prism resources with upstream`.

### 2. Apply Renames

- For each entry in `{change_set}.renamed`, compute the new resource filename (preserve the index, replace the name), run `git mv` from old to new, then copy the upstream content over the renamed file.
- Stage and commit: `feat: rename N prism resources to match upstream`.

### 3. Import New

- Order `{change_set}.new` by family for logical index grouping.
- For each new prism, derive the hyphenated file slug `{$hyphenated_name}` from the upstream prism name and copy the upstream file to `{resource_path}/{next_index}-{hyphenated_name}.md` with `cp`, then increment `{next_index}`.
  > If the computed index already exists, increment `{next_index}` past the collision and retry.
- Stage and commit: `feat: add N new prism resources (indices X-Y)`.

### 4. Remove Deleted

- For each entry in `{change_set}.deleted`, run `git rm` on the resource file.
- When any file was removed, commit: `feat: remove N deprecated prism resources`.

### 5. Verify Count

- Count the resource files and confirm: previous − deleted + new = current.
