---
metadata:
  version: 1.1.0
---

## Capability

Enumerate exactly the public/exported APIs in the diff that need doc comments — avoids guessing which changed symbols are exported.

## Inputs

### repo_name

Optional. Name of the indexed graph to address, as [resolve-graph](./resolve-graph.md) reports it. Omit only where exactly one graph is indexed.

### diff

The working-tree / branch diff under review — source for obtaining the changed-symbol set.

## Outputs

### public_api_symbols

the exported symbols present in the diff that require documentation

## Protocol

1. Apply [detect-changes](./detect-changes.md) against `{repo_name}` to obtain the changed-symbol set.
   - If the index is out of date, run `npx gitnexus analyze` and then retry.
2. Apply [cypher](./cypher.md) against `{repo_name}` with a visibility filter to keep only public/exported symbols from that set.
3. Return the filtered set as `{public_api_symbols}` — the doc-comment work list.
