---
metadata:
  version: 1.5.0
---

## Capability

Resource-constrained operations for cargo subcommands.

## Inputs

### build_scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate (preferred during inner loops)

### features

*(optional)* `--features` flags carried into the cargo invocation.

#### default

`''`

### build_budget

The command prefix a compiling cargo invocation carries, composed per resource-budget.

### generated_product_skip

*(optional)* The environment assignment that suppresses a project's second build product, composed per generated-product-built-once.

#### default

`''`

## Rules

### resource-budget

Every cargo invocation MUST use one of these operations. Do NOT call bare `cargo ...` from technique protocols. Every compiling invocation carries `{build_budget}`, whose caps hold a compile inside a 32 GiB host. That figure is the floor these operations are tuned against: raise the caps through the environment on a host above it, and narrow `{build_scope}` to one crate on a host below it.

`{build_budget}` is the environment caps followed by the nice level — `CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} nice -n 19` — and two operations extend it for what they compile:

- [test](./test.md) adds `RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}`, bounding test parallelism alongside build parallelism.
- Every compiling operation except [build-release](./build-release.md) prefixes `{generated_product_skip}`, per generated-product-built-once.

### generated-product-built-once

Some projects compile a second product beside the binary, and building it on every check, lint and test costs far more than it returns. Where a project has one, each compiling operation suppresses it and the single operation whose product it is builds it — [build-release](./build-release.md), which interpolates no `{generated_product_skip}` at all.

`{generated_product_skip}` is that suppression: on a Substrate project, whose second product is the runtime wasm blob, it is `SKIP_WASM_BUILD=1`. On a project with no second product it is empty, and these operations read the same with it absent.

### foreground-only

Run every cargo operation as a foreground shell invocation, and wait for it. A backgrounded invocation dies with the context that spawned it, taking the build with it, so its result is unreadable to whoever asked for it. Running several foreground shells at once is within this rule; backgrounding any of them is not. A run that cannot finish in the foreground is a blocker to surface, carrying the scope that was attempted.

### scope-narrow-then-wide

Prefer `build_scope` = `-p <crate>` while iterating on one crate, and `--workspace` for the validation pass that must match CI.

### fmt-uses-only-nice

[fmt-check](./fmt-check.md) and [fmt-fix](./fmt-fix.md) do not compile, so they carry `nice -n 19` alone and read no `{build_budget}`. An env budget on a formatter states a cap nothing spends.
