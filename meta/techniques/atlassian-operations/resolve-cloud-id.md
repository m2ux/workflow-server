Obtain the `cloudId` for the target Atlassian site.

## Output

### cloudId

UUID of the cloud site, used by every product-specific tool

## Protocol

1. Call `getAccessibleAtlassianResources` and use the first `cloudId` returned (or the one matching the user's site).

## Errors

### missing_cloud_id

**Cause:** A product-specific Atlassian tool was called without resolving `cloudId` first.

**Recovery:** Apply [resolve-cloud-id](./resolve-cloud-id.md), then retry the original operation with the returned `cloudId`.

### permission_denied

**Cause:** User lacks permission for the requested operation.

**Recovery:** Verify Jira/Confluence permissions and project roles.
