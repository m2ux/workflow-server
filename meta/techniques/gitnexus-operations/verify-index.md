Read the GitNexus index context resource and check freshness for the target repo.

## Inputs

### repo_name

Repository name as known to GitNexus

## Output

### stats

Symbol / relationship / process counts

### stale

Boolean — true if the index is out of date

## Protocol

1. Read the MCP resource `gitnexus://repo/{repo_name}/context`.
2. If stale, apply [analyze](./analyze.md) before proceeding.

## Errors

### index_not_found

**Cause:** No GitNexus index exists for the target repository.

**Recovery:** Apply [analyze](./analyze.md) from the project root, then retry [verify-index](./verify-index.md).

### index_stale

**Cause:** The index is out of date relative to recent code changes.

**Recovery:** Apply [analyze](./analyze.md) to refresh, or apply [analyze](./analyze.md) with `force=true` for a full rebuild.
