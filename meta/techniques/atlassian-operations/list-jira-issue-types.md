---
metadata:
  version: 1.0.0
---

## Capability

List issue types available in a project.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### projectIdOrKey

Project key (e.g., `ENG`)

## Protocol

1. Call `getJiraProjectIssueTypesMetadata { cloudId, projectIdOrKey }`.
