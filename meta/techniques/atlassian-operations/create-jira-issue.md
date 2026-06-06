---
metadata:
  version: 1.0.0
---

## Capability

Create a new Jira issue.

## Inputs

### project-key

Project key.

### issue-type-name

Name of an issue type valid for the target project (e.g., `Task`, `Bug`).

### summary

Issue summary

### additional-fields

Optional object with description, assignee, labels, etc.

## Output

### issue-key

Created issue key (e.g., `ENG-123`).

## Protocol

1. Call `createJiraIssue { cloud-id, project-key, issue-type-name, summary, description?, additional-fields? }` and return the `issue-key` of the created issue.
   - If the call fails because `issue-type-name` does not exist for the project, apply [list-jira-issue-types](./list-jira-issue-types.md) to discover valid types, then retry.
