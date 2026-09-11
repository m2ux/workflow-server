---
metadata:
  version: 1.0.0
---

## Capability

Fetch from the private `security` remote and check out a fresh local feature branch off the private fork, naming it for the advisory so the fix never touches a public branch.

## Inputs

### short_id

Short slug identifying the advisory, used to form the branch name.

## Outputs

### branch_name

Name of the local security feature branch, formed as `vuln/remediate-{short_id}` and checked out off the private fork.

## Protocol

### 1. Initialize Security Branch

- Fetch from the `security` remote inside `{target_path}` so the private fork's refs are current.
- Set `{branch_name}` to `` `vuln/remediate-{short_id}` ``.
- Check out a new local branch named `{branch_name}` off the fetched private-fork ref.
