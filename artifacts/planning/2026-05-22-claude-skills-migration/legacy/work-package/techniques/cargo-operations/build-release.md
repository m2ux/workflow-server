# build-release

Release build; produces the final binary AND the runtime wasm artifact.

## Inputs

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)

## Procedure

- `nice -n 19 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo build --release {scope} {features}`

## Tools

- **shell:** cargo

## Errors

- **out_of_memory** — Cause: Release link/LTO and the nested wasm build together exceeded available RAM · Recovery: Halve CARGO_BUILD_JOBS; on tight hosts, run -p <crate> for the binary first, then a separate workspace pass for the runtime

## Rules

### keeps-wasm-artifact

This is the ONLY cargo operation that produces the runtime wasm artifact, and the ONLY one that omits `SKIP_WASM_BUILD=1`. Do not "optimise" by adding `SKIP_WASM_BUILD=1` here — the wasm runtime artifact is required for release.
