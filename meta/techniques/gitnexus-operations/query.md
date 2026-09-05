---
metadata:
  version: 1.1.0
---

## Capability

Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### search_query

a concept, symptom, or error text (e.g. `'payment validation error'`)

## Outputs

### query_report

execution flows (processes) grouped, with member symbols and file locations

## Protocol

1. Call `gitnexus_query {search_query, repo_name}` to produce the `{query_report}` of grouped execution flows.
   > - If the index is out of date, run `npx gitnexus analyze`, then retry.
   > - If the concept did not match any indexed flows, broaden the query terms; fall back to grep for pure text patterns.
2. Use the processes in the `{query_report}` to orient before deep-diving with [context](./context.md) on specific symbols.
