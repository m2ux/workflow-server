---
metadata:
  version: 1.0.0
---

## Capability

Update fields on an existing Jira issue.

## Inputs

### issueIdOrKey

Issue key

### fields

Object of field updates

## Protocol

1. Call `editJiraIssue { cloudId, issueIdOrKey, fields }`.
