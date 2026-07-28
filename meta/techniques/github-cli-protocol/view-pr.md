---
metadata:
  version: 1.1.0
---

## Capability

View an existing PR (read-only — safe via `gh` CLI).

## Inputs

### pr_identifier

PR number or URL

### fields

*(optional)* Comma-separated `gh` field names to return. Default `number,title,body,state,isDraft,url,headRefName,baseRefName,author,labels`.

## Protocol

1. `gh pr view {pr_identifier} --json {fields}` per [json-on-single-item-views](./TECHNIQUE.md#json-on-single-item-views).
