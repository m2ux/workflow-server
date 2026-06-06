---
metadata:
  version: 1.0.0
---

## Capability

Discover the fields for a specific issue type in a project.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### projectIdOrKey

Project key

### issueTypeId

Issue type ID identifying the issue type whose fields to discover

## Protocol

1. Call `getJiraIssueTypeMetaWithFields { cloudId, projectIdOrKey, issueTypeId }`.
