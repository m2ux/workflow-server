---
metadata:
  version: 1.0.0
---

## Capability

Checkout of a repository brought to a named revision — a commit, a tag, or a branch — and left detached at the commit that name resolves to, with the commit actually landed answered back.

## Inputs

### repo_path

Working tree to bring to the revision.

### revision_name

The revision to land: a commit (full or abbreviated), a tag name, or a branch name as the remote holds it.

### remote_name

*(optional)* Remote whose refs the name is resolved against, and whose branch heads a branch name means.

#### default

`origin`

## Outputs

### pinned_commit

Full SHA `HEAD` stands at once the pin has landed. Null where the pin was refused.

### revision_kind

Which form `{revision_name}` resolved as — `tag`, `branch`, or `commit`. Null where the pin was refused.

### pin_refusal

Why the checkout was left as it stood: the name resolved to nothing at `{remote_name}`, the working tree carried uncommitted changes, or the landing did not match the resolution. Null where the pin landed.

## Protocol

### 1. Fetch the Remote

- `git -C {repo_path} fetch {remote_name} --tags`, on the host shell per `git.host-shell-for-remote-git`, so the refs the name is resolved against are the remote's current ones.

### 2. Resolve the Name

- Resolve `{revision_name}` to one commit, `{$resolved_commit}`, taking the first form that answers and recording it as `{revision_kind}`: the tag `refs/tags/{revision_name}`, peeled to the commit it points at (`tag`); the remote branch head `refs/remotes/{remote_name}/{revision_name}` (`branch`); `{revision_name}` itself as a commit expression the repository already holds (`commit`). Each form is asked with `git -C {repo_path} rev-parse --verify --quiet`, which prints the commit or nothing.
  > When no form answers, set `{pin_refusal}` naming the revision and the remote, set `{pinned_commit}` and `{revision_kind}` null, leave the checkout as it stood, and stop. A name the repository cannot resolve is refused, never guessed at.

### 3. Read the Working Tree

- `git -C {repo_path} status --porcelain` — the tree is clean when it prints nothing.
  > When it prints paths, set `{pin_refusal}` naming them, set `{pinned_commit}` and `{revision_kind}` null, and stop: a pin never discards work in progress (`git.no-destructive-ops`).

### 4. Check Out Detached

- `git -C {repo_path} checkout --detach {resolved_commit}`.

### 5. Verify the Landing

- `git -C {repo_path} rev-parse HEAD` is `{pinned_commit}`, and `{pin_refusal}` is null.
  > When `HEAD` differs from `{resolved_commit}`, set `{pin_refusal}` stating both commits: the checkout is not at the revision the caller named, and a caller reading `{pinned_commit}` alone would take it to be.

## Rules

### a-branch-pins-the-fetched-head

A branch name lands the commit the remote's branch head stood at when this technique fetched, and `{pinned_commit}` is that commit. The checkout does not track the branch, so a later push to it moves nothing here: a claim derived from the checkout stays a claim about one commit.
