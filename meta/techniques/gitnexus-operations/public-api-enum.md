---
metadata:
  version: 1.0.0
---

## Capability

Enumerate exactly the public/exported APIs in the diff that need doc comments — avoids guessing which changed symbols are exported.

## Inputs

### repo_name

Name of the indexed repository whose graph the operations query (the `{name}` in `gitnexus://repo/{name}/context`). Index freshness is confirmed via this name before the first operation.

### diff

The working-tree / branch diff under review, consumed by [detect-changes](./detect-changes.md) to obtain the changed-symbol set.

## Outputs

### public_api_symbols

the exported symbols present in the diff that require documentation

## Protocol

1. Apply [detect-changes](./detect-changes.md) to obtain the changed-symbol set.
   - If the index is out of date, run `npx gitnexus analyze` and then retry.
2. Apply [cypher](./cypher.md) with a visibility filter to keep only public/exported symbols from that set.
3. Return the filtered set as `{public_api_symbols}` — the doc-comment work list.
