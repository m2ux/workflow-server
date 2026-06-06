---
metadata:
  version: 1.0.0
---

## Capability

Discover Jira projects with their issue types.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

## Protocol

1. Call `getVisibleJiraProjects { cloudId, searchString? }`.
