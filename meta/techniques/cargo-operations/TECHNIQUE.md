---
metadata:
  version: 1.2.1
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

- **Compile or test** (type-check, lint-with-compile, build, test runners): `nice -n 19`, `CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4}`, `RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}` when tests run, and `SKIP_WASM_BUILD=1` on non-release passes — the envelope that prevents host hang on ≤32 GiB hosts. Override caps via env on larger hosts.
- **Format-only** (no rustc): `nice -n 19` alone. Compile-time env caps do not apply and must not appear on the invocation.

Each leaf Protocol states the budget line that matches its invocation class.

### foreground-only

Cargo operations MUST run as foreground shell invocations owned by the caller. Never dispatch them with `run_in_background` inside a worker — when the worker exits, the OS process group is killed and the build is lost. Concurrent foreground shells in one caller stay within this rule; backgrounded worker dispatches do not. If the wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer build_scope=`-p <crate>`. Run `--workspace` once during final validation to match CI.

### one-invocation-per-leaf

Each cargo leaf Protocol runs one cargo invocation (or pure combine over already-gathered unit outcomes). Multi-op process suites (wait-all, ordered gather) prefer the process-unit pattern activity ([process-unit-fan-out](../../activities/patterns/06-process-unit-fan-out.yaml)); cargo technique Protocols do not Apply multi-op fan-out façades ([pass-orchestration-in-technique](../../../workflow-design/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique); [Prefer Parallel Independent Work via Formal Fan-Out](../../../workflow-design/resources/design-principles.md#34-prefer-parallel-independent-work-via-formal-fan-out)).
