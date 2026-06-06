---
metadata:
  version: 1.0.0
---

## Capability

Update fields on an existing Jira issue.

## Inputs

### issue-id-or-key

Issue key. Passed as the `issueIdOrKey` parameter to the Atlassian MCP tools.

### fields

Object of field updates

## Protocol

1. Call `editJiraIssue { cloud-id, issue-id-or-key, fields }`.
