---
metadata:
  version: 1.0.0
---

## Capability

Add a comment to a Jira issue.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### issueIdOrKey

Issue key

### commentBody

Markdown comment body

## Protocol

1. Call `addCommentToJiraIssue { cloudId, issueIdOrKey, commentBody }`.
