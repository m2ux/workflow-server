---
metadata:
  version: 1.0.0
---

## Capability

Read a single Jira issue.

## Inputs

### issue-id-or-key

Issue key. Passed as the `issueIdOrKey` parameter to the Atlassian MCP tools.

## Protocol

1. Call `getJiraIssue { cloud-id, issue-id-or-key }`.
