---
name: cargo-operations
description: Resource-constrained operations for cargo subcommands.
metadata:
  ontology: legacy
  kind: skill
  version: 1.1.0
  order: 24
  legacy_id: 24
---

# Cargo Operations

## Capability

Resource-constrained operations for the cargo subcommands used during the work-package workflow

## Operations

### check

**Description:** Type-check without producing binaries; the cheapest validation pass

**Inputs:**

- **scope** — `'--workspace'` for the full workspace, or `'-p <crate>'` to scope to one crate (preferred during inner loops)
- **features** — Optional --features flags (empty string when none)

**Output:**

- **check_status** — Pass/fail and the rustc diagnostics emitted

**Procedure:**

- `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo check {scope} {features}`

**Tools:**

- **shell:** cargo

**Errors:**

- **out_of_memory** — Cause: Compile peaked above available RAM even with the budget · Recovery: Halve CARGO_BUILD_JOBS (export CARGO_BUILD_JOBS=2) and retry; if still failing, narrow scope to -p <crate>
- **compile_error** — Cause: Type-check failed in the source · Recovery: Address the rustc errors and retry

### test

**Description:** Run tests with bounded test parallelism; prefer nextest when configured

**Inputs:**

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)
- **test_filter** — Optional test name filter (e.g., 'test_foo' or '--test integration'); empty string when none

**Output:**

- **test_status** — Pass/fail summary
- **failures** — Per-test failure detail when any failed

**Procedure:**

- If cargo nextest is configured (.config/nextest.toml present in the project): `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo nextest run {scope} {features} --test-threads=${RUST_TEST_THREADS:-4} {test_filter}`
- Otherwise: `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo test {scope} {features} {test_filter} -- --test-threads=${RUST_TEST_THREADS:-4}`

**Tools:**

- **shell:** cargo

**Errors:**

- **out_of_memory** — Cause: Test compile or test runtime peaked above available RAM · Recovery: Halve CARGO_BUILD_JOBS and RUST_TEST_THREADS and retry; consider nextest for lower per-test peak
- **test_failure** — Cause: One or more tests failed · Recovery: Investigate the reported failure; do not mask via --no-fail-fast

### build-dev

**Description:** Workspace dev build; skips the runtime wasm artifact

**Inputs:**

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)

**Procedure:**

- `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo build {scope} {features}`

**Tools:**

- **shell:** cargo

**Errors:**

- **out_of_memory** — Cause: Link or codegen step exceeded available RAM · Recovery: Halve CARGO_BUILD_JOBS and retry

### build-release

**Description:** Release build; produces the final binary AND the runtime wasm artifact

**Inputs:**

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)

**Procedure:**

- Do NOT set SKIP_WASM_BUILD here — the wasm runtime artifact is required for release
- `nice -n 19 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo build --release {scope} {features}`

**Tools:**

- **shell:** cargo

**Errors:**

- **out_of_memory** — Cause: Release link/LTO and the nested wasm build together exceeded available RAM · Recovery: Halve CARGO_BUILD_JOBS; on tight hosts, run -p <crate> for the binary first, then a separate workspace pass for the runtime

### clippy

**Description:** Run the linter against all targets, denying warnings

**Inputs:**

- **scope** — `'--workspace'` or `'-p <crate>'`
- **features** — Optional --features flags (empty string when none)

**Output:**

- **clippy_status** — { passed: boolean } — true when no denied warnings emitted
- **lint_diagnostics** — Captured stdout/stderr (used by validate-build::analyze-failure)

**Procedure:**

- `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo clippy {scope} --all-targets {features} -- -D warnings`

**Tools:**

- **shell:** cargo

**Errors:**

- **lint_violations** — Cause: clippy emitted denied warnings · Recovery: Address the diagnostics; do not blanket-allow without justification

### fmt-check

**Description:** Canonical formatting check; matches CI exactly. Does not compile, so does not need build-jobs caps

**Inputs:**

- **scope** — `'--all'` for the full workspace (default and CI parity), or omit for the local crate

**Output:**

- **fmt_status** — { passed: boolean } — true when no formatting diffs
- **fmt_diff_summary** — Concise summary of files needing formatting (when not passed)

**Procedure:**

- `nice -n 19 cargo fmt {scope} -- --check`

**Tools:**

- **shell:** cargo

**Errors:**

- **formatting_diffs** — Cause: Source files do not match rustfmt configuration · Recovery: Run cargo-operations::fmt-fix to apply formatting, then commit the result

### fmt-fix

**Description:** Apply rustfmt formatting in place

**Inputs:**

- **scope** — `'--all'` for the full workspace, or omit for the local crate

**Procedure:**

- `nice -n 19 cargo fmt {scope}`

**Tools:**

- **shell:** cargo

### doc

**Description:** Generate API documentation to verify inline doc comments compile

**Inputs:**

- **scope** — `'--workspace --no-deps'` for the full workspace, or `'-p <crate> --no-deps'` to scope

**Procedure:**

- `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo doc {scope}`

**Tools:**

- **shell:** cargo

**Errors:**

- **broken_doc_link** — Cause: rustdoc detected a broken intra-doc link · Recovery: Fix the link target or remove the broken reference

### preflight

**Description:** Probe required toolchain prerequisites before running any workspace cargo command. Surfaces missing system dependencies (protoc, openssl headers, pkg-config, ...) as a structured environment finding so the validate activity fails fast rather than mid-workspace-compile.

**Output:**

- **missing_prerequisites** — Array of {name, install_hint} for any unmet prerequisite. Empty array when all prerequisites are present.

**Procedure:**

- Inspect target_path for build-script signals indicating system-dependency requirements. Common: protoc (libp2p / litep2p crates), libssl-dev / openssl headers (openssl-sys), pkg-config. Walk Cargo.toml and any build.rs files for these crates.
- For each candidate, probe via 'which <name>' and (where applicable) 'pkg-config --exists <name>'. Collect any unresolved entries with a one-line install_hint (e.g., 'apt-get install -y protobuf-compiler' for protoc).
- Return missing_prerequisites. Do NOT attempt installation — environment changes always require user consent.

**Tools:**

- **shell:** which, pkg-config

**Errors:**

- **missing_prerequisite** — Cause: A required toolchain component is not installed · Recovery: Surface missing_prerequisites to the user as an environment finding via the activity's validate action; do not auto-install

### run-suite

**Description:** Run check, clippy, test, and fmt-check concurrently against the same scope and aggregate their statuses into a single validation_results envelope. Replaces the four serial validate-class operations and is the canonical entry point for the validate activity on rust-substrate projects.

**Inputs:**

- **scope** — `'--workspace'` for full validation parity with CI; `'-p <crate>'` to scope to one crate (faster but does not match CI)
- **features** — Optional --features flags (empty string when none)

**Output:**

- **validation_results** — { check_status, clippy_status, test_status, fmt_status, validation_passed } — validation_passed is true iff all four sub-statuses passed

**Procedure:**

- Fan out four concurrent shells invoking cargo-operations::check, ::clippy, ::test, and ::fmt-check against the same {scope}. Each carries its own resource budget (nice -n 19 + CARGO_BUILD_JOBS cap), so suite peak memory is bounded by the per-op cap, NOT by 4× a single op (fmt-check uses no compile budget at all).
- Wait for ALL four to finish before composing results. Do NOT short-circuit on the first failure — collect every per-op status and diagnostics so a single pass surfaces every issue rather than forcing serial discovery.
- Compose validation_results = { check_status, clippy_status, test_status, fmt_status, validation_passed: check_status.passed AND clippy_status.passed AND test_status.passed AND fmt_status.passed }.

**Tools:**

- **shell:** cargo

**Errors:**

- **out_of_memory** — Cause: Combined peak of concurrent cargo invocations exceeded available RAM despite per-op budgets · Recovery: Halve CARGO_BUILD_JOBS for all (export CARGO_BUILD_JOBS=2) and retry. On very tight hosts, fall back to running check/clippy/test sequentially via the per-op operations.

## Rules

### resource-budget

Every cargo invocation made by work-package skills MUST use one of these operations. Do NOT call bare `cargo ...` from skill protocols. The inline budget — nice -n 19, CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4}, RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}, SKIP_WASM_BUILD=1 (non-release only) — is what prevents host hang on ≤32 GiB hosts. Override caps via env on larger hosts.

### foreground-only

Cargo operations MUST run synchronously in the foreground of the caller. Never invoke them with run_in_background inside an activity worker — when the worker exits, the OS process group is killed and the build is lost (this is what forced the worker re-spawn pattern observed in past runs). If the activity's wall-clock budget cannot accommodate a foreground run, the orchestrator (not the worker) owns the invocation; spawn a new worker only AFTER the cargo result is in hand.

### scope-narrow-then-wide

During inner loops (TDD red/green in implement-task) prefer scope='-p <crate>'. Run --workspace once at the validate activity to match CI.

### release-builds-keep-wasm

build-release is the ONLY operation that produces the runtime wasm artifact and is therefore the ONLY operation that omits SKIP_WASM_BUILD=1. Do not 'optimise' build-release by adding it.

### prefer-nextest

When cargo nextest is configured for the project (.config/nextest.toml present), the test operation MUST use nextest — it isolates failures into separate processes, giving lower peak RAM and clearer reporting.

### fmt-uses-only-nice

fmt-check and fmt-fix do not compile, so only nice -n 19 applies; do not paste the full env budget there — it is misleading.
