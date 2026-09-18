---
metadata:
  version: 1.1.0
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

1. Read `gitnexus://repo/{repo_name}/schema` for the node labels the target language carries and the property recording visibility. A TypeScript tree records `isExported` on a `Function`; another language names both differently, and a property the schema does not hold matches nothing while reading as a filter that found nothing.
2. Compose `{cypher_query}` to match the labels the schema declares, keep the symbols `{change_report}` names, filter to the visible ones, and return each with its file — `MATCH (f:Function) WHERE f.name IN [<the changed names>] AND f.isExported = true RETURN f.name AS symbol_name, f.filePath AS file_path` over a TypeScript tree.
   > Where the schema records no visibility property, match on the declaration site instead — a symbol an index file re-exports, or one a module's public path reaches — and say in the answer which of the two the filter rested on.
3. Cover every label the changed set spans: a method, a class and a struct each sit under their own label, so a query naming one returns the exported surface of that label alone.
