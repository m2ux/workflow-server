---
metadata:
  version: 2.1.0
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

### 1. Take The Work List

- Take `{public_api_symbols}` as the exported surface in the diff that needs doc comments.
  > Where it does not arrive, read `{changed_files}` for exported declarations instead, and say that the work list was derived by reading rather than from the graph.

### 2. Verify Documentation Coverage

- Verify each symbol of the work list carries inline documentation (doc comments).

### 3. Add Missing Comments

- Add the missing doc comments where absent, and emit the covered set as `{documented_apis}`.

### 4. Verify Documentation Builds

- Verify the documentation builds — on Rust/Substrate through [cargo](/cargo/techniques/TECHNIQUE.md)::[doc](/cargo/techniques/doc.md)(*scope*=`--workspace --no-deps`), on other project types through that project's equivalent doc command.
