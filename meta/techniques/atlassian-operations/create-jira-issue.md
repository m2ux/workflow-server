---
metadata:
  version: 1.0.0
---

## Capability

Create a new Jira issue.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### projectKey

Project key

### issueTypeName

Name of an issue type valid for the target project (e.g., `Task`, `Bug`)

### summary

Issue summary

### additional_fields

Optional object with description, assignee, labels, etc.

## Output

### issueKey

Created issue key (e.g., `ENG-123`)

## Protocol

1. Call `createJiraIssue { cloudId, projectKey, issueTypeName, summary, description?, additional_fields? }`.

## Errors

### invalid_issue_type

**Cause:** create-jira-issue called with a non-existent `issueTypeName`.

**Recovery:** Apply [list-jira-issue-types](./list-jira-issue-types.md) to discover valid types, then retry.
