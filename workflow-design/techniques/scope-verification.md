---
metadata:
  version: 1.0.0
---

## Capability

Verify the scope manifest is fully addressed before commit: check every manifest item for file presence, performed action, and content match against the reviewed draft, flagging any unaddressed item.

## Protocol

### 1. Verify Scope Manifest

- For every item in the scope manifest, check file presence, the performed action (create/modify/remove), and a content match against the reviewed draft
- Flag any item that remains unaddressed
