Log work time on a Jira issue.

## Inputs

### cloudId

From [resolve-cloud-id](./resolve-cloud-id.md)

### issueIdOrKey

Issue key

### timeSpent

e.g., `2h`, `30m`

## Protocol

1. Call `addWorklogToJiraIssue { cloudId, issueIdOrKey, timeSpent }`.
