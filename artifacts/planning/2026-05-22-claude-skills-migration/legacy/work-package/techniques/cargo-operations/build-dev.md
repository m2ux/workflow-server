# build-dev

Workspace dev build; skips the runtime wasm artifact.

## Inputs

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)

## Procedure

- `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo build {scope} {features}`

## Tools

- **shell:** cargo

## Errors

- **out_of_memory** — Cause: Link or codegen step exceeded available RAM · Recovery: Halve CARGO_BUILD_JOBS and retry
