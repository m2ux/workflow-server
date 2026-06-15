---
metadata:
  version: 1.0.0
---

## Capability

Generate API documentation to verify inline doc comments compile.

## Inputs

### build_scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate.

## Outputs

### doc_artifacts

The generated rustdoc HTML for `{build_scope}` under the cargo target directory; the run doubles as a verification that inline doc comments and intra-doc links compile. A broken intra-doc link surfaces the rustdoc error instead.

## Protocol

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo doc {build_scope}`
   - If rustdoc reports a broken intra-doc link, fix the link target or remove the broken reference.
