---
metadata:
  version: 1.0.0
---

## Capability

Read the GitNexus index context resource and check freshness for the target repo.

## Inputs

### repo_name

Repository name as known to GitNexus.

## Output

### stats

Symbol / relationship / process counts

### stale

Boolean — true if the index is out of date

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/context` and record the reported {stats} (symbol / relationship / process counts).
   - If no GitNexus index exists for the target repository, apply [analyze](./analyze.md) from the project root, then retry [verify-index](./verify-index.md).
2. If {stale}, apply [analyze](./analyze.md) before proceeding. When the index is out of date relative to recent code changes, apply [analyze](./analyze.md) to refresh, or apply [analyze](./analyze.md) with `force=true` for a full rebuild.
