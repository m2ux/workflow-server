---
metadata:
  version: 1.0.0
---

## Capability

List issue types available in a project.

## Inputs

### project-id-or-key

Project key (e.g., `ENG`). Passed as the `projectIdOrKey` parameter to the Atlassian MCP tools.

## Protocol

1. Call `getJiraProjectIssueTypesMetadata { cloud-id, project-id-or-key }`.
