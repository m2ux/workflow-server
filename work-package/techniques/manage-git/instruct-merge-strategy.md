---
metadata:
  version: 1.0.0
---

## Capability

Advisory DCO-compliant merge guidance for the PR (read-only; no merge performed).

## Inputs

### squash_merge_supported

Boolean — true when the repo allows squash merges

### branch_name

The feature branch to be merged

### pr_number

The PR number being merged

## Outputs

### presented_merge_guidance

The DCO-compliant merge guidance for the `{pr_number}` PR, branched on `{squash_merge_supported}`: the local GPG-signed squash-merge flow when squash merge is supported, or the plain-branch-merge note when it is not. This op is advisory and read-only — it sets no workflow state and performs no merge; the output is solely the bindable guidance text for the binding activity to surface.


## Protocol

1. When `{squash_merge_supported}` is true, instruct the human to merge locally so the merge commit is both GPG-signed and DCO-attested — the GitHub web UI squash merge is not GPG-signed:
   ```
   git checkout main && git pull
   git merge --squash {branch_name}
   git commit -s -S -m 'feat: description (#{pr_number})'
   git push
   ```
2. When `{squash_merge_supported}` is false, instruct the human that branch commits land as-is on a plain branch merge — no local signing flow is required.
3. Emit `{presented_merge_guidance}` as advice for the human to act on; do not perform the merge.
