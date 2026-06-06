---
metadata:
  version: 1.0.0
---

## Capability

Log work time on a Jira issue.

## Inputs

### issueIdOrKey

Issue key

### timeSpent

e.g., `2h`, `30m`

## Protocol

1. Call `addWorklogToJiraIssue { cloudId, issueIdOrKey, timeSpent }`.
