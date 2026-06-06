---
metadata:
  version: 1.0.0
---

## Capability

Obtain the `cloud-id` for the target Atlassian site.

## Output

### cloud-id

UUID of the cloud site, used by every product-specific tool

## Protocol

1. Call `getAccessibleAtlassianResources` and use the first `cloud-id` returned (or the one matching the user's site). This step must run before any product-specific Atlassian tool; if such a tool was called without a resolved `cloud-id`, apply [resolve-cloud-id](./resolve-cloud-id.md) and retry the original operation with the returned `cloud-id`. If the call is rejected for lack of permission, verify Jira/Confluence permissions and project roles.
