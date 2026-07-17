---
metadata:
  version: 1.1.1
---

## Capability

Verify `{scope_manifest}` is fully addressed: check every manifest item for file presence, performed action, and content match against the reviewed draft, flagging any unaddressed item.

## Outputs

### total_count

Total number of items in `{scope_manifest}`.

### addressed_count

Number of scope-manifest items confirmed addressed.

### unaddressed_count

Number of scope-manifest items still unaddressed (`{total_count}` − `{addressed_count}`).

## Protocol

### 1. Check Manifest Items

- For every item in `{scope_manifest}`, check file presence, the performed action (create/modify/remove), and a content match against the reviewed draft

### 2. Flag Unaddressed Items

- Flag any item that remains unaddressed
- Set `{total_count}`, `{addressed_count}`, and `{unaddressed_count}` (0 when the manifest is fully addressed)

