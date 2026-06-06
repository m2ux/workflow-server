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

## Protocol

1. Call `searchJiraIssuesUsingJql { cloud-id, jql, fields, maxResults }`.
