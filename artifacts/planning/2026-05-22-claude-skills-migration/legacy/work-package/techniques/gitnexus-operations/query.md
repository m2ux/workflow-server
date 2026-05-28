# query

Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

## Inputs

- **query** — a concept, symptom, or error text (e.g. `'payment validation error'`)

## Output

- **query_report** — execution flows (processes) grouped, with member symbols and file locations

## Procedure

1. Call `gitnexus_query({query})`.
2. Use the returned processes to orient before deep-diving with [context](context.md) on specific symbols.

## Errors

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **no_results** — Cause: the concept did not match indexed flows · Recovery: broaden the query terms; fall back to grep for pure text patterns
