---
metadata:
  version: 1.1.0
---

## Capability

A push is on the remote tracking branch. When `{paths}` is set, each of those paths is in the commit the tracking branch holds.

## Inputs

### repo_path

The checkout the push ran in.

### branch

The branch the push sent.

### remote_name

*(optional)* Remote the push sent.

#### default

`origin`

### paths

*(optional)* Files the push was meant to carry. Unset when the confirm is of the branch tip alone.

## Outputs

### push_landed

True when the remote tracking branch holds `HEAD` and, where `{paths}` is set, each of those paths is in that commit. False when the retry has run and the tracking branch still does not.

## Protocol

### 1. Read the Tracking Branch

- The remote-tracking ref of `{branch}` names the commit the push landed on. The push has landed when that commit is the commit `HEAD` names.

  ```text
  git -C {repo_path} rev-parse --verify {branch}@{upstream}
  ```

### 2. Retry the Push

- When the tracking branch does not hold `HEAD`, `git -C {repo_path} push {remote_name} {branch}`, on the host shell per `host-shell-for-remote-git`.

### 3. Read the Tracking Branch Again

- When the retry ran, read that ref once more. `{push_landed}` is false when it still does not name `HEAD`.

  ```text
  git -C {repo_path} rev-parse --verify {branch}@{upstream}
  ```

### 4. Read the Paths

- When `{paths}` is set and the tracking branch holds `HEAD`, `git -C {repo_path} ls-tree -r --name-only HEAD -- {paths}` lists each of them. `{push_landed}` is false when a path is absent. `{push_landed}` is true when every named path is listed, and when `{paths}` is unset and the tracking branch holds `HEAD`.
