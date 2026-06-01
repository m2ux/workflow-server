Discover the fields for a specific issue type in a project.

## Inputs

### cloudId

From [resolve-cloud-id](./resolve-cloud-id.md)

### projectIdOrKey

Project key

### issueTypeId

Issue type ID from [list-jira-issue-types](./list-jira-issue-types.md)

## Protocol

1. Call `getJiraIssueTypeMetaWithFields { cloudId, projectIdOrKey, issueTypeId }`.
