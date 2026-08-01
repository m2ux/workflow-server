---
metadata:
  version: 2.1.0
---

## Capability

View an existing issue via REST.

## Inputs

### owner

Repo owner.

### repo

Repo name.

### number

Issue number.

### jq

*(optional)* `gh api --jq` expression selecting fields from the issue object. Default: full issue JSON.

## Outputs

### issue_record

The issue as a JSON object (full body, or the `{jq}` projection).

## Protocol

1. `gh api repos/{owner}/{repo}/issues/{number}` with `--jq {jq}` when `{jq}` is set; return the parsed object as `{issue_record}`.
