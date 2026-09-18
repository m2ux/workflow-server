---
metadata:
  version: 2.0.1
---

## Capability

Ensure public/exported APIs in the diff carry inline documentation.

## Inputs

### public_api_symbols

The exported symbols in the diff that require documentation — the doc-comment work list.

## Outputs

### documented_apis

The public/exported APIs in the diff, each carrying inline documentation (doc comments).

## Protocol

### 1. Verify Documentation Coverage

- Verify each symbol of `{public_api_symbols}` carries inline documentation (doc comments).

### 2. Add Missing Comments

- Add the missing doc comments where absent, and emit the covered set as `{documented_apis}`.

### 3. Verify Documentation Builds

- Verify the documentation builds — on Rust/Substrate through [cargo](/cargo/techniques/TECHNIQUE.md)::[doc](/cargo/techniques/doc.md)(*scope*=`--workspace --no-deps`), on other project types through that project's equivalent doc command.