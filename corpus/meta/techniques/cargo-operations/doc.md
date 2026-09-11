---
metadata:
  version: 1.1.0
---

## Capability

Generate API documentation to verify inline doc comments compile.

## Outputs

### doc_artifacts

The generated rustdoc HTML for `{build_scope}` under the cargo target directory; the run doubles as a verification that inline doc comments and intra-doc links compile. A broken intra-doc link surfaces the rustdoc error instead.

## Protocol

1. `{generated_product_skip} {build_budget} cargo doc {build_scope}`
   > If rustdoc reports a broken intra-doc link, fix the link target or remove the broken reference.
