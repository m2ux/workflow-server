---
metadata:
  version: 2.0.0
---

## Capability

Multi-file rename driven by the call graph, reporting the edit list or writing it.

## Inputs

### symbol_name

Current symbol name.

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

- Call `gitnexus_rename { symbol_name, new_name, file_path, dry_run, repo: repo_name }` and record the `{changes}` it returns.
   > Where several symbols carry `{symbol_name}`, name the file holding the one meant in `{file_path}`; a rename addressed at a name two symbols answer to reaches both.

### 2. Read Each Edit's Provenance

- Read each edit's confidence as its provenance: a `graph` edit follows an edge the parser read, and a `text_search` edit follows a name match, which reaches a string literal and a comment as readily as a reference.
