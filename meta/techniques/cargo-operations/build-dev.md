---
metadata:
  version: 1.1.0
---

## Capability

Workspace dev build; skips the runtime wasm artifact.

## Outputs

### build_artifacts

The compiled dev binaries/libraries for `{build_scope}` under the cargo target directory (no runtime wasm artifact). A failed compile surfaces the rustc errors instead.

## Protocol

1. `{generated_product_skip} {build_budget} cargo build {build_scope} {features}`
   > If the link or codegen step exceeds available RAM, halve `CARGO_BUILD_JOBS` and retry.
