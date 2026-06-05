---
metadata:
  version: 1.0.0
---

## Capability

Resolve a name or email to a Jira account ID.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### searchString

Name or email to resolve

## Protocol

1. Call `lookupJiraAccountId { cloudId, searchString }`.
