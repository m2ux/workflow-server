---
metadata:
  version: 1.0.0
---

## Capability

The revision and any reference report an audit request names.

## Inputs

### user_request

Target specification (component, revision, scope).

## Outputs

### target_revision

The revision the request names: a commit, a tag, or a branch. Empty where it names none.

### reference_report

Path to the reference audit report the request names. Empty where it names none.

## Protocol

### 1. Extract Revision

- Extract the git commit hash, tag, or branch the `{user_request}` names as `{target_revision}`.
  > Where the request means the component as it stands, `{target_revision}` is empty. The word `HEAD` is not a revision here: as a name it also matches `refs/remotes/origin/HEAD`, a remote's default branch.

### 2. Extract Reference

- Record the path of any reference document the `{user_request}` names, such as a professional audit report or a prior review, as `{reference_report}`, without loading or reading it.
