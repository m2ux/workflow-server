---
metadata:
  version: 1.2.0
---

## Capability

Resource-constrained operations for cargo subcommands.

## Inputs

### build_scope

`--workspace` for the full workspace, or `-p <crate>` to scope to one crate (preferred during inner loops)

### features

Optional `--features` flags (empty string when none)

## Rules

### resource-budget

Every cargo invocation MUST go through a cargo-operations technique. Do NOT call bare `cargo ...` from technique protocols. Budget by what the invocation does:

- **Compile or test** (type-check, lint-with-compile, build, test runners): `nice -n 19`, `CARGO_BUILD_JOBS=\${CARGO_BUILD_JOBS:-4}`, `RUST_TEST_THREADS=\${RUST_TEST_THREADS:-4}` when tests run, and `SKIP_WASM_BUILD=1` on non-release passes — the envelope that prevents host hang on ≤32 GiB hosts. Override caps via env on larger hosts.
- **Format-only** (no rustc): `nice -n 19` alone. Compile-time env caps do not apply and must not appear on the invocation.

Each leaf Protocol states the budget line that matches its invocation class.

### foreground-only

Cargo operations MUST run synchronously in the foreground of the caller. Never invoke them with `run_in_background` inside a worker — when the worker exits, the OS process group is killed and the build is lost (this is what forced the worker re-spawn pattern observed in past runs). If the wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer build_scope=`-p <crate>`. Run `--workspace` once during final validation to match CI.

### multi-op-concurrent-fan-out

When two or more independent cargo process/shell units must run as a concurrent suite (wait-all, ordered gather), use [unit-fan-out](../unit-fan-out.md) for scatter/wait-all/gather with the unit roster, `{dispatch_concurrency}`, and per-unit resource budgets on that contract's inputs, then a pure combine op that folds `{unit_results}` into the product envelope. Cargo technique Protocols do not Apply unit-fan-out or other techniques for that fan-out ([pass-orchestration-in-technique](../../../workflow-design/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique); [Prefer Parallel Independent Work via Formal Fan-Out](../../../workflow-design/resources/design-principles.md#33-prefer-parallel-independent-work-via-formal-fan-out); `prose-based-dispatch-patterns`).
