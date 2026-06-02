Search Jira issues with JQL.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### jql

JQL query string

### fields

Optional array of fields to return

## Protocol

1. Call `searchJiraIssuesUsingJql { cloudId, jql, fields, maxResults }`.
