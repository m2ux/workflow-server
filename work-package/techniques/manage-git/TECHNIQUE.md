---
metadata:
  version: 2.1.2
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

Every code commit (NOT artifact commits) MUST carry a `Co-authored-by: {display_name} <{email}>` trailer so GitHub renders both the human and the assistant in the commit byline. Whether to add it manually depends on the harness: Claude Code adds it automatically — do NOT add it again or it will appear twice. Other assistants that do not auto-inject the trailer must add it explicitly via `git commit -m "subject\n\nCo-authored-by: {display_name} <{email}>"`. Known assistant identity for the Claude Code harness: `Co-authored-by: Claude <noreply@anthropic.com>` (auto-injected). For other assistants, use the identity provided by their harness or documentation.

### host-shell-for-remote-git

Every git invocation that contacts a remote (`fetch`, `pull`, `push`, `ls-remote`, network `clone`, and `ssh` to the git host) runs on the host shell — host credentials, host network, and host SSH agent. Isolated execution environments that block those are outside this technique. Local-only git may use the default shell. An isolation denial is not a credential or key failure.
