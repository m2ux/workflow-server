---
metadata:
  version: 1.1.0
---

## Capability

Read a single Jira issue.

## Inputs

### issueIdOrKey

Issue key.

## Outputs

### issue_record

The issue as a JSON object — fields, type, labels, and body as the API returns them.

## Protocol

1. Call `getJiraIssue { cloudId, issueIdOrKey }`; return the response as `{issue_record}`.
