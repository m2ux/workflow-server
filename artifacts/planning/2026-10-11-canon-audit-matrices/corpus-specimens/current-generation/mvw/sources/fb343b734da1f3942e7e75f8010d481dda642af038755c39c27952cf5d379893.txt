---
metadata:
  version: 1.0.0
---

## Capability

The roster of pins this run walks: a branch, the newest tag, and a commit of the host repository, each assigned to one of the two checkouts, and one name the repository cannot resolve.

## Inputs

### component_git_dir

The repository whose names the roster draws on.

### default_branch

The repository's default branch, which the branch entry names.

### left_checkout

The worktree the branch entry and the unresolvable entry address.

### right_checkout

The worktree the tag entry and the commit entry address.

## Outputs

### checkout_pins

The roster, in the order the pins land.

#### entry

##### repo_path

The worktree the entry brings to its revision.

##### revision_name

The name the pin resolves — a branch name, a tag name, a full commit, or a name nothing holds.

##### expected_kind

The form the name should resolve as — `branch`, `tag`, or `commit` — or `refused` for the name nothing holds.

## Protocol

### 1. Fetch the Names

- `git -C {component_git_dir} fetch origin --tags`, on the host shell per `git.host-shell-for-remote-git`, so the tags and branch heads the roster names are the remote's current ones.

### 2. Name the Branch Entry

- Open `{checkout_pins}` with `{left_checkout}` at `{default_branch}`, expecting `branch`.

### 3. Name the Tag Entry

- Take the newest tag, the first line of `git -C {component_git_dir} tag --sort=-creatordate`, and add `{right_checkout}` at it, expecting `tag`.
  > When the repository carries no tag, add no entry; the report records the gap.

### 4. Name the Commit Entry

- Take the full commit one behind the default branch head, `git -C {component_git_dir} rev-parse origin/{default_branch}~1`, and add `{right_checkout}` at it, expecting `commit`. A bare hash rather than a second name, so the checkout moves from a name to a commit.

### 5. Name the Unresolvable Entry

- Close `{checkout_pins}` with `{left_checkout}` at `no-such-revision-for-git-pin-conformance`, expecting `refused`. It follows the branch pin on the same checkout, so a refusal that touched the tree would show as a head other than the commit the branch pin landed.
