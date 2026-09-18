---
metadata:
  version: 1.0.0
---

## Capability

Resolve a name or email to a Jira account ID.

## Inputs

### searchString

Name or email to resolve.

## Outputs

### accountId

Account ID the name or email resolved to.

## Protocol

1. Call `lookupJiraAccountId { cloudId, searchString }`; return the resolved `{accountId}`.
