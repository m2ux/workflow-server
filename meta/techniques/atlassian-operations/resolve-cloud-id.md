---
metadata:
  version: 1.0.0
---

## Capability

Obtain the `{cloudId}` for the target Atlassian site.

## Outputs

### cloudId

UUID of the cloud site, used by every product-specific tool

## Protocol

1. Call `getAccessibleAtlassianResources` and use the first `{cloudId}` returned (or the one matching the user's site). This step must run before any product-specific Atlassian tool; if such a tool was called without a resolved `{cloudId}`, apply [resolve-cloud-id](./resolve-cloud-id.md) and retry the original operation with the returned `{cloudId}`. If the call is rejected for lack of permission, verify Jira/Confluence permissions and project roles.
