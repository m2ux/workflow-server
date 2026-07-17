---
metadata:
  version: 1.1.1
---

## Capability

Mark the PR ready for review once its description is finalized — via meta [mark-ready](../../../meta/techniques/github-cli-protocol/mark-ready.md).

## Inputs

### pr_number

The PR to mark ready for review.

## Outputs

### updated_pr

PR updated and marked ready for review

#### pr_url

URL to the PR

#### pr_status

Status after update (e.g., ready for review)

## Protocol

### 1. Mark Ready

- Ensure the description is finalized before marking ready
- Apply [mark-ready](../../../meta/techniques/github-cli-protocol/mark-ready.md) with `repo_path` `{target_path}` and `{pr_number}`; land its `{pr_url}` and `{pr_status}` onto `{updated_pr}`
