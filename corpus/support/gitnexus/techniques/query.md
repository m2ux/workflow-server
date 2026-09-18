---
metadata:
  version: 1.2.0
---

## Capability

Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

## Inputs

### search_query

a concept, symptom, or error text (e.g. `'payment validation error'`)

### limit

*(optional)* How many execution flows the answer carries. Five where no value is given.

### max_symbols

*(optional)* How many symbols each returned flow carries. Ten where no value is given.

## Outputs

### query_report

execution flows (processes) grouped, with member symbols and file locations

## Protocol

1. Call `gitnexus_query { query: search_query, limit, max_symbols, repo: repo_name }` to produce the `{query_report}` of grouped execution flows.
   > - If the index is out of date, run `npx gitnexus analyze`, then retry.
   > - If the concept did not match any indexed flows, broaden the query terms; fall back to grep for pure text patterns.
   > - The answer stops at `{limit}` flows and `{max_symbols}` symbols each, and says neither that it stopped nor what it left behind — so raise both where the question is how many rather than which, and report the bounds the answer was taken at.
2. Use the processes in the `{query_report}` to orient before deep-diving with [context](./context.md) on specific symbols.
