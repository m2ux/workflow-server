---
metadata:
  version: 1.0.0
---

## Capability

The revision an audit is pinned to, and any reference report, as the request names them.

## Inputs

### user_request

Target specification (component, revision, scope).

### target_submodule

Path to the component being audited.

## Outputs

### target_revision

The revision the audit is pinned to: a commit, a tag, or a branch.

### reference_report

Path to the reference audit report the request names. Empty where it names none.

## Protocol

### 1. Extract Revision

- Extract the git commit hash, tag, or branch from the `{user_request}` as `{target_revision}`.
  > Where the request names none, `{target_revision}` is the commit `git rev-parse HEAD` prints in `{target_submodule}`: the component's current `HEAD`, named by its commit because the name `HEAD` also matches `refs/remotes/origin/HEAD`, a remote's default branch.

### 2. Extract Reference

- Record the path of any reference document the `{user_request}` names, such as a professional audit report or a prior review, as `{reference_report}`, without loading or reading it.
