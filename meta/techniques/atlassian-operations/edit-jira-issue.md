Update fields on an existing Jira issue.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### issueIdOrKey

Issue key

### fields

Object of field updates

## Protocol

1. Call `editJiraIssue { cloudId, issueIdOrKey, fields }`.
