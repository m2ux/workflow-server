---
metadata:
  version: 1.0.0
---

## Capability

Log work time on a Jira issue.

## Inputs

### issue-id-or-key

Issue key. Passed as the `issueIdOrKey` parameter to the Atlassian MCP tools.

### time-spent

e.g., `2h`, `30m`. Passed as the `timeSpent` parameter to the Atlassian MCP tools.

## Protocol

1. Call `addWorklogToJiraIssue { cloud-id, issue-id-or-key, time-spent }`.
