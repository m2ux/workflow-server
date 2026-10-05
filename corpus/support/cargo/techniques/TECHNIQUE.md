---
metadata:
  version: 1.7.0
---

## Capability

Resource-constrained techniques for cargo subcommands.

## Inputs

### build_scope

*(optional)* `--workspace` for the full workspace, or `-p <crate>` to scope to one crate.

#### default

`--workspace`

### features

*(optional)* `--features` flags carried into the cargo invocation.

#### default

`''`

### build_budget

*(optional)* The command prefix a compiling cargo invocation carries: the environment caps followed by the nice level.

#### default

`CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} nice -n 19`

### generated_product_skip

*(optional)* The environment assignment that suppresses a project's second build product, composed per generated-product-built-once.

#### default

`''`

## Rules

### resource-budget

Every compiling invocation carries `{build_budget}`, whose caps hold a compile inside a 32 GiB host. That figure is the host floor: raise the caps through the environment on a host above it, and narrow `{build_scope}` to one crate on a host below it.

### generated-product-built-once

Prefix every compiling invocation with `{generated_product_skip}`, unless the invocation's product is the project's second build product, which it then builds.

`{generated_product_skip}` is that suppression: on a Substrate project, whose second product is the runtime wasm blob, it is `SKIP_WASM_BUILD=1`. On a project with no second product it is empty.

### foreground-only

Run every cargo invocation in the foreground, and wait for it. Several foreground shells may run at once. A run that cannot finish in the foreground is recorded as not passed in the technique's status, with the scope attempted in its diagnostics.

### budget-on-compiles-only

An invocation that compiles nothing carries no `{build_budget}`.
