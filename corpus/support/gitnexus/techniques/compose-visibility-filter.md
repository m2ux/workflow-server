---
metadata:
  version: 1.0.0
---

## Capability

Compose the graph query that keeps, from a changed-symbol set, only the symbols a consumer outside the module can reach.

## Inputs

### change_report

changed symbols, changed files, affected execution flows, risk level

## Outputs

### cypher_query

A query naming the changed symbols and filtering them to the exported surface.

## Protocol

1. Read `gitnexus://repo/{repo_name}/schema` for the node labels the target language carries and the property that records visibility — the label set differs by language, and a property the schema does not hold matches nothing while reading as a filter that found nothing.
2. Compose `{cypher_query}` to match the symbols `{change_report}` names, keep those the schema marks exported or public, and return each with its file and kind.
   > Where the schema records no visibility property, match on the declaration site instead — a symbol an index file re-exports, or one a module's public path reaches — and say in the answer which of the two the filter rested on.
