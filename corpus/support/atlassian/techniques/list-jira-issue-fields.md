---
metadata:
  version: 1.0.0
---

## Capability

Discover the fields for a specific issue type in a project.

## Inputs

### projectIdOrKey

Project key.

### issueTypeId

Issue type ID identifying the issue type whose fields to discover.

## Outputs

### issue_type_fields

Fields the project defines for the issue type, one entry per field.

## Protocol

1. Call `getJiraIssueTypeMetaWithFields { cloudId, projectIdOrKey, issueTypeId }`; return the field metadata as `{issue_type_fields}`.
