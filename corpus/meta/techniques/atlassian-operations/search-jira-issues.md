---
metadata:
  version: 1.0.0
---

## Capability

Search Jira issues with JQL.

## Inputs

### jql

JQL query string

### fields

Optional array of fields to return

## Outputs

### matching_issues

Issues matching the query, one entry per issue, carrying the requested fields.

## Protocol

1. Call `searchJiraIssuesUsingJql { cloudId, jql, fields, maxResults }`; return the matches as `{matching_issues}`.
