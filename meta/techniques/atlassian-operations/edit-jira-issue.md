Update fields on an existing Jira issue.

## Inputs

### cloudId

From [resolve-cloud-id](./resolve-cloud-id.md)

### issueIdOrKey

Issue key

### fields

Object of field updates

## Protocol

1. Call `editJiraIssue { cloudId, issueIdOrKey, fields }`.
