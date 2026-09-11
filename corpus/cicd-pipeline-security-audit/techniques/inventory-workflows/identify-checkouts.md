---
metadata:
  version: 1.0.0
---

## Capability

Identify checkout patterns and their `ref:` parameters per workflow, flagging any checkout of PR head SHA, `head.ref`, or merge commit.

## Protocol

### 1. Identify Checkouts

- Find all `actions/checkout` uses and their `ref:` values, flagging any checkout of PR head SHA, `head.ref`, or merge commit.
