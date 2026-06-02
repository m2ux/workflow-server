Log work time on a Jira issue.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### issueIdOrKey

Issue key

### timeSpent

e.g., `2h`, `30m`

## Protocol

1. Call `addWorklogToJiraIssue { cloudId, issueIdOrKey, timeSpent }`.
