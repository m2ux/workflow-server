---
metadata:
  version: 1.0.0
---

## Capability

Discover the fields for a specific issue type in a project.

## Inputs

### project-id-or-key

Project key. Passed as the `projectIdOrKey` parameter to the Atlassian MCP tools.

### issue-type-id

Issue type ID identifying the issue type whose fields to discover. Passed as the `issueTypeId` parameter to the Atlassian MCP tools.

## Protocol

1. Call `getJiraIssueTypeMetaWithFields { cloud-id, project-id-or-key, issue-type-id }`.
