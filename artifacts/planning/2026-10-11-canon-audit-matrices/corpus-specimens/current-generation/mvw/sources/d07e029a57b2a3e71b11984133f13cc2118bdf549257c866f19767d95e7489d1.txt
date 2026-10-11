---
metadata:
  version: 2.3.0
---

## Capability

Multi-file rename driven by the call graph, reporting the edit list or writing it.

## Inputs

### symbol_name

Current symbol name.

### symbol_uid

*(optional)* The symbol identity a prior answer carried, which reaches that symbol and no other.

### new_name

Target symbol name.

### file_path

*(optional)* The file holding the symbol, which separates one of that name from the others.

### dry_run

Whether the call reports the edits it would make rather than making them.

#### default

`true`

## Outputs

### changes

Per-file edit list, each edit carrying the confidence its provenance earns.

## Protocol

### 1. Run the Rename

- Call `gitnexus_rename { symbol_name, symbol_uid, new_name, file_path, dry_run, repo: repo_name }` and record the `{changes}` it returns.
   > - Where several symbols carry `{symbol_name}`, the answer is a status of `ambiguous` with ranked candidates rather than an edit list, `totalCandidates` counting them in full. Choose the one meant and call again with its `{symbol_uid}`, or name the file holding it in `{file_path}`.
   > - Where the graph holds no symbol of that name the answer is an error naming it, carrying no edit list. That error is a refusal; an empty `{changes}` is the different case of a symbol that resolved and moved nothing.

### 2. Read Each Edit's Provenance

- Read each edit's confidence as its provenance: a `graph` edit follows an edge the parser read, a `text_search` edit a name match, which reaches a string literal and a comment as readily as a reference.
