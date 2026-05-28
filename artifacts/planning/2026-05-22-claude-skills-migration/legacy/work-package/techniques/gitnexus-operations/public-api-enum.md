# public-api-enum

Enumerate exactly the public/exported APIs in the diff that need doc comments — avoids guessing which changed symbols are exported. (finalize-documentation)

## Output

- **public_api_symbols** — the exported symbols present in the diff that require documentation

## Procedure

- Run [detect-changes](detect-changes.md) to obtain the changed-symbol set.
- Run [cypher](cypher.md) with a visibility filter to keep only public/exported symbols from that set.
- Return the filtered set as the doc-comment work list.

## Tools

- **mcp:** gitnexus

## Errors

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
