---
metadata:
  version: 1.0.0
---

## Capability

Discover available status transitions for an issue.

## Inputs

### issue-id-or-key

Issue key. Passed as the `issueIdOrKey` parameter to the Atlassian MCP tools.

## Protocol

1. Call `getTransitionsForJiraIssue { cloud-id, issue-id-or-key }`.
