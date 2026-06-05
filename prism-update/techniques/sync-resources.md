---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Apply an approved change set to the resources directory — sync modified, rename, import new, and remove deleted — committing each change type separately for clean git history.

## Inputs

### changes

Approved, categorized change set (new, modified, renamed, deleted entries plus next index) to apply against the resources directory

### resource-path

Path to the prism workflow resources directory

### next-index

Starting index for new resource files

## Protocol

### 1. Sync Modified

- For each changes.modified: cp upstream file over resource file.
- Stage and commit: 'feat: sync N modified prism resources with upstream'.

### 2. Apply Renames

- For each changes.renamed: compute new resource filename (preserve index, replace name).
- Run git mv old → new. Copy upstream content over renamed file.
- Stage and commit: 'feat: rename N prism resources to match upstream'.

### 3. Import New

- Order new prisms by family for logical index grouping.
- For each: cp upstream file to {resource-path}/{next-index}-{hyphenated-name}.md. Increment next-index.
- Stage and commit: 'feat: add N new prism resources (indices X-Y)'.

### 4. Remove Deleted

- For each changes.deleted: git rm resource file.
- If any removed, commit: 'feat: remove N deprecated prism resources'.

### 5. Verify Count

- Count resource files. Confirm: previous - deleted + new = current.
- Assemble import-result: tally the modified, renamed, new, and deleted counts, record the final total and the commit SHAs from each step.

## Outputs

### import-result

Summary of file operations

#### modified_count

Number synced

#### renamed_count

Number renamed

#### new_count

Number imported

#### deleted_count

Number removed

#### total_count

Final resource count

#### commits

List of commit SHAs

## Errors

### copy_failed

**Cause:** File copy operation failed

**Recovery:** Check that upstream file exists and resource directory is writable.

### index_collision

**Cause:** Computed index already exists

**Recovery:** Increment next-index past the collision and retry.
