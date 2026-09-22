---
metadata:
  version: 1.3.0
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

### 1. Settle the Visibility Property

- Read `gitnexus://repo/{repo_name}/schema` for the node labels the target language carries, and settle the visibility property by querying it rather than by reading it there. The schema lists the properties the parser can record, which is a wider set than any one graph holds: it names `visibility` on a `Function` where a TypeScript tree holds `isExported` and no `visibility` at all.
- Confirm the property before the filter rests on it — `MATCH (f:Function) WHERE f.isExported = true RETURN count(f)` answers with a count where the graph holds it and `Binder exception: Cannot find property isExported` where it does not. A filter composed against a property the graph lacks fails the whole query, so the error names the mistake rather than returning an empty set that reads as a finding.

### 2. Compose the Query

- Compose `{cypher_query}` to match the labels the schema declares, keep the symbols `{change_report}` names, filter to the visible ones, and return each with its file — `MATCH (f:Function) WHERE f.name IN [<the changed names>] AND f.isExported = true RETURN f.name AS symbol_name, f.filePath AS file_path` over a TypeScript tree.
   > Where no property records visibility, match on the declaration site instead — a symbol an index file re-exports, or one a module's public path reaches — and say in the answer which of the two the filter rested on.
- Cover every label the changed set spans that carries a visibility property — a method, a class and a struct each sit under their own label, so a query naming one returns that label's exported surface alone. A documentation heading carries none, so a set of headings composes over the code labels beside them.
