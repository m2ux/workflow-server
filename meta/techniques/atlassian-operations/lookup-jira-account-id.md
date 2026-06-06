---
metadata:
  version: 1.0.0
---

## Capability

Resolve a name or email to a Jira account ID.

## Inputs

### search-string

Name or email to resolve. Passed as the `searchString` parameter to the Atlassian MCP tools.

## Protocol

1. Call `lookupJiraAccountId { cloud-id, search-string }`.
