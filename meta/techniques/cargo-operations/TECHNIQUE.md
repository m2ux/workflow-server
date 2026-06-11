---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 24
  legacy_id: 24
---

# Cargo Operations

## Capability

Resource-constrained operations for cargo subcommands.

## Inputs

### scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate (preferred during inner loops)

### features

Optional `--features` flags (empty string when none)

## Rules

### resource-budget

Every cargo invocation MUST use one of these operations. Do NOT call bare `cargo ...` from technique protocols. The inline budget — `nice -n 19`, `CARGO_BUILD_JOBS=\${CARGO_BUILD_JOBS:-4}`, `RUST_TEST_THREADS=\${RUST_TEST_THREADS:-4}`, `SKIP_WASM_BUILD=1` (non-release only) — is what prevents host hang on ≤32 GiB hosts. Override caps via env on larger hosts.

### foreground-only

Cargo operations MUST run synchronously in the foreground of the caller. Never invoke them with `run_in_background` inside a worker — when the worker exits, the OS process group is killed and the build is lost (this is what forced the worker re-spawn pattern observed in past runs). If the wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer scope=`-p <crate>`. Run `--workspace` once during final validation to match CI.

### fmt-uses-only-nice

[fmt-check](./fmt-check.md) and [fmt-fix](./fmt-fix.md) do not compile, so only `nice -n 19` applies; do not paste the full env budget there — it is misleading.
