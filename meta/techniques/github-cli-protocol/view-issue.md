---
metadata:
  version: 2.0.0
---

## Capability

View an existing issue (read-only — safe via `gh` CLI).

## Inputs

### issue_identifier

Issue number or URL

### fields

*(optional)* Comma-separated `gh` field names to return. Default `number,title,body,state,labels,url,author,assignees,createdAt`.

## Outputs

### issue_record

The issue as a JSON object carrying the requested `{fields}`.

## Protocol

1. `gh issue view {issue_identifier} --json {fields}` per [json-on-single-item-views](./TECHNIQUE.md#json-on-single-item-views); return the parsed object as `{issue_record}`.
