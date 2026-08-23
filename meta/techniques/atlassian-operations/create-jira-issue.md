---
metadata:
  version: 1.0.0
---

## Capability

Create a new Jira issue.

## Inputs

### projectKey

Project key.

### issueTypeName

Name of an issue type valid for the target project (e.g., `Task`, `Bug`).

### summary

Issue summary

### additional_fields

Optional object with description, assignee, labels, etc.

## Outputs

### issueKey

Created issue key (e.g., `ENG-123`).

## Protocol

1. Call `createJiraIssue { cloudId, projectKey, issueTypeName, summary, description?, additional_fields? }` and return the `{issueKey}` of the created issue.
   - If the call fails because `{issueTypeName}` does not exist for the project, call `getJiraProjectIssueTypesMetadata { cloudId, projectIdOrKey: projectKey }` to discover the types the project accepts, then retry with one of those.
