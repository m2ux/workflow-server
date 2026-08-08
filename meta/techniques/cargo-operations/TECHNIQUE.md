---
metadata:
  version: 1.4.0
---

## Capability

Resource-constrained operations for cargo subcommands.

## Inputs

### build_scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate (preferred during inner loops)

### features

Optional `--features` flags (empty string when none)

### build_budget

The command prefix a compiling cargo invocation carries, composed per resource-budget.

### generated_product_skip

The environment assignment that suppresses a project's second build product, composed per generated-product-built-once. Empty where the project has no such product.

## Rules

### resource-budget

Every cargo invocation MUST use one of these operations. Do NOT call bare `cargo ...` from technique protocols. Every compiling invocation carries `{build_budget}`, which is what prevents host hang on ≤32 GiB hosts; raise the caps through the environment on larger hosts.

`{build_budget}` is the environment caps followed by the nice level — `CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} nice -n 19` — and two operations extend it for what they compile:

- [test](./test.md) adds `RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}`, bounding test parallelism alongside build parallelism.
- Every compiling operation except [build-release](./build-release.md) prefixes `{generated_product_skip}`, per generated-product-built-once.

### generated-product-built-once

Some projects compile a second product beside the binary, and building it on every check, lint and test costs far more than it returns. Where a project has one, each compiling operation suppresses it and the single operation whose product it is builds it — [build-release](./build-release.md), which interpolates no `{generated_product_skip}` at all.

`{generated_product_skip}` is that suppression: on a Substrate project, whose second product is the runtime wasm blob, it is `SKIP_WASM_BUILD=1`. On a project with no second product it is empty, and these operations read the same with it absent.

### foreground-only

Cargo operations MUST run as foreground shell invocations owned by the caller. Never dispatch them with `run_in_background` inside a worker — when the worker exits, the OS process group is killed and the build is lost. Several foreground shells running concurrently in one caller stay within this rule; backgrounded worker dispatches do not. If the wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer build_scope=`-p <crate>`. Run `--workspace` once during final validation to match CI.

### fmt-uses-only-nice

[fmt-check](./fmt-check.md) and [fmt-fix](./fmt-fix.md) do not compile, so they carry `nice -n 19` alone and read no `{build_budget}`. An env budget on a formatter states a cap nothing spends.
