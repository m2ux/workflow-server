---
metadata:
  version: 1.1.0
---

## Capability

Advisory merge guidance for the PR. Branch commits are unsigned. The merge commit is signed, and creating it prompts the user to sign. Read-only; no merge is performed.

## Inputs

### squash_merge_supported

Boolean — true when the repo allows squash merges

## Outputs

### presented_merge_guidance

The merge guidance for the `{pr_number}` PR, branched on `{squash_merge_supported}`. The op is read-only: it sets no workflow state and performs no merge, and the guidance text is its whole product.

## Protocol

### 1. Compose the Guidance for Each Merge Setting

- When `{squash_merge_supported}` is true, instruct the human to squash locally. The squash commit is the merge commit. `git commit -S` prompts the user to sign it. The DCO trailer rides that commit:
   ```
   git checkout main && git pull
   git merge --squash {branch_name}
   git commit -s -S -m 'feat: description (#{pr_number})'
   git push
   ```
- When `{squash_merge_supported}` is false, instruct the human to merge locally. `git merge -S` prompts the user to sign the merge commit. The branch commits are unsigned:
   ```
   git checkout main && git pull
   git merge --no-ff -S {branch_name}
   git push
   ```

### 2. Hand the Guidance Over

- Emit `{presented_merge_guidance}` as advice for the human to act on; do not perform the merge.
