---
metadata:
  version: 1.0.0
---

## Capability

Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

## Inputs

### query

a concept, symptom, or error text (e.g. `'payment validation error'`)

## Output

### query-report

execution flows (processes) grouped, with member symbols and file locations

## Protocol

1. Call `gitnexus_query {query}` to produce the `query-report` of grouped execution flows.
   - If the index is out of date, run `npx gitnexus analyze`, then retry.
   - If the concept did not match any indexed flows, broaden the query terms; fall back to grep for pure text patterns.
2. Use the processes in the `query-report` to orient before deep-diving with [context](./context.md) on specific symbols.
