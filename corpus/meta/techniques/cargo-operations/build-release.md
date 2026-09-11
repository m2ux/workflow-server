---
metadata:
  version: 1.2.0
---

## Capability

Release build; produces the final binary AND the runtime wasm artifact.

## Outputs

### release_artifacts

The optimized release binary for `{build_scope}` AND the runtime wasm artifact, under the cargo target directory. A failed compile surfaces the rustc errors instead.

## Protocol

1. `{build_budget} cargo build --release {build_scope} {features}`
   > - When the build runs out of memory — release link/LTO and the nested second-product build peak together — halve `CARGO_BUILD_JOBS` and retry.
   > - Below the host floor [resource-budget](./TECHNIQUE.md#resource-budget) names, run `-p <crate>` for the binary first, then a separate workspace pass for the second product.
