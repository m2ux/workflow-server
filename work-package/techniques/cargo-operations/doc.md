---
metadata:
  version: 1.0.0
---

## Capability

Generate API documentation to verify inline doc comments compile.

## Inputs

### scope

`'--workspace --no-deps'` for the full workspace, or `'-p <crate> --no-deps'` to scope

## Protocol

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo doc {scope}`
   - If rustdoc reports a broken intra-doc link, fix the link target or remove the broken reference.
