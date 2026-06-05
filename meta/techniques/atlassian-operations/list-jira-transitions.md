---
metadata:
  version: 1.0.0
---

## Capability

Discover available status transitions for an issue.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### issueIdOrKey

Issue key

## Protocol

1. Call `getTransitionsForJiraIssue { cloudId, issueIdOrKey }`.
