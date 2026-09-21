---
metadata:
  version: 1.0.0
---

## Capability

Get the current user's account ID.

## Outputs

### accountId

Current user's account ID

## Protocol

### 1. Read the Current User

- Call `atlassianUserInfo` and read the current user's `{accountId}` from the response.
