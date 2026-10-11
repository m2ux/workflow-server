---
metadata:
  version: 1.0.0
---

## Capability

Authenticated GitHub login for the current `gh` user.

## Outputs

### viewer_login

Login string from `GET /user`.

## Protocol

### 1. Fetch Viewer

1. `gh api user --jq .login`; set `{viewer_login}` to the result.
