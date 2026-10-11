---
metadata:
  version: 1.10.0
---

## Capability

Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

## Inputs

### search_query

a concept, symptom, or error text (e.g. `'payment validation error'`)

### task_context

*(optional)* What the work the search serves is about, such as `'adding OAuth support'`, which the ranking weighs alongside the terms.

### search_goal

*(optional)* What the search is meant to find, such as `'existing auth validation logic'`, which the ranking weighs alongside the terms.

### limit

*(optional)* How many execution flows the answer carries, from 1 to 100. A value outside that range is rejected rather than clamped.

### max_symbols

*(optional)* How many symbols each returned flow carries, from 1 to 200. A value outside that range is rejected rather than clamped.

### chain_depth

*(optional)* How many `CALLS` hops out from each flow's entry symbol the answer walks, from 0 to 3. Zero carries no chain.

## Outputs

### query_report

Three sibling lists — the execution flows the concept ranked into, the symbols those flows run, and the definitions it reached outside any flow — with the age of the graph that answered. A concept ranking into no flow leaves the first two empty and still fills the third.

#### processes

The execution flows the concept ranked into, each named by its `summary`; this answer carries no `name`, where a symbol's context does.

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

##### routes

The HTTP endpoints the flow serves, each as a `url` and a `method`, present where the flow's entry handles a route.

##### chain

The flow's entry symbol with its callers and callees layered by depth, present where `{chain_depth}` is above zero.

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

##### is_entry_point

Whether this symbol is the flow's entry, present and true on that one entry.

#### definitions

The files and symbols the concept reached that sit in no flow — files, interfaces, functions, classes, methods, properties and constants alike. A file entry carries the first three fields and no more; a symbol entry carries them all. A route whose URL matched carries `handlerSymbolId` and `routes` where the graph joins it to its handler.

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

#### partial

Whether the search itself failed in part, with a `warning` naming how many text indexes errored and were skipped; both keys ride only a degraded answer. The result is then a floor: matches held only by the skipped node types are missing, and the flow list can be empty because the search could not run.

#### staleness

The freshness reading `an-absent-staleness-mapping-is-the-verdict` describes, carried only where the graph trails its tree.

## Protocol

### 1. Rank the Concept into Flows

- Call `gitnexus_query { search_query, task_context, goal: search_goal, limit, max_symbols, chain_depth, repo: repo_name }` to produce the `{query_report}` of grouped execution flows.
   > - Read `{query_report}.partial` before reading an empty flow list as an answer about the code, and take the search again before treating a partial answer as a measurement.
   > - Where the concept ranked into no flow, read the definitions for the files it reached before broadening the terms; fall back to grep for pure text patterns.
   > - The answer stops at `{limit}` flows and `{max_symbols}` symbols each, and says neither that it stopped nor what it left behind — so raise both where the question is how many rather than which, and report the bounds the answer was taken at.
   > - Where `{query_report}.staleness` is carried, it is the age of every reading taken from this answer.
