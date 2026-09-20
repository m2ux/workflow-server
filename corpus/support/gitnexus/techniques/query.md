---
metadata:
  version: 1.5.0
---

## Capability

Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

## Inputs

### search_query

a concept, symptom, or error text (e.g. `'payment validation error'`)

### limit

*(optional)* How many execution flows the answer carries.

### max_symbols

*(optional)* How many symbols each returned flow carries.

## Outputs

### query_report

Three sibling lists — the execution flows the concept ranked into, the symbols those flows run, and the definitions it reached outside any flow. A concept ranking into no flow leaves the first two empty and still fills the third.

#### processes

The execution flows the concept ranked into, each carrying the `summary` that names it end to end, its `priority` as relevance, its `id`, and the `process_type`, `symbol_count` and `step_count` describing its shape. The `summary` is the identifier a flow's ordered trace is addressed by.

#### process_symbols

The symbols those flows run, one flat list joined to its flow by `process_id` and ordered within it by `step_index`. Each carries its `id`, `name`, the `filePath` and `startLine`/`endLine` it sits at, and the `module` it belongs to where the graph holds one.

#### definitions

The files and symbols the concept reached that sit in no flow — files, interfaces, functions, classes, methods, properties and constants alike, the kind naming the first segment of each `id`. Each carries its `id`, `name` and `filePath`.

## Protocol

1. Call `gitnexus_query { query: search_query, limit, max_symbols, repo: repo_name }` to produce the `{query_report}` of grouped execution flows.
   > - If the concept ranked into no flow, read the definitions for the files it reached before broadening the query terms; an empty flow list arrives with those still populated, so it is not an empty answer. Fall back to grep for pure text patterns.
   > - The answer stops at `{limit}` flows and `{max_symbols}` symbols each, and says neither that it stopped nor what it left behind — so raise both where the question is how many rather than which, and report the bounds the answer was taken at.
