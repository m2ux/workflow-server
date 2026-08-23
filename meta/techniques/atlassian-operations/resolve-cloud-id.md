---
metadata:
  version: 1.0.0
---

## Capability

Obtain the Atlassian cloud id for the target site.

## Outputs

### cloudId

UUID of the cloud site, used by every product-specific tool

## Protocol

1. Call `getAccessibleAtlassianResources` and use the first `{cloudId}` returned, or the one matching the user's site. If the call is rejected for lack of permission, verify Jira/Confluence permissions and project roles.

   `atlassian-operations.resolve-cloud-id-once` carries the ordering obligation: this operation runs once per session and every product-specific operation consumes the `{cloudId}` it caches.
