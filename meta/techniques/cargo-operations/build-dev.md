---
metadata:
  version: 1.0.0
---

## Capability

Workspace dev build; skips the runtime wasm artifact.

## Inputs

### scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate (inherited from the [cargo-operations](./TECHNIQUE.md) group root; declared here as the binding contract).

### features

Optional `--features` flags (empty string when none); inherited from the [cargo-operations](./TECHNIQUE.md) group root.

## Output

### build_artifacts

The compiled dev binaries/libraries for `{scope}` under the cargo target directory (no runtime wasm artifact). A failed compile surfaces the rustc errors instead.

## Protocol

1. `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo build {scope} {features}`
   - If the link or codegen step exceeds available RAM, halve `CARGO_BUILD_JOBS` and retry.
