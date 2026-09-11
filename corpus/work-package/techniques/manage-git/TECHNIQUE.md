---
metadata:
  version: 2.2.0
---

## Capability

Shared contract for the work package's git work: which checkout each class of operation runs in, what a code commit carries, and which shell reaches a remote.

## Inputs

### host_repo_path

Path to the product repo root, whether a monorepo or a standalone checkout.


## Rules

### directory-scope

Which checkout each class of operation runs in, and the one place the engineering checkout is resolved:

| Operation class | Runs in |
|---|---|
| Edit-side work — branch, pull request, sync, push | `{target_path}` |
| Submodule refresh | `{host_repo_path}` |
| Planning artifact commits | The **engineering checkout**: `{host_repo_path}/.engineering` where that path is a git checkout of its own, and `{host_repo_path}` otherwise |

Branches and pull requests are created against the target's upstream. Every operation and every rendering step that needs the engineering checkout resolves it by this table rather than restating the condition.

### code-commit-coauthor-trailer

Every code commit carries exactly one `Co-authored-by: {display_name} <{email}>` trailer, so the byline names both the human and the assistant. Artifact commits carry none.

Whether the harness injects that trailer is a property of its configuration rather than of its identity, so the trailer is confirmed on the commit rather than predicted from the host: read the committed message, and add the trailer only where it is absent. A commit carrying it twice and a commit carrying none are both what predicting produces, and the assistant identity to use where one must be added is the one that harness reports for itself.

### host-shell-for-remote-git

Every git invocation that contacts a remote (`fetch`, `pull`, `push`, `ls-remote`, network `clone`, and `ssh` to the git host) runs on the host shell — host credentials, host network, and host SSH agent. Isolated execution environments that block those are outside this technique. Local-only git may use the default shell. An isolation denial is not a credential or key failure.
