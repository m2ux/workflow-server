---
metadata:
  version: 1.0.0
---

## Capability

A GitHub issue raised for the work package, labelled for the kind of change it records and verified to exist.

## Protocol

### 1. Draft the Issue

- Use the [issue template](../../resources/github-issue-creation.md#issue-template) and [section rules](../../resources/github-issue-creation.md#section-rules), checking the draft against the [anti-patterns](../../resources/github-issue-creation.md#anti-patterns)
- Gather title, description and acceptance criteria from `{issue_subject}` where it is supplied and from the run's own context otherwise, scoping the issue to the `{component_name}` the work package targets
- Map `{issue_type}` to a GitHub label through the mapping below

| `{issue_type}` | Label |
|---|---|
| `feature` | `enhancement` |
| `enhancement` | `enhancement` |
| `bug` | `bug` |
| `task` | `chore` |
| `epic` | `enhancement` |

### 2. Create and Verify

- Apply [create-issue](../../../meta/techniques/github-cli-protocol/create-issue.md)(*repo_path*=`{component_git_dir}`) with the drafted title, body and label, then capture `{issue_number}` and `{issue_url}` from the verified issue
  > Where the op fails on auth, permissions or network, verify `gh` auth status and repository access and retry. Where it still fails, leave `{issue_number}` unset so the run carries an unsatisfied issue rather than a fabricated one.
