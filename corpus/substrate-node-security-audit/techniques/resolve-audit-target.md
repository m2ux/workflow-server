---
metadata:
  version: 1.0.0
---

## Capability

Read from the request which component the audit targets, the revision it is audited at, and any reference report, before anything is checked out.

## Inputs

### user_request

Target specification (component, revision, scope).

### target_submodule

Path to the component being audited.

## Outputs

### target_revision

The revision the audit is pinned to: a commit, a tag, or a branch.

### reference_report

Path to any reference document the user supplied, recorded without being read so later phases can quarantine it.

## Protocol

### 1. Extract Target

- Extract the target component (submodule, crate, directory) from the `{user_request}` or workflow variables. If no target component can be identified in the user request, fail with a descriptive error listing the available targets.

### 2. Extract Revision

- Extract the git commit hash, tag, or branch from the `{user_request}` as `{target_revision}`.
  > Where the request names none, `{target_revision}` is the commit `git rev-parse HEAD` prints in `{target_submodule}`: the component's current `HEAD`, named by its commit because the name `HEAD` also matches `refs/remotes/origin/HEAD`, a remote's default branch.

### 3. Extract Reference

- If the user specified a reference document (e.g., a professional audit report or prior review), record its path as `{reference_report}` without loading or reading it, so later phases can quarantine it.
