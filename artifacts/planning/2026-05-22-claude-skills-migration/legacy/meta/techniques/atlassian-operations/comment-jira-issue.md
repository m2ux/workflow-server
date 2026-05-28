# comment-jira-issue

Add a comment to a Jira issue.

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### issueIdOrKey

Issue key

### commentBody

Markdown comment body

## Procedure

1. Call `addCommentToJiraIssue({ cloudId, issueIdOrKey, commentBody })`.
