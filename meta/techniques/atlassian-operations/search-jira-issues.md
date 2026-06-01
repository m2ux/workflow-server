Search Jira issues with JQL.

## Inputs

### cloudId

From [resolve-cloud-id](./resolve-cloud-id.md)

### jql

JQL query string

### fields

Optional array of fields to return

## Protocol

1. Call `searchJiraIssuesUsingJql { cloudId, jql, fields, maxResults }`.
