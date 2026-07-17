---
metadata:
  version: 1.0.0
---

## Capability

Verify `{scope_manifest}` is fully addressed before commit: check every manifest item for file presence, performed action, and content match against the reviewed draft, flagging any unaddressed item.

## Outputs

### total_count

Total number of items in `{scope_manifest}`. Interpolated into the scope-verified checkpoint message.

### addressed_count

Number of scope-manifest items confirmed addressed. Interpolated into the scope-verified checkpoint message.

### unaddressed_count

Number of scope-manifest items still unaddressed (`{total_count}` − `{addressed_count}`). Gates the scope-verified checkpoint — presented only when greater than zero.

## Protocol

### 1. Check Manifest Items

- For every item in `{scope_manifest}`, check file presence, the performed action (create/modify/remove), and a content match against the reviewed draft

### 2. Flag Unaddressed Items

- Flag any item that remains unaddressed

### 3. Set Unaddressed Count

- Set `{unaddressed_count}` to the count of unaddressed items (0 when the manifest is fully addressed)
