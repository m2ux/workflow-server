---
metadata:
  version: 1.0.0
---

## Capability

Ensure public/exported APIs in the diff carry inline documentation.

## Inputs

### public_api_symbols

*(optional)* The exported symbols present in the diff, each with the file and kind the graph records.

### changed_files

The diff's changed files, scoping which public/exported APIs are enumerated for doc-comment coverage.

## Outputs

### documented_apis

The public/exported APIs in the diff, each carrying inline documentation (doc comments).

## Protocol

1. Take `{public_api_symbols}` as the exported surface in the diff that needs doc comments.
   > Where it does not arrive, read `{changed_files}` for exported declarations instead, and say that the work list was derived by reading rather than from the graph.
2. Verify each has inline documentation (doc comments).
3. Add missing doc comments where absent.
4. Verify the documentation builds — on Rust/Substrate through [cargo-operations](/meta/techniques/cargo-operations/TECHNIQUE.md)::[doc](/meta/techniques/cargo-operations/doc.md)(*scope*=`--workspace --no-deps`), on other project types through that project's equivalent doc command.
