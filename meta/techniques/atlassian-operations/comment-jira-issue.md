---
metadata:
  version: 1.0.0
---

## Capability

Add a comment to a Jira issue.

## Inputs

### issue-id-or-key

Issue key. Passed as the `issueIdOrKey` parameter to the Atlassian MCP tools.

### comment-body

Markdown comment body. Passed as the `commentBody` parameter to the Atlassian MCP tools.

## Protocol

1. Call `addCommentToJiraIssue { cloud-id, issue-id-or-key, comment-body }`.
