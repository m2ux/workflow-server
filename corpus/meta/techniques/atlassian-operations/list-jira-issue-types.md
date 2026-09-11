---
metadata:
  version: 1.0.0
---

## Capability

List issue types available in a project.

## Inputs

### projectIdOrKey

Project key (e.g., `ENG`).

## Outputs

### project_issue_types

Issue types the project admits, one entry per type.

## Protocol

1. Call `getJiraProjectIssueTypesMetadata { cloudId, projectIdOrKey }`; return the listing as `{project_issue_types}`.
