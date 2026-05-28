---
name: cargo-operations
description: Resource-constrained operations for cargo subcommands.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 24
  legacy_id: 24
---

# Cargo Operations

## Capability

Resource-constrained operations for the cargo subcommands used during the work-package workflow. Each operation is defined in a sibling file; load only the operations a protocol step references.

## Operations

| Operation | Purpose |
|---|---|
| [check](check.md) | Type-check without producing binaries; the cheapest validation pass |
| [test](test.md) | Run tests with bounded test parallelism; prefer nextest when configured |
| [build-dev](build-dev.md) | Workspace dev build; skips the runtime wasm artifact |
| [build-release](build-release.md) | Release build; produces the final binary AND the runtime wasm artifact |
| [clippy](clippy.md) | Lint against all targets, denying warnings |
| [fmt-check](fmt-check.md) | Canonical formatting check; matches CI exactly |
| [fmt-fix](fmt-fix.md) | Apply rustfmt formatting in place |
| [doc](doc.md) | Generate API documentation to verify inline doc comments compile |
| [preflight](preflight.md) | Probe required toolchain prerequisites before any workspace cargo command |
| [run-suite](run-suite.md) | Run check + clippy + test + fmt-check concurrently and aggregate |

## Rules

### resource-budget

Every cargo invocation made by work-package skills MUST use one of these operations. Do NOT call bare `cargo ...` from skill protocols. The inline budget — nice -n 19, CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4}, RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}, SKIP_WASM_BUILD=1 (non-release only) — is what prevents host hang on ≤32 GiB hosts. Override caps via env on larger hosts.

### foreground-only

Cargo operations MUST run synchronously in the foreground of the caller. Never invoke them with run_in_background inside an activity worker — when the worker exits, the OS process group is killed and the build is lost (this is what forced the worker re-spawn pattern observed in past runs). If the activity's wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer scope='-p <crate>'. Run --workspace once at the validate activity to match CI.

### release-builds-keep-wasm

[build-release](build-release.md) is the ONLY operation that produces the runtime wasm artifact and is therefore the ONLY operation that omits SKIP_WASM_BUILD=1. Do not 'optimise' build-release by adding it.

### prefer-nextest

When cargo nextest is configured for the project (.config/nextest.toml present), the [test](test.md) operation MUST use nextest — it isolates failures into separate processes, giving lower peak RAM and clearer reporting.

### fmt-uses-only-nice

[fmt-check](fmt-check.md) and [fmt-fix](fmt-fix.md) do not compile, so only nice -n 19 applies; do not paste the full env budget there — it is misleading.
