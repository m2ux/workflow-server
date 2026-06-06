---
metadata:
  version: 1.0.0
---

## Capability

Add a comment to a Jira issue.

## Inputs

### issueIdOrKey

Issue key.

### commentBody

Markdown comment body.

## Protocol

1. Call `addCommentToJiraIssue { cloudId, issueIdOrKey, commentBody }`.
