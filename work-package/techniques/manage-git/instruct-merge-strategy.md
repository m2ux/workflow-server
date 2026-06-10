---
metadata:
  version: 1.0.0
---

## Capability

Present DCO-compliant merge guidance for the PR, branching on whether the repo allows squash merges. Advisory and read-only — it instructs the human on the correct merge procedure and performs no merge itself.

## Inputs

### squash_merge_supported

Boolean — true when the repo allows squash merges (from [detect-merge-strategy](./detect-merge-strategy.md))

### branch_name

The feature branch to be merged

### pr_number

The PR number being merged

## Protocol

1. When `{squash_merge_supported}` is true, instruct the human to merge locally so the merge commit is both GPG-signed and DCO-attested — the GitHub web UI squash merge is not GPG-signed:
   ```
   git checkout main && git pull
   git merge --squash {branch_name}
   git commit -s -S -m 'feat: description (#{pr_number})'
   git push
   ```
2. When `{squash_merge_supported}` is false, instruct the human that branch commits land as-is on a plain branch merge — no local signing flow is required.
3. Present the guidance as advice the human acts on; do not perform the merge.
