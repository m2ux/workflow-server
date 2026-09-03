---
metadata:
  version: 1.1.0
---

## Capability

Release build; produces the final binary AND the runtime wasm artifact.

## Outputs

### release_artifacts

The optimized release binary for `{build_scope}` AND the runtime wasm artifact, under the cargo target directory. A failed compile surfaces the rustc errors instead.

## Protocol

1. `{build_budget} cargo build --release {build_scope} {features}`
   > If the build runs out of memory (release link/LTO plus the nested wasm build together exceed available RAM), halve `CARGO_BUILD_JOBS`; on tight hosts, run `-p <crate>` for the binary first, then a separate workspace pass for the runtime.

## Rules

### keeps-generated-product

This operation is where a project's second build product is produced, so it carries no suppression for one. Suppressing it here to save time removes the artifact a release exists to deliver.
