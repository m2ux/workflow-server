# list-jira-transitions

Discover available status transitions for an issue.

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### issueIdOrKey

Issue key

## Procedure

1. Call `getTransitionsForJiraIssue({ cloudId, issueIdOrKey })`.
