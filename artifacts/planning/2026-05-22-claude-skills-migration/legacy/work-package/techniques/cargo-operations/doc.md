# doc

Generate API documentation to verify inline doc comments compile.

## Inputs

### scope

`'--workspace --no-deps'` for the full workspace, or `'-p <crate> --no-deps'` to scope

## Procedure

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo doc {scope}`

## Errors

### broken_doc_link

**Cause:** rustdoc detected a broken intra-doc link

**Recovery:** Fix the link target or remove the broken reference
