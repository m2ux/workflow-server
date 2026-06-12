---
metadata:
  version: 1.0.0
---

## Capability

Release build; produces the final binary AND the runtime wasm artifact.

## Inputs

### scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate.

### features

Optional `--features` flags (empty string when none).

## Output

### release_artifacts

The optimized release binary for `{scope}` AND the runtime wasm artifact, under the cargo target directory. A failed compile surfaces the rustc errors instead.

## Protocol

1. `nice -n 19 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo build --release {scope} {features}`
   - If the build runs out of memory (release link/LTO plus the nested wasm build together exceed available RAM), halve `CARGO_BUILD_JOBS`; on tight hosts, run `-p <crate>` for the binary first, then a separate workspace pass for the runtime.

## Rules

### keeps-wasm-artifact

This is the ONLY cargo operation that produces the runtime wasm artifact, and the ONLY one that omits `SKIP_WASM_BUILD=1`. Do not "optimise" by adding `SKIP_WASM_BUILD=1` here — the wasm runtime artifact is required for release.
