---
metadata:
  version: 1.2.0
---

## Capability

360-degree view of one symbol — callers, callees, and the execution flows it participates in.

## Inputs

### name

the symbol to inspect

### file_path

*(optional)* The file holding the symbol, which separates one of that name from the others.

### symbol_uid

*(optional)* The symbol identity a prior answer carried, which reaches that symbol and no other.

## Outputs

### context_report

incoming calls (callers), outgoing calls (callees), process membership with step positions

#### incoming

The references reaching the symbol, grouped by the kind of edge each carries.

#### outgoing

The references the symbol makes, grouped the same way.

#### processes

The execution flows the symbol participates in. A flow is named by its `name` here, where a ranked query names the same kind of value by its `summary`.

##### id

The flow's graph identifier.

##### name

What names the flow end to end.

##### step_index

The symbol's position within the flow.

##### step_count

How many steps the flow runs.

## Protocol

1. Call `gitnexus_context { name, file_path, uid: symbol_uid, repo: repo_name }` to assemble the `{context_report}` — incoming calls, outgoing calls, and process membership.
   > - If the index is out of date, run `npx gitnexus analyze`, then retry.
   > - Where several symbols carry `{name}`, the answer is the candidates rather than a report. Choose among them by the file each sits in and call again with that candidate's `{symbol_uid}`, or with `{file_path}` where the answer carries no identity.
   > - Where `{name}` resolves to nothing, grep for the symbol: it is unindexed, and the tree the index walked is what `subjects-the-index-holds` bounds.
2. Read the `{context_report}`'s caller fan-out as a blast-radius signal: many callers and broad process participation → the symbol is path-committing; an isolated symbol is low-risk to touch.
