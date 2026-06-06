---
metadata:
  version: 1.0.0
---

## Capability

Add a comment to a Jira issue.

## Inputs

### issue-id-or-key

Issue key.

### comment-body

Markdown comment body.

## Protocol

1. Call `addCommentToJiraIssue { cloud-id, issue-id-or-key, comment-body }`.
