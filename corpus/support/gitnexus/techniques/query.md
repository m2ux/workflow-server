---
metadata:
  version: 1.6.0
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

The execution flows the concept ranked into. A flow is named by its `summary` and by nothing else — this answer carries no `name`, where a symbol's context does, so the two are addressed differently for the same kind of value.

##### id

The flow's graph identifier.

##### summary

What names the flow end to end, and the identifier a flow's ordered trace is addressed by.

##### priority

Its relevance to the query.

##### process_type

`intra_community` or `cross_community`.

##### symbol_count

How many symbols the flow runs.

##### step_count

How many steps it runs.

#### process_symbols

The symbols those flows run, one flat list joined to its flow by `process_id` and ordered within it by `step_index`.

##### id

The symbol's graph identifier, its kind naming the first segment.

##### name

The symbol's name.

##### filePath

The file it sits in.

##### startLine

Where it starts.

##### endLine

Where it ends.

##### module

The functional area it belongs to, where the graph holds one.

##### process_id

The flow this entry belongs to.

##### step_index

Its position within that flow.

#### definitions

The files and symbols the concept reached that sit in no flow — files, interfaces, functions, classes, methods, properties and constants alike. A file entry carries the first three fields and no more; a symbol entry carries them all.

##### id

The identifier, its kind naming the first segment.

##### name

The file or symbol name.

##### filePath

The file it sits in, or is.

##### startLine

Where a symbol starts.

##### endLine

Where a symbol ends.

##### module

The functional area a symbol belongs to, where the graph holds one.

## Protocol

### 1. Rank the Concept into Flows

- Call `gitnexus_query { query: search_query, limit, max_symbols, repo: repo_name }` to produce the `{query_report}` of grouped execution flows.
   > - If the concept ranked into no flow, read the definitions for the files it reached before broadening the query terms; an empty flow list arrives with those still populated, so it is not an empty answer. Fall back to grep for pure text patterns.
   > - The answer stops at `{limit}` flows and `{max_symbols}` symbols each, and says neither that it stopped nor what it left behind — so raise both where the question is how many rather than which, and report the bounds the answer was taken at.
