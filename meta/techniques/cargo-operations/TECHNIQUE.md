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

## Rules

### resource-budget

Every cargo invocation MUST use one of these operations. Do NOT call bare `cargo ...` from technique protocols. Every compiling invocation carries `{build_budget}`, which is what prevents host hang on ≤32 GiB hosts; raise the caps through the environment on larger hosts.

`{build_budget}` is the environment caps followed by the nice level — `CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} nice -n 19` — and two operations extend it for what they compile:

- [test](./test.md) adds `RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}`, bounding test parallelism alongside build parallelism.
- Every compiling operation except [build-release](./build-release.md) adds whatever assignment suppresses a generated build product the project carries, per generated-product-built-once.

### generated-product-built-once

Some projects compile a second product beside the binary — a Substrate runtime's wasm blob is the common case — and building it on every check, lint and test costs far more than it returns. Where a project has one, suppress it on each compiling operation and let the single operation whose product it is build it: on a Substrate project the assignment is `SKIP_WASM_BUILD=1` and the operation that keeps the product is [build-release](./build-release.md). A project with no such product adds nothing, and these operations are unchanged by its absence.

### foreground-only

Cargo operations MUST run as foreground shell invocations owned by the caller. Never dispatch them with `run_in_background` inside a worker — when the worker exits, the OS process group is killed and the build is lost. Several foreground shells running concurrently in one caller stay within this rule; backgrounded worker dispatches do not. If the wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer build_scope=`-p <crate>`. Run `--workspace` once during final validation to match CI.

### fmt-uses-only-nice

[fmt-check](./fmt-check.md) and [fmt-fix](./fmt-fix.md) do not compile, so they carry `nice -n 19` alone and read no `{build_budget}`. An env budget on a formatter states a cap nothing spends.
