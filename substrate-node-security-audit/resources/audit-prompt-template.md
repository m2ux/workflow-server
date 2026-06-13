---
name: audit-prompt-template
description: The full Substrate node security audit prompt template — the authoritative source document for the §1–§5 checklist taxonomy referenced throughout this workflow. The methodology is target-agnostic; target-specific crate assignments, file paths, and calibration data live in target-profile. See audit-template-reference for a section index.
metadata:
  order: 9
  legacy_id: 9
---

# Substrate Node Security Audit - AI Agent Prompt Template

> **Purpose:** This template instructs an AI agent to perform a comprehensive security audit of a Substrate-based blockchain node codebase. It encodes vulnerability classes, static analysis strategies, and manual review patterns derived from professional audit methodology.
>
> **Applicability:** Any Rust/Substrate node with pallets, runtime, RPC layer, off-chain workers, external data source integrations, and client-side tooling.

---

## 1. Audit Setup

### 1.1 Scope Definition

Before beginning, the agent must establish:

| Variable | Description |
|----------|-------------|
| `{REPO}` | Repository path or URL |
| `{COMMIT}` | Target commit hash |
| `{IN_SCOPE}` | List of crate/module paths to audit (e.g., `node/`, `pallets/`, `runtime/`, `primitives/`) |
| `{OUT_OF_SCOPE}` | Exclusions (e.g., pallets under active rewrite, third-party deps, test harnesses) |
| `{OUTPUT_DIR}` | Directory for tool output and report artifacts |

### 1.2 Codebase Reconnaissance

Before detailed review, build a mental model of the system:

1. **Identify all crates** in the workspace (`Cargo.toml` workspace members). **Explicitly list every pallet and primitive crate found.** Do not summarize or group them (e.g., "all pallets"). The agent must acknowledge the existence of `pallets/cnight-observation`, `primitives/ics-observation`, etc., to prevent skipping them later.
2. **Map the architecture:** Which crates are runtime (on-chain/Wasm), which are native (node binary), which are shared primitives, which are off-chain tooling?
3. **Identify trust boundaries:** What data enters the system from external sources (RPC, inherent data, chain specs, config files, databases, file system)? What crosses the native/Wasm boundary?
   - **Rust safety boundary awareness:** Rust's borrow checker prevents data races and memory unsafety, but does NOT prevent: logical races (TOCTOU), deadlocks (same-thread re-lock), semantic errors (wrong value, truncation, silent drops), or API misuse (returning clones instead of references). Do not dismiss concurrency or correctness findings solely because "Rust prevents data races."
4. **Identify consensus-critical paths:** Block production, block verification, inherent data creation/validation, genesis initialization, state transitions
5. **Identify all pallet hooks:** `on_initialize`, `on_finalize`, `on_idle`, `offchain_worker` -- these execute every block and panics here halt the chain
6. **Map data flows using forward/backward tracing:**
   - **Forward tracing (entry → sink):** For each trust boundary entry point (RPC, inherent data, config), trace data forward through transformations, storage writes, and event emissions. Identify where untrusted data first touches consensus-critical state.
   - **Backward tracing (sensitive op → source):** For each sensitive operation (storage writes, weight calculations, key generation, error formatting), trace backward to the data source. If the source is external/untrusted and no validation intervenes, flag as a finding.
   - **Candidate point analysis:** Prioritize review at "candidate points" — locations where code complexity is highest: functions with multiple mutex acquisitions, nested `match` on external data, `unsafe` blocks, error-handling switch points, and codec deserialization sites.
7. **Identify `Send`/`Sync` boundary violations:** Rust's type system prevents data races via `Send`/`Sync` trait bounds. Search for `unsafe impl Send` or `unsafe impl Sync` — these override the compiler's safety analysis and must be manually verified for soundness.
8. **Enumerate critical functions (function registry):** For every crate identified as priority-1 or priority-2 in §5, build an explicit registry of functions that must be read during manual review. This registry is a prerequisite for §3.
   - **For each pallet:** List every hook (`on_initialize`, `on_finalize`, `on_idle`), every `ProvideInherent` method, every `#[pallet::call]` extrinsic, and every internal handler called from hooks or inherents. Read the pallet's `lib.rs` to extract the function list — do not rely on grep to discover them.
   - **For each crate with internal implementation modules:** Crate roots (`lib.rs`, `mod.rs`) often re-export types and delegate to submodules (`versions/`, `impl/`, `internal/`, `common/`). The actual logic lives in submodules. Trace from the public API (trait implementations, exported functions) to the implementation bodies and add those to the registry. **Reading only the crate root is insufficient and a common failure mode.**
   - **For each service/startup module:** List every function called during node initialization (`new_full`, `new_partial`, `run_node`, subcommand handlers). **Include offline subcommand paths** (`check-block`, `export-state`, `revert`, `import-blocks`) — see §3.5 for the recurring genesis divergence pattern.
   - **For each data source or follower crate:** Include the primary data-fetching functions (e.g., `get_utxos_up_to_capacity`, pagination/cursor logic, query builders). These crates sit at trust boundaries and historically contain the densest critical findings — see §3.2 pagination checks and §3.10.
   - **Prioritize reading the largest implementation files.** Sort all in-scope `.rs` files by line count and ensure the top 5-10 files are in the registry and read during manual review — see §5.14 for the coverage gate that enforces this.
   - During manual review (§3), track review status per function: `reviewed`, `skipped (reason)`, or `not-yet-reviewed`. Every function in the registry must reach `reviewed` or `skipped` by the end of the audit. Any function left as `not-yet-reviewed` is a gap.

### 1.3 Setup

```bash
cd {REPO}
git checkout {COMMIT}
cargo check --workspace 2>&1 | tail -20
cargo clippy --version
cargo audit --version   # install via: cargo install cargo-audit
cargo deny --version    # install via: cargo install cargo-deny
cargo geiger --version  # install via: cargo install cargo-geiger
```

### 1.4 Mandatory Ingestion Phase

The approach to code loading depends on the agent's architecture. Three models are supported, in order of preference:

**Model A: Multi-agent orchestration (preferred for agents with delegation capability)**
The orchestrator does NOT need to load the full codebase itself. Instead, it performs reconnaissance (§1.2), builds the file inventory and function registry, and delegates crate-level review to sub-agents. Each sub-agent loads and exhaustively reads all files in its assigned crate. See §5 Multi-Agent Execution Strategy for the full protocol. This model achieves comprehensive coverage without a single large context window.

**Model B: Large-context single agent (≥1M tokens)**
Agents with ≥1M token context windows MUST perform a distinct **Ingestion Step** before any analysis begins:

1.  **List Files:** Run `find {IN_SCOPE} -name "*.rs" -o -name "*.toml" -o -name "*.lock" -o -name "*.json" -o -name "*.sh" | grep -v "target\|test\|mock"` to list all relevant files.
2.  **Batch Read:** Call `read_file` on **EVERY** listed file. Do not rely on grep. Do not skip "boring" files.
3.  **Confirmation:** Output a summary: "Context Loaded: [Count] files, [Total Lines] lines."
4.  **Proceed:** Only after this confirmation may you proceed to Section 2.

With all code in context, the agent can reason about control flow directly, detect pattern-absence bugs without grep, trace data flows across module boundaries, and perform function registry enumeration from loaded code.

**Model C: Small-context single agent (<1M tokens, no delegation)**
These agents must rely on the function registry (§1.2 step 8), grep-led exploration (§2), and targeted file reads. Prioritize depth over breadth: load priority-1 and priority-2 components in full (typically ~25K lines / ~200K tokens) and accept tool-mediated reads for the remainder. All grep limitations (§2 preamble) and AI agent limitations (§5) apply with full force. The coverage gate (§5.14) is especially critical for these agents, as context pressure makes large-file avoidance most severe in this model.

---

## 2. Static Analysis Phase

Run automated tools first to generate leads. All grep commands should target `{IN_SCOPE}` paths and exclude test files (`**/tests.rs`, `**/mock.rs`, `**/test-data/`, `**/benches/`).

> **Critical: Grep is a lead generator, not the analysis.**
>
> Grep and pattern matching find **pattern-presence bugs** — code that contains something it shouldn't (an `unwrap()` in a hook, a fixed seed, a `dbg!()` macro). But the majority of real security findings are **pattern-absence bugs** — code that is *missing* something it should have (a monotonicity check, a storage flush, a cap enforcement, a remove-on-spend, an address validation step). You cannot grep for the absence of a validation. These findings can ONLY be discovered by reading the function body and reasoning about what invariants should hold but don't.
>
> If your audit findings consist exclusively of grep hits (unwrap, expect, panic, unsafe, take_while), your review has not reached sufficient depth. The manual review phase (§3) must be driven by function reading and invariant reasoning, not by grep output triage.

### 2.1 Panic Path Detection

**Rationale:** `unwrap()`, `expect()`, and `panic!()` in production code can crash a node. In pallet hooks or inherent data providers this halts block production. Inside mutex-guarded sections, panics poison the lock permanently.

```bash
cargo clippy --workspace -- \
  -W clippy::unwrap_used \
  -W clippy::expect_used \
  -W clippy::panic \
  -W clippy::arithmetic_side_effects \
  -W clippy::indexing_slicing \
  -W clippy::cast_possible_truncation \
  -W clippy::cast_sign_loss \
  -W clippy::cast_possible_wrap \
  2>&1 | tee {OUTPUT_DIR}/clippy-panic-report.txt

# Supplement with grep (clippy may miss macro-generated code)
grep -rn 'unwrap()\|\.expect(' --include='*.rs' {IN_SCOPE} | grep -v 'test\|mock\|bench'
grep -rn 'panic!' --include='*.rs' {IN_SCOPE} | grep -v 'test\|mock\|bench'
```

**Triage each hit by reachability:**
- **Critical:** Reachable from pallet hooks, inherent data creation, block import, genesis init
- **High:** Reachable from service startup, RPC handlers, CLI subcommands
- **Medium:** Reachable from off-chain tooling or utility functions
- **Informational:** Reachable only from explicitly guarded/impossible paths

**Feature-gate reachability check:** Before assigning severity, verify whether the affected code is behind a `#[cfg(feature = "...")]` gate. If so, check the production binary's `Cargo.toml` dependency chain to confirm the feature is enabled. Code behind a feature that is only enabled in `[dev-dependencies]`, test crates, or off-chain tooling is **not reachable from the production node** and should be triaged as Medium at most (not Critical or High), regardless of the bug's theoretical impact. Note: the code is still a real bug and should be reported — but with severity calibrated to its actual blast radius.

**Specific pattern -- mutex poisoning:** For each panic inside a `lock()` / `write()` critical section, flag as High severity minimum. A poisoned mutex makes the protected resource permanently inaccessible. **Important caveat:** this applies ONLY to `std::sync::Mutex` and `std::sync::RwLock`. Both `parking_lot::Mutex` and `tokio::sync::Mutex` do NOT poison on panic — panics under these locks are still dangerous (they may leave shared state inconsistent) but do not cause cascading lock failures. **Always identify which Mutex implementation is in use before flagging poisoning.**

**Partial mitigation -- `catch_unwind`:** If a panic call site is wrapped in `std::panic::catch_unwind`, the panic is caught and does not crash the process. However: (a) `catch_unwind` only works when `panic = "unwind"` (the default), not `panic = "abort"` -- check `Cargo.toml` profile settings; (b) it does not prevent mutex poisoning (the poison flag is set *before* unwinding); (c) it adds a `UnwindSafe` bound requirement. If `catch_unwind` is present, reduce severity by one level but still report the finding (the mitigation is fragile).

**Specific pattern -- configuration-dependent `Option` unwraps:** For `Option::unwrap()`/`expect()` on values derived from configuration or runtime state, verify that **no valid configuration variant** produces `None`. Check specifically for patterns like `config.path().expect(...)` where a legitimate mode (e.g., in-memory database, development preset) returns `None`. **Validated example:** `database_source.path().expect("db path available")` panics when `DatabaseConfig::InMemory` is used because `path()` returns `None` for in-memory storage. Also check `client.header(parent_hash)?.unwrap()` in inherent data providers — a missing parent header (from pruning, reorg, or DB inconsistency) panics the authoring workflow. Both of these patterns were missed in validated audits despite being in files that were read in full — specifically check late-file code (near the end of large files) and inherent data provider functions for these patterns.

### 2.2 Dependency Vulnerability Scan

```bash
cargo audit 2>&1 | tee {OUTPUT_DIR}/cargo-audit-report.txt
cargo deny check advisories 2>&1 | tee {OUTPUT_DIR}/cargo-deny-advisories.txt
cargo deny check licenses 2>&1 | tee {OUTPUT_DIR}/cargo-deny-licenses.txt
cargo deny check bans 2>&1 | tee {OUTPUT_DIR}/cargo-deny-bans.txt
```

Flag all advisories. Prioritise cryptographic libraries, Wasm runtime dependencies, and serialization libraries (serde, parity-codec, borsh). `cargo deny` provides additional checks beyond `cargo audit`: license compliance, duplicate dependency detection, and custom ban lists for known-problematic crates.

**Fallback when tools cannot be executed (MANDATORY — not optional):** If `cargo audit` or `cargo deny` cannot be run (e.g., in a sandboxed AI agent environment without network access or build tooling), the agent MUST perform ALL of the following steps — skipping them entirely is itself a finding gap. In 4 validated audit sessions, every session skipped these steps entirely, missing an Undetermined-severity finding for vulnerable dependencies.

1. **Read `Cargo.lock`** (or `Cargo.toml` `[workspace.dependencies]` if `Cargo.lock` is not available) and extract all direct and transitive dependency names and versions.
2. **Check high-risk crates (mandatory subset).** For EACH of the following crate categories, identify the specific version used and note the last known advisory:

   | Category | Crates to check |
   |----------|----------------|
   | Crypto | `curve25519-dalek`, `ed25519-dalek`, `ring`, `rustls`, `openssl`, `sha2`, `chacha20` |
   | Serialization | `parity-scale-codec`, `serde`, `borsh`, `bincode`, `midnight-serialize` |
   | Wasm | `wasmtime`, `wasmi` |
   | Networking | `libp2p`, `hyper`, `reqwest`, `tokio` |
   | Database | `sqlx`, `rusqlite` |
   | Logging | `tracing-subscriber`, `log` |

   For each crate found, record: `{name} {version} — {known advisory or "none found"}`

3. **Flag any crate** that has not been updated in over 12 months as a potential staleness risk.
4. If the agent has web access, **actively query** https://rustsec.org/advisories/ for the specific crate versions found.
5. **Include a finding** of severity Undetermined titled "Dependency Audit Not Performed" with the manual inspection results and a recommendation to run `cargo audit` and `cargo deny` in CI.

The absence of automated scanning does not excuse omitting dependency analysis — it increases the importance of manual inspection.

### 2.3 Unsafe Code Detection

```bash
grep -rn 'unsafe' --include='*.rs' {IN_SCOPE} | grep -v 'test\|mock'

# Quantify unsafe usage across the entire dependency tree
cargo geiger --all-features 2>&1 | tee {OUTPUT_DIR}/geiger-report.txt
```

Review each `unsafe` block for soundness, especially in FFI boundaries and host function implementations. For each `unsafe` block, verify:
- The documented safety invariants (look for `// SAFETY:` comments; missing comments are a red flag)
- That the invariants are actually upheld by the calling context
- That raw pointer operations (`ptr::read`, `ptr::write`, `slice::from_raw_parts`) have correct alignment and bounds
- That FFI calls match the C ABI exactly (types, ownership, nullability)

**Tool: `cargo-geiger`** provides a count of unsafe usage per crate in the dependency tree, highlighting crates with high unsafe density that merit deeper scrutiny. **Tool: `miri`** (`cargo +nightly miri test`) can detect undefined behavior in unsafe code at runtime (use on critical paths).

### 2.4 Cryptographic Weakness Search

**Rationale:** Non-cryptographic or deterministically-seeded RNGs produce predictable output. In blockchain contexts this can mean nonce reuse, predictable randomness, or forgeable commitments.

**Critical: Run these patterns against ALL in-scope source directories**, not just pallets — see §5.13 for rationale. Cryptographic weaknesses commonly live in native-side implementation crates (`ledger/`, `primitives/`, `util/`) rather than in runtime pallets.

```bash
grep -rn 'seed_from_u64\|StdRng\|SmallRng\|thread_rng\|rand::random\|from_seed\|OsRng' --include='*.rs' {IN_SCOPE}
grep -rn '0x42\|0xdead\|0xcafe\|seed_from' --include='*.rs' {IN_SCOPE}
```

**What constitutes a finding:**
- `StdRng` or `SmallRng` used for anything security-sensitive (nonce, key, hash, randomness commitment)
- Fixed seeds (`seed_from_u64(constant)`) -- deterministic output across all nodes/invocations
- Raw RNG output used as cryptographic commitments without domain separation or proper construction
- `OsRng` is generally acceptable; `StdRng::from_entropy()` is acceptable for non-consensus contexts

### 2.5 Type Safety and Arithmetic

**Rationale:** Rust's `as` casts are silent and lossy. Unchecked arithmetic panics in debug and wraps in release. Both are dangerous for token amounts, indices, and sizes.

```bash
grep -rn ' as i128\| as u32\| as i32\| as u64\| as usize\| as i64\| as u16\| as u8' --include='*.rs' {IN_SCOPE} | grep -v 'test\|mock'
```

**What constitutes a finding:**
- `u128 as i128` (wraps above `i128::MAX`)
- `usize as u32` on 64-bit targets (truncation)
- Arithmetic on financial values (`+`, `-`, `*`) without `checked_*` or `saturating_*` variants
- Buffer size calculations using the wrong size function (e.g., size of payload vs size of payload + header)

### 2.6 Feature Flag Divergence

**Rationale:** Nodes compiled with different feature flags must produce identical consensus behaviour. Feature-gated host functions, genesis digest items, or pallet configurations cause consensus splits.

```bash
grep -rn '#\[cfg(feature' --include='*.rs' {IN_SCOPE}
grep -rn 'cfg!(feature' --include='*.rs' {IN_SCOPE}
```

**What constitutes a finding:**
- Feature-gated Wasm host functions (changes execution environment)
- Feature-gated digest items in genesis block construction (changes genesis hash)
- Benchmark/debug features that expose additional pallets, RPCs, or host functions
- Any `#[cfg]` gate on code that affects state transitions or block structure

**Validation step:** Compile with default features and with `--all-features`, diff warnings and generated artifacts.

### 2.7 Unbounded Resource Consumption

**Rationale:** Operations without size bounds enable denial of service via memory exhaustion, CPU starvation, or connection starvation.

```bash
# File I/O without size limits
grep -rn 'std::fs::read\b\|read_to_end\|read_to_string' --include='*.rs' {IN_SCOPE}

# Silent truncation of error iterators
grep -rn 'take_while\|filter_map.*ok\b\|filter_map.*Result' --include='*.rs' {IN_SCOPE}

# Subscription/channel endpoints
grep -rn 'subscribe\|into_rpc\|RpcModule' --include='*.rs' {IN_SCOPE}

# Unbounded collection growth
grep -rn 'StorageMap\|StorageValue\|StorageDoubleMap' --include='*.rs' {IN_SCOPE}
```

**What constitutes a finding:**
- File reads without size checks (especially on paths from config/CLI -- could be `/dev/zero`)
- `take_while(Result::is_ok)` on iterators (silently discards all items after first error)
- RPC subscription endpoints without `max_subscriptions` limits or bounded channels
- `StorageMap` insertions without corresponding removals (unbounded on-chain state growth)
- `#[pallet::without_storage_info]` annotations -- these suppress Substrate's compile-time storage size enforcement. Any annotated pallet should be manually reviewed for unbounded storage types (`Vec`, `String`, `BTreeMap` without `Bounded*` wrappers)

```bash
# Suppressed storage size checks
grep -rn 'without_storage_info' --include='*.rs' {IN_SCOPE}
```

**RPC subscription fan-out:** For each RPC module registered in `create_full` (or equivalent), check whether subscription endpoints (`subscribe_*`, GRANDPA, BEEFY streams) enforce per-connection and global subscriber limits. Check for bounded channels with backpressure or drop-on-overflow semantics. Unbounded fan-out allows an attacker to open thousands of subscriptions, consuming memory and CPU proportional to consensus event throughput times subscriber count. **Do not mark PASS by assuming "Substrate handles it."** Verify the specific streams (`justification_stream`, `beefy_finality_proof_stream`, `beefy_best_block_stream`) have explicit per-connection caps or bounded channels. If no limit is visible in the node's code, this is a finding regardless of what upstream Substrate might provide — the node is responsible for its own resource limits. In a validated audit, the agent noted "No explicit limits but Substrate defaults apply" (PASS with caveat) — this should have been a FAIL because no explicit limits were configured.

```bash
# RPC subscription and stream fan-out
grep -rn 'SubscriptionTaskExecutor\|subscribe\|notification_service\|justification_stream\|best_block_stream\|finality_proof_stream' --include='*.rs' {IN_SCOPE}
grep -rn 'Grandpa::new\|Beefy::new\|into_rpc' --include='*.rs' {IN_SCOPE}
```

### 2.7.1 Storage Lifecycle Pairing Scan

**Rationale:** `StorageMap` entries that are inserted without a corresponding removal on the inverse lifecycle event cause unbounded state growth. This is a pattern-absence bug that cannot be found by reading individual functions — it requires tracing insert/remove pairs across the crate.

```bash
# Find all storage insert sites
grep -rn 'StorageMap.*insert\|StorageDoubleMap.*insert\|::insert(' --include='*.rs' {IN_SCOPE} | grep -v 'test\|mock\|bench'

# Find all storage remove/take sites
grep -rn '::remove\|::take(' --include='*.rs' {IN_SCOPE} | grep -v 'test\|mock\|bench'
```

**Produce a storage lifecycle pairing table:**

| Storage Map | insert() Site | remove()/take() Site | Paired? |
|-------------|---------------|---------------------|---------|
| `UtxoOwners` | `handle_create:L123` | ??? | **FAIL if no remove** |
| `Registrations` | `handle_registration:L456` | `handle_deregistration:L789` | PASS |

For every `insert()` without a corresponding `remove()`/`take()` on the inverse lifecycle event, flag as a finding lead. The reviewing agent must confirm whether the unpaired insert represents genuine unbounded state growth.

**Also check:** For every `StorageMap` with insertions, verify that any declared capacity constants (e.g., `MaxRegistrationsPerCardanoAddress`) are actually enforced at the insertion point. Search for `push()`, `insert()`, `append()` calls and verify a length/capacity check occurs before mutation.

### 2.8 External Connection Security

**Rationale:** Database and network connections must enforce transport security. Shared connection pools between critical and non-critical consumers risk starvation.

```bash
grep -rn 'PgPool\|PgSslMode\|SslMode\|max_connections\|connect_with\|connection_string' --include='*.rs' {IN_SCOPE}
grep -rn 'Arc<.*Pool\|\.clone()' --include='*.rs' {IN_SCOPE} | grep -i 'pool\|connection'
```

**What constitutes a finding:**
- TLS mode set to `Prefer` or `Disable` (allows active downgrade to plaintext). Note: `sqlx` defaults to `PgSslMode::Prefer` when no `ssl_mode` is set — this is an implicit vulnerability. Check specifically for `PgConnectOptions` constructed from connection strings without explicit `ssl_mode(PgSslMode::VerifyFull)`.
- **Mandatory negative-evidence check (validated gap):** For every `PgConnectOptions` or `PgPoolOptions` construction site, search for an explicit `.ssl_mode(...)` call. If no `.ssl_mode(...)` call exists on the builder chain, this IS a finding — the library default is `Prefer`, which allows plaintext downgrade. Do not mark PASS because "no insecure mode was set" — the absence of a secure mode is the vulnerability. In a validated multi-agent audit, this pattern-absence bug was missed because the agent checked the error type (`PostgresConnectionError`) for credential masking but never examined the `PgConnectOptions` builder for SSL configuration.
- No certificate validation (`danger_accept_invalid_certs`, missing CA config, `PgSslMode::Require` without `ssl_root_cert`)
- Single connection pool shared between consensus-critical paths and user-facing RPC (starvation risk)
- Pool size too small for the number of concurrent consumers

**Connection pool isolation (Critical check):** For each `PgPool`, `SqlitePool`, or similar connection pool, trace **all** consumers by following `.clone()` calls on the pool object. If the same pool instance serves both consensus-critical paths (block production, inherent data creation, authority selection, mainchain follower) and user-facing paths (RPC handlers, sidechain queries), flag as a finding — RPC burst traffic can exhaust connections and starve consensus reads. Check `max_connections` — a pool of 5 shared across 6+ components is a starvation risk. **Remediation:** separate pools with independent `max_connections`, `acquire_timeout`, and `statement_timeout` values for consensus vs RPC workloads. **Critical: do not stop at the data source constructors.** Also trace whether any RPC data source type (e.g., `SidechainRpcDataSourceImpl`) receives the same pool or a derivative of it. In a validated audit, the AI agent traced pool clones to 5 consensus data sources but missed that the same pool was also passed to a sidechain RPC data source, causing the connection pool finding to be under-rated from Critical to Medium.

```bash
# Pool creation and sharing patterns
grep -rn 'PgPool\|PgPoolOptions\|max_connections\|\.clone()' --include='*.rs' {IN_SCOPE} | grep -i 'pool'
grep -rn 'from_config\|DataSource.*::new\|Rpc.*::new' --include='*.rs' {IN_SCOPE} | grep -i 'pool\|connection'
```

### 2.9 Information Leak Search

**Rationale:** Error messages, logs, and debug output can expose internal topology, credentials, and architecture.

```bash
grep -rn 'log::\|tracing::\|println!\|eprintln!\|dbg!' --include='*.rs' {IN_SCOPE} | grep -i 'error\|warn\|fail\|connect\|host\|port\|password\|secret\|key\|credential'
grep -rn '#\[error\|Display' --include='*.rs' {IN_SCOPE}
```

**What constitutes a finding:**
- Database host/port/name in error format strings
- Private keys, seeds, or secrets in any log level
- Connection strings with credentials (even partially masked)

### 2.10 Serialization Pre-Allocation Mismatch

**Rationale:** Rust's `Vec::with_capacity` pre-allocates a buffer based on a size estimate. If the estimate function does not match the subsequent serialization function, the buffer under-allocates and heap-reallocates. While this is a performance issue in most cases, in security-sensitive paths (transaction construction, state hashing) it can mask buffer calculation bugs.

```bash
# Find all Vec::with_capacity calls that use a size estimation function
grep -rn 'Vec::with_capacity(serialized_size\|Vec::with_capacity(tagged_serialized_size' --include='*.rs' {IN_SCOPE}
```

**What constitutes a finding:**
- `Vec::with_capacity(serialized_size(value))` followed by `tagged_serialize(value)` — the capacity accounts for payload only, but `tagged_serialize` writes `tag_len + global_tag_len + 1 + payload`. The buffer will reallocate.
- The correct pairing is: `serialized_size` with `serialize`, `tagged_serialized_size` with `tagged_serialize`. Any cross-pairing is a finding.

**Validated gap:** In a multi-agent audit (Session 11), this pattern was found at Informational severity. In Session 12, it was missed entirely because the file containing the pattern was deferred to the ensemble pass. This search makes detection mechanical rather than depth-dependent.

### 2.11 Mock Data Source Toggle Detection

**Rationale:** Runtime-configurable flags that swap production data sources for mocks allow accidental or malicious activation in production. All data source selection must be compile-time gated (`#[cfg(test)]` or `#[cfg(feature = "test-utils")]`), not runtime environment variables.

```bash
# Environment-variable-controlled mock toggles
grep -rn 'MOCK\|mock' --include='*.rs' {IN_SCOPE} | grep -i 'env\|from_env\|var\|config\|flag'

# Data source factory/constructor patterns with mock branches
grep -rn 'use_main_chain_follower_mock\|MockDataSource\|mock_data\|data_source_mock' --include='*.rs' {IN_SCOPE}
```

**What constitutes a finding:**
- An environment variable (e.g., `USE_MAIN_CHAIN_FOLLOWER_MOCK=true`) that replaces production data sources with mocks at runtime. This allows a compromised environment or accidental misconfiguration to substitute attacker-controlled data for all consensus-critical sources (authority selection, mainchain hash, token observations, governed maps).
- A `cfg!(...)` macro (runtime check) used for data source selection instead of `#[cfg(...)]` (compile-time gate).
- Any constructor pattern where mock/production selection is based on a runtime flag rather than a feature gate.

**Validated gap:** In Session 11, this was found as Issue 22 (Medium). In Session 12, it was missed because no agent traced the `main_chain_follower.rs` data source construction path. This search makes detection mechanical.

---

## 3. Systematic Manual Review Strategies

These are pattern-based review strategies to apply **per architectural component** identified in Section 1.2. The agent should instantiate these against each relevant module.

### 3.1 Pallet Hook and Weight Audit

**Apply to:** Every pallet's `on_initialize`, `on_finalize`, `on_idle`, `offchain_worker`, and inherent extrinsics.

- [ ] Does each hook have a corresponding weight benchmark in `weights.rs`? Verify the function name matches (e.g., `on_initialize` weight is not accidentally using `on_finalize` benchmark).
- [ ] Are hook weights non-zero? A zero-weight hook with non-trivial logic allows unmetered block space consumption. **Critically:** check not just the `#[pallet::weight(...)]` annotation, but the **actual implementation** in `weights.rs` — the function may exist but return `Weight::from_parts(0, 0)`. A weight function that returns zero is equivalent to no weight benchmark. Also check whether `on_initialize` returns the weight consumed by `on_finalize` (Substrate accounts `on_finalize` cost via the value returned by `on_initialize`); if `on_initialize` returns zero, all `on_finalize` work is unmetered.

  **Action-level decomposition for weight accounting (knowledge-base insight — 5 sub-actions per the Marchesi et al. "actionable security tasks" methodology):**

  This check has a 37% false-PASS rate across 8 sessions because agents verify the weight annotation exists without tracing the full accounting chain. Apply ALL five sub-actions:

  1. **Read `on_initialize` return value:** What `Weight` does it return? If it delegates to `WeightInfo::on_finalize()`, read the `WeightInfo` implementation.
  2. **Read the `WeightInfo` function body:** Does `WeightInfo::on_finalize()` return a non-zero value, or `Weight::from_parts(0, 0)`? A function that exists but returns zero is equivalent to no benchmark.
  3. **Trace the accounting chain:** Substrate charges `on_finalize` work against the value returned by `on_initialize`. If `on_initialize` returns zero → all `on_finalize` computation is **free** (unmetered). This includes ledger updates, state writes, minting, and flushing.
  4. **Estimate the work in `on_finalize`:** List every operation (`post_block_update`, `flush_storage`, `mint_coins`, `StateKey::put`). Is this non-trivial? If `on_finalize` performs storage writes, external calls, or iteration, a zero weight is Critical.
  5. **Check extrinsic weight amplification:** Can an attacker submit cheap extrinsics (e.g., `send_mn_transaction` with low `ConfigurableWeight`) that amplify `on_finalize` work? If yes, the attacker controls unmetered computation.

  A PASS requires citing the specific non-zero weight value returned and confirming it accounts for worst-case `on_finalize` execution. A PASS that says "weight benchmark exists" without reading the `WeightInfo` function body is invalid.
- [ ] For extrinsics marked `DispatchClass::Mandatory`: does the weight reflect worst-case execution? Mandatory dispatch bypasses normal block weight limits. A zero weight with `DispatchClass::Mandatory` is a Critical finding — it allows unbounded block space consumption with no accountability.
- [ ] **Mandatory Dispatch Weight Check:** Explicitly search for `DispatchClass::Mandatory`. For each occurrence, verify the weight annotation. If it is `Weight::zero()` or a constant that does not account for input size/complexity, flag it as a Critical finding (Issue H).
- [ ] **Flush-after-write completeness (ordered state-write enumeration — MANDATORY):** After state-modifying operations in `on_finalize`, is storage properly flushed if the pallet manages an external persistence layer? **Do not just check the main code path.** Trace EVERY conditional branch in `on_finalize` that modifies state — including block reward distribution, minting, conditional storage writes. Verify the **last** state modification on **every** execution path is followed by a flush. A common bug: the main path calls `flush_storage()` after a write, then a conditional branch (e.g., `if reward > 0 { mint_coins(); StateKey::put(new_root); }`) executes AFTER the flush without a second flush call. A crash between the unflushed write and the next block leaves state inconsistent.

  **Mandatory procedure — ordered state-write enumeration (validated gap — 75% false-PASS rate):**

  Finding ONE flush call and concluding PASS is the canonical first-positive-signal false PASS. In 8 validated sessions, this check had a 75% false-PASS rate because agents found `flush_storage()` at one location and stopped. The correct procedure is:

  1. **Enumerate ALL state-modifying operations** in `on_finalize` in execution order, including operations in called functions (e.g., `mint_coins()`, `post_block_update()`). Produce a numbered list:
     ```
     [on_finalize] State writes in execution order:
     1. LedgerApi::post_block_update() → writes state root (line N)
     2. StateKey::put(new_root) (line M)
     3. LedgerApi::flush_storage() (line P)
     4. if reward > 0: LedgerApi::mint_coins() → writes state root (line Q)
     5. StateKey::put(updated_root) (line R)
     ```
  2. **Identify the LAST state write** on each execution path.
  3. **Verify a flush follows the LAST write** — not just any write. A flush at step 3 does not protect writes at steps 4-5.
  4. If any execution path's last state write is NOT followed by a flush → **FAIL**.

  A PASS requires citing: (a) the complete ordered list of state writes, (b) the location of each flush call, and (c) confirmation that the last write on every path precedes a flush. A PASS that cites only one flush call without the enumeration is **invalid**.
- [ ] For each `ProvideInherent` implementation: (a) Does `check_inherent` validate input size and complexity bounds, or only data equality with the provided inherent? (b) Does `is_inherent_required` return `Some(InherentError::Missing)` when data is available, or does it always return `Ok(None)` (allowing block producers to silently omit the inherent)? (c) Does `try_handle_error` decode and surface errors, or does it return `None` (silently swallowing inherent validation failures)?

### 3.2 On-Chain State Lifecycle Audit

**Apply to:** Every `StorageMap`, `StorageDoubleMap`, and `StorageNMap` in each pallet.

**Priority elevation for observation/bridge pallets:** Pallets that process data from external chains (mainchain followers, bridge pallets, native token observation pallets) are the **highest priority** for state lifecycle review. They sit at trust boundaries with external data, process inherent data with complex iteration logic, and are historically the densest source of findings. Every storage insert/remove in these pallets must be traced end-to-end. Allocate disproportionate review time to these pallets compared to governance/parameter pallets.

**Substrate mitigation awareness:** Substrate's `#[pallet::call]` dispatchables are wrapped in `with_transaction()` — if the call returns `Err`, all storage writes are automatically rolled back. This means the "write-before-validate" pattern is **partially mitigated** for regular extrinsics but **NOT** for `on_initialize`, `on_finalize`, `on_idle`, inherent handling, or code that catches errors internally and returns `Ok(())`. Focus write-before-validate checks on hooks and inherent processing.

- [ ] For every `insert()` call, is there a corresponding `remove()` or `take()` on the inverse lifecycle event? (e.g., asset creation should have cleanup on asset destruction, UTXO owner mapping on create should be removed on spend). **Trace both directions explicitly:** find every `StorageMap::insert()` call, identify which lifecycle event it corresponds to (create, register, mint, etc.), then find the inverse event handler (destroy, deregister, burn, spend) and verify it calls `remove()` on the same storage map with the same key derivation.
- [ ] Are bounded collections (`BoundedVec`, `BoundedBTreeMap`) actually enforced? Check that `MaxXxx` config constants are validated **at the insertion point** (not just declared as types). Search for `push()`, `append()`, `insert()` operations on bounded collections and verify the length check occurs before mutation, not after. A declared `MaxRegistrationsPerCardanoAddress` that is never checked in `handle_registration` is a finding.
- [ ] Is storage written *before* validation? For multi-step operations (storage write → external/ledger call → further logic), verify **all storage writes are reverted or not performed** if any downstream step fails. Watch specifically for patterns where `insert()` happens before a fallible call, and the error path returns `None`/`Err` without removing the prior insert. **Concrete anti-pattern:** `UtxoOwners::insert(id, owner); let event = LedgerApi::construct_event(owner)?; // ← if this returns Err, insert persists`.
- [ ] For cursor/position storage values (e.g., `NextCardanoPosition`, `LastProcessedBlock`): are updates **monotonic**? Is there a check that `new > current`? Can the cursor regress (causing replay of already-processed data) or jump forward by an unbounded amount (causing permanent omission of intermediate data)? Check that both monotonicity and a bounded forward-advance window are enforced. **Anti-pattern (validated false-PASS):** If the cursor is written unconditionally (e.g., `NextPosition::put(new_value)`) without any comparison to the previous value, this IS a finding — do not mark PASS because the code "works" or "sets it every block." Unconditional cursor writes without monotonicity guards allow a malicious block author to regress or jump the cursor via crafted inherent data. A PASS requires citing a specific `ensure!(new > old)` or equivalent guard in the code.

**Pagination and cursor logic (Critical check):** For functions that fetch data in batches with capacity limits (e.g., `get_utxos_up_to_capacity`), verify:
- (a) **Counters are correctly initialized.** A counter initialized to `None` or a sentinel value that is only set inside a conditional branch which does not execute on the first iteration means the counter never initializes and pagination silently fails. Trace the first iteration explicitly: does the counter variable get set before it is first checked?
- (b) **The end position is set to the last successfully processed item**, not unconditionally advanced to the tip. If the function fetches `< capacity` items, it should advance to the end of the fetched range, not to the global tip. Advancing to the tip when not all items in the range were processed causes permanent data loss.
- (c) **Capacity checks actually break the loop.** Verify the break condition is reachable and that the counter it depends on is correctly maintained.
- (d) **Pagination Loop Termination:** For loops that depend on a cursor or counter, verify that the termination condition is reachable in all branches. Check for "infinite fetch" bugs where a counter is initialized to a value (e.g., `None`) that prevents the loop from ever advancing if the first fetch returns fewer than `limit` items.

**Cross-layer verification matrix (mandatory for §3.2 pagination checks):**

This check MUST be applied at all three architectural layers — not just at the pallet layer where the cursor is consumed. In 7 validated audit sessions, every session applied pagination checks at the pallet layer only, missing the Critical pagination counter bug in the data source layer. A PASS at any single layer does NOT constitute a PASS for the check. Record evidence from each layer separately in the scratchpad:

| Layer | What to check | Where to look |
|-------|--------------|---------------|
| Data source | SQL query logic, counter initialization, loop termination, end-position update | `primitives/*/data_source/` |
| Inherent data provider | Data transformation, cursor propagation, capacity enforcement | `primitives/*/idp.rs` |
| Pallet consumption | Final use of paginated data, cursor storage writes, monotonicity | `pallets/*/src/lib.rs` |

Format:
```
§3.2 Pagination: data_source layer — FAIL (cur_tx initialized to None, never set on first iteration)
§3.2 Pagination: idp layer — PASS (capacity passed through to data source)
§3.2 Pagination: pallet layer — PASS (NextCardanoPosition set from IDP result)
```

In multi-agent mode (§5), the orchestrator includes supplementary cross-crate files (data source, IDP, and pallet files) in the Group A agent's prompt to enable three-layer pagination verification within a single agent's context.

### 3.3 Event Emission Integrity

**Apply to:** Every `deposit_event()` call site.

- [ ] On partial success (e.g., batch transactions where some succeed and some fail): are events emitted only for the successful operations, or do they include failed ones? **Critical: trace EVERY event field independently.** A common failure mode is filtering UTXO data for failed segments while leaving other event fields (call addresses, deploy addresses, maintain addresses, claim rewards) populated from an unconditional loop over all operations regardless of segment outcome. Each event field population path must be traced separately — do not conclude "events are filtered" after checking only one field type. In 7 validated audit sessions, every session that checked this item verified UTXO filtering (correct) and concluded PASS — missing that 4+ other field types were populated unconditionally. This is the canonical example of first-positive-signal bias (Limitation #10).

**Mandatory per-field trace for partial success (mechanical — not optional):**

For EVERY function that constructs events from transaction results where partial success is possible, produce a per-field trace table. This table is required output — do not skip it.

1. List ALL `Vec`/collection fields on the event struct or event construction site.
2. For EACH field, trace backward to its population source (the code that builds the collection).
3. For EACH population source, determine: does it filter by segment outcome (success vs failure)?
4. Produce the table:

  | Event Field | Population Source | Filters by Outcome? | Evidence |
  |-------------|-----------------|---------------------|----------|
  | `utxos` | `utxos.remove_failed_segments(&segments)` | **Yes** | line N |
  | `call_addresses` | `tx.calls_and_deploys().try_fold(...)` | **No** | line M |
  | `deploy_addresses` | `tx.calls_and_deploys().try_fold(...)` | **No** | line M |
  | `maintain_addresses` | `tx.calls_and_deploys().try_fold(...)` | **No** | line M |
  | `claim_rewards` | (trace individually) | ? | ? |

Any field where "Filters by Outcome?" is "No" is a **FAIL**. A single filtered field (e.g., UTXOs) does NOT justify PASS for the entire event — each field is an independent claim.

  The per-field trace table above is required output for this check. A PASS without the table has not performed the check and will be caught by the §3 completeness verification step. **HARD GATE (v4.2): The orchestrator MUST verify this table exists in the Group A agent's output for every pallet with partial-success event paths. If absent, the orchestrator dispatches a targeted follow-up agent for §3.3 before proceeding. This was validated as the #1 cause of the LA-E (High) gap across 12 sessions: agents mark §3.3 PASS after checking one event field (UTXOs) without producing the per-field table that would reveal 4+ unconditionally-populated fields.**

- [ ] Do events carry sufficient fields for uniqueness? For multi-output/multi-input operations, events should include an index or sub-identifier, not just the parent transaction ID. **Specific check:** compare the event struct against the storage struct field-by-field. If the storage struct has an `index` or `utxo_index` field but the event struct omits it, events from the same parent transaction are ambiguous. In a validated audit, `Mapping` (event struct) omitted `utxo_index` while `MappingEntry` (storage struct) included it — a Medium-severity finding that was missed because the field-by-field comparison was not performed.
- [ ] Are event struct fields a superset of the storage struct fields needed for indexing? Perform a **field-by-field comparison** between the event enum variant and the corresponding storage struct. Look specifically for missing discriminator/type fields that external indexers need for disambiguation (e.g., a `TransactionType` field present in storage but absent from the emitted event).
- [ ] **Mandatory struct diff (mechanical — not optional):** For every pallet that emits events with associated storage types, produce an explicit field-by-field diff table:

  | Field | In Event? | In Storage? | Type Match? | Gap? |
  |-------|-----------|-------------|-------------|------|
  | `cardano_address` | Yes | Yes | Yes | — |
  | `dust_address` | Yes | Yes | `Vec<u8>` vs `DustPublicKey` | **Type mismatch** |
  | `utxo_id` | Yes | Yes | Yes | — |
  | `utxo_index` | **No** | Yes | — | **Missing discriminator** |

  Any field present in storage but absent from the event is a potential uniqueness or indexing gap. Any field with a **different type** between event and storage is a potential validation gap (e.g., `Vec<u8>` in the event but `DustPublicKey` in storage means the event accepts unvalidated bytes that storage would reject). This check is mandatory for every pallet that has both `Event` enum variants and `StorageMap`/`StorageValue` types. Do not skip it. In 4 validated audit sessions, this check was never performed, missing 2 Medium-severity findings (missing `utxo_index` discriminator and mismatched address type) that are detectable purely mechanically.

  The struct diff table above is required output for this check. A PASS without the table has not performed the check and will be caught by the §3 completeness verification step.

### 3.4 Consensus Path Symmetry

**Apply to:** Block proposer vs block verifier code paths (inherent data providers, block import pipeline).

- [ ] Compare the inherent data provider sets between the proposer (block author) and the verifier (block importer). Every provider in the proposer must have a corresponding validator in the verifier. Missing validators allow forged inherents. **Perform a field-by-field diff of the two provider tuples.** List every type in the proposer's return tuple and every type in the verifier's return tuple. Any type present in only one tuple is a **FAIL** unless the agent can cite code where the verifier **independently computes or validates the value from its own data source** through a different mechanism that provides equivalent security. "The value is in the block digest" is NOT sufficient — the question is whether the verifier **recomputes** the value from its own data source (e.g., its own db-sync connection, its own slot calculation). If the verifier accepts the block author's value without recomputation, this is a finding regardless of whether the value appears in the block header. "Asymmetry is by design" is not a valid PASS justification without citing the specific recomputation code path. Pay special attention to: (a) **upgrade/migration inherent providers** — a missing upgrade provider in the verifier allows unauthorized runtime upgrades to pass verification; (b) **mainchain hash providers** — a missing McHash provider means the verifier trusts the block author's mainchain hash without recomputation; (c) **timestamp/slot providers** — asymmetric timestamp handling allows slot-time manipulation.
- [ ] **Off-chain configuration versioning:** Are any consensus parameters (slot duration, epoch length, committee size, epoch config) configured only off-chain without on-chain validation? Nodes with different off-chain configs will compute different inherent data and epoch transitions, causing consensus splits. Specifically: (a) verify there is an on-chain canonical source for each consensus parameter; (b) check for startup consistency validation that compares local configuration against on-chain values; (c) check that mathematical invariants are enforced at construction time (e.g., epoch duration must be divisible by slot duration).
- [ ] **Off-chain configuration invariant enforcement (validated gap):** For each consensus-critical configuration struct (e.g., `CreateInherentDataConfig`, `ScSlotConfig`, `MainchainEpochConfig`), verify that **mathematical invariants** are validated at construction time, not just at the point of use. Specifically: (a) `epoch_duration % slot_duration == 0` — a non-divisible value causes epoch boundaries to drift; (b) `slot_duration > 0` — a zero value causes division-by-zero in slot calculations; (c) `epoch_length > 0`. If the constructor accepts these values without validation and code comments note missing invariant checks (e.g., `// TODO: validate that epoch divides slot`), this is a finding. In a validated audit, `CreateInherentDataConfig` accepted unchecked `sc_slot_config` and `mc_epoch_config` — nodes with different configs computed divergent inherent data, a High-severity consensus finding that was missed because the checklist did not cover off-chain configuration invariant enforcement.
- [ ] Do all `Ord`/`PartialOrd` implementations used in consensus-relevant sorting produce a **total, deterministic order**? For each manual `Ord` implementation: (a) verify **all** discriminating fields are included in the comparison -- omitting a field means distinct values sort as equal; (b) verify parent structs delegate to the most complete ordering of their sub-structs (e.g., if a child struct has a 3-field `Ord`, a parent should not re-implement a 2-field comparison that drops a discriminator); (c) verify `PartialOrd` is consistent with `Ord` (`partial_cmp` should delegate to `cmp`). **This check is mandatory and must not be skipped.** In validated audits, an incomplete `Ord` implementation that compared only `tx_position` while ignoring `utxo_tx_hash` and `utxo_index` caused nondeterministic CMST body ordering — a High-severity consensus finding. Search for all `impl Ord` and `impl PartialOrd` in the codebase and verify each one.

### 3.5 Genesis Initialization Consistency

**Apply to:** All code paths that construct, load, or reference genesis state.

- [ ] Do all subcommands and startup paths derive genesis state from the **same source** (chain spec)? Or do some use hardcoded/embedded defaults? **Explicitly check offline subcommands** (`check-block`, `export-state`, `revert`, `import-blocks`, `benchmark`, `try-runtime`) — these often construct `StorageInit` with different genesis bytes than the online `run` command. **This is a validated, recurring finding pattern (rated High in professional audits).** A common bug: the online path reads `genesis_state` from chain spec properties, while offline paths use a hardcoded `DefaultNetwork.genesis_state()`. Trace *every* code path that constructs `StorageInit` or equivalent and verify they all derive from the same source. In multi-agent mode (§5), this is the responsibility of the node binary agent (A3).

  **HARD GATE (v4.2) — StorageInit Construction Site Enumeration (mandatory output):**

  The agent reviewing the node binary MUST produce a StorageInit construction site enumeration table as part of §3.5 evaluation. This table is a REQUIRED OUTPUT — not optional.

  1. Search for every site that constructs `StorageInit`, `StorageConfig`, or equivalent genesis state initialization.
  2. For EACH site, record: the code path (function name), the genesis state source (chain spec property, hardcoded constant, embedded binary), and the subcommand(s) that reach it.
  3. Produce the table:

  | Construction Site | Function | Genesis Source | Subcommands | Consistent? |
  |-------------------|----------|---------------|-------------|-------------|
  | `service.rs:new_partial` | `new_partial()` | `chain_spec.properties()["genesis_state"]` | `run` | Baseline |
  | `command.rs:run_subcommand` | `run_subcommand()` | `UndeployedNetwork.genesis_state()` | `check-block`, `export-state`, `revert` | **FAIL** — different source |

  Any row where "Consistent?" is FAIL is a finding. A §3.5 PASS without this table is INVALID. This check was validated as necessary: the divergent StorageInit finding (LA-L, High) was matched in Session 11 (which produced this table) and missed in Session 12 (which did not).
- [ ] During genesis block construction, are any `DigestItem` entries or state fields conditionally included via `#[cfg]` feature gates? This produces different genesis hashes per build configuration, causing nodes compiled with different features to compute different `genesis_hash` values, which in turn produces different protocol names and prevents peer-to-peer sync. Check all features that gate genesis construction logic (not just `hardfork_test` — also `experimental`, `runtime-benchmarks`, etc.).
- [ ] When parsing genesis data (extrinsics, properties), does the code use `take_while(Result::is_ok)` or similar patterns that silently truncate on the first error?
- [ ] Are chain spec properties decoded with proper error handling, or do they use `unwrap()`/`expect()` that crash the node on malformed specs?

### 3.6 Input Validation at Trust Boundaries

**Apply to:** Every point where external data enters the system (RPC params, inherent data, config files, database queries, file reads, chain spec properties).

- [ ] Are addresses, keys, and identifiers validated structurally (format, checksum, network tag), not just by length? **Specifically:** for public keys, verify point-on-curve validity; for field elements (`Fr`, `Fp`), verify the bytes represent a valid element (not just 32 bytes); for Cardano addresses, verify CIP-19 conformance (bech32m checksum, address header, network tag); for any cryptographic identifier, validate the underlying mathematical structure, not just byte-length. A 32-byte value that passes a length check but fails `Fr::from_le_bytes` will cause errors downstream in event construction.

  **Two-level validation protocol (MANDATORY — validated gap — 87% miss rate):**

  In 8 validated sessions, agents consistently marked PASS after finding a length or bounds check (e.g., `BoundedVec::try_from` validates length <= 32). This is Level 1 (structural) validation only. Level 2 (semantic) validation — which verifies the value is mathematically or protocol-valid — was checked in only 1 session (v7). A PASS requires BOTH levels. For each external input type, produce the two-level table:

  | Input Type | Level 1 (Structural) | Level 2 (Semantic) | PASS? |
  |------------|---------------------|-------------------|-------|
  | `dust_address` | `BoundedVec` length <= 32 ✓ | `Fr::from_le_bytes()` validity? | **FAIL** if no Fr check |
  | `cardano_address` | `BoundedCardanoAddress` length ✓ | CIP-19 bech32m checksum, header, network tag? | **FAIL** if no CIP-19 check |
  | `quantity` (from DB) | `i64` type ✓ | Non-negative check before `as u128` cast? | **FAIL** if no sign check |

  A PASS citing ONLY a length/bounds check is **invalid**. The agent must explicitly state what Level 2 validation exists, or mark FAIL if absent. "Length check exists" is necessary but never sufficient for PASS on cryptographic or protocol-specific identifiers.
- [ ] For typed enums received from external sources: does the match use a wildcard `_ =>` arm that silently accepts unknown variants? Unknown variants should be **rejected with an explicit error**, not assigned a default label like `"unknown"` and processed normally. Search for `_ => "unknown"` and `_ => Default::default()` patterns in match arms over deserialized external data.
- [ ] For functions that return "not found": do they return a proper error, or do they return an empty/default value that callers interpret as success (e.g., `Ok(Vec::new())` for a missing entity)? **Specific pattern:** `option.map_or(Ok(Vec::new()), serialize)` converts `None` (not found) into `Ok(empty)`, making it indistinguishable from a valid empty state. Callers cannot detect missing entities.
- [ ] Are configuration caps and limits (e.g., `MaxRegistrations`, `MaxConnections`) actually enforced at insertion points, or merely declared as types? Search for `push()`, `insert()`, and `append()` calls on storage collections and verify there is a length/capacity check BEFORE the mutation. A declared `MaxRegistrationsPerCardanoAddress` constant that is never referenced in `handle_registration` is a finding.
- [ ] For timestamp/time sources: is the correct clock used? Cross-chain operations should use the source chain's canonical time (e.g., Cardano block time from db-sync), not the local chain's block time from `pallet_timestamp`. The local block time is author-controlled (subject to protocol bounds) and represents a different chain's clock.
- [ ] **Transaction ordering sensitivity:** For extrinsics that read and act on volatile on-chain state (prices, balances, pool reserves), can an adversary who controls transaction ordering in the mempool extract value by front-running or sandwiching? This is especially relevant for extrinsics that interact with DeFi-like state or bridge operations.

### 3.7 Error Handling Integrity

**Apply to:** All error paths, especially in persistence, serialization, and batch operations.

- [ ] For batch/loop operations that serialize or persist multiple items: does a failure on one item abort the batch, or silently skip and continue? Does the caller receive an accurate success/failure signal?
- [ ] For `Result` iterators: are errors propagated (`collect::<Result<Vec<_>, _>>()`), or silently filtered (`filter_map(Result::ok)`, `take_while(Result::is_ok)`)?
- [ ] For functions returning `()`: could any internal failure be meaningful to the caller? Silent `()` return on partial failure is a common bug pattern.
- [ ] Are `#[allow(unused_variables)]` annotations covering up placeholder/stub implementations that return hardcoded defaults?
- [ ] For `Result`-returning functions: are they annotated `#[must_use]` or do callers use `let _ = ...` to silently discard errors? Search for `let _ = ` patterns on fallible calls — each is a potential silent failure.
- [ ] For functions that return costs, weights, or fee values: does any code path return a **hardcoded zero or default** value as a placeholder? Returning `Weight::zero()` or `0u128` for a cost/fee function masks unmetered resource consumption. Check specifically for functions named `*_weight`, `*_cost`, `*_fee`, or `*_gas` that contain `todo!()`, `0`, or commented-out logic.
- [ ] **Failure-path observability (knowledge-base insight — Marchesi et al. 2025 "Emit events for critical actions"):** For every state-modifying operation that can fail (system transaction construction, ledger writes, minting, external calls), verify that the failure path produces an observable signal — either a runtime event, a returned error, or an inherent validation failure. `log::error!` alone is insufficient for production observability because log levels can be filtered and off-chain log aggregation is not guaranteed. Specifically check:
  - (a) Does `on_finalize` emit an event when `mint_coins` or `flush_storage` fails, or does it only `log::error!`?
  - (b) Does `process_tokens` emit an event when system transaction construction fails, or does it silently continue with `Ok(())`?
  - (c) For any `if let Ok(...) = fallible_call { ... } else { log::error!(...) }` pattern: could the caller or an indexer benefit from an on-chain event recording the failure?
  A function that catches a critical error, logs it, and returns `Ok(())` masks the failure from on-chain consumers. The checklist item from Marchesi et al.: *"Avoid emitting events only in success paths — log failures or rejections if relevant for auditability."*

### 3.8 Concurrency and Shared State Safety

**Apply to:** All `Mutex`, `RwLock`, `Arc<Mutex<>>` usage and connection pool sharing patterns.

**Prerequisite:** Identify which Mutex implementation each module uses (`std::sync::Mutex`, `parking_lot::Mutex`, `tokio::sync::Mutex`). This determines which failure modes apply:
- `std::sync::Mutex`: blocks on same-thread re-lock (deadlock), poisons on panic (cascading failure)
- `parking_lot::Mutex`: blocks on same-thread re-lock (deadlock), does NOT poison on panic
- `tokio::sync::Mutex`: async-aware, does NOT poison on panic, yields rather than blocking

**Rust-specific deadlock anti-pattern:** `Mutex::lock()` takes `&self` (interior mutability), so the borrow checker **cannot** detect same-thread deadlocks. Watch for shadowed MutexGuards where the first guard's borrow keeps it alive through a `DerefMut`-derived reference while the second `lock()` call blocks on the same mutex. NLL does not help if the first guard's borrow is used after the second `lock()`.

- [ ] **Clone-release-reacquire (TOCTOU):** Is shared state cloned out of a lock, modified externally, then written back by reacquiring the lock? Trace every `lock()` -> clone -> drop -> `lock()` -> write-back sequence. Concurrent operations between the release and reacquire overwrite each other. **Check every function that reads state under a lock and later writes state under the same lock -- even if the read and write are in different methods** (e.g., a `get_context()` method that clones under lock, and an `update()` method that reacquires to write back).
- [ ] **Panic under lock:** Do any `expect()`/`unwrap()` calls execute while a mutex is held? For `std::sync::Mutex`, a panic poisons the mutex, making the resource permanently inaccessible. For `parking_lot::Mutex` and `tokio::sync::Mutex`, poisoning does NOT occur, but the panic may leave shared state in an inconsistent state — flag as a correctness issue rather than a cascading failure.
- [ ] **Unconditional state updates:** When a transaction or operation fails, is local/cached state still updated as if it succeeded? Trace **all** state update paths after the operation result is known -- not just the primary state object, but also **secondary state** such as wallets, caches, balance trackers, and derived state. Each should be conditional on success. **Specific pattern (validated gap):** In functions like `update_from_tx` that apply a transaction and then update wallet states, check whether `wallet.update_state_from_tx(tx)` is called unconditionally regardless of `TransactionResult::Success` vs `TransactionResult::Failure`. If wallets are updated on failure, local balances diverge from ledger state. This check applies to both on-chain code and off-chain tooling — in a validated audit, 10 Low-severity findings in toolkit state management were missed because the template's priority ordering caused under-review of helper/toolkit code.
- [ ] **State mutation completeness:** For methods that modify state through a local variable or clone, verify the modified state is written back to `self` or the source of truth. Look for patterns where `let mut state = self.state.clone()` is modified in a loop but `self.state` is never reassigned. The method returns results from the modified clone while the original remains stale. **Specific sub-pattern (validated gap):** In wallet `spend()` functions, check whether the internal `do_spend()` applies changes to a cloned state that is then discarded on return. If the wallet's canonical local state (e.g., `dust_local_state`) is not updated after `spend()`, subsequent calls operate on stale state, selecting already-spent outputs.
- [ ] **Pool isolation:** Are resource pools (database connections, thread pools) shared between consensus-critical and user-facing code paths? If so, can user-facing load starve consensus operations?
- [ ] **Connection Pool Cloning:** Trace every `clone()` of a `PgPool` or `SqlitePool`. Does the cloned instance end up in both a consensus-critical component (block import, inherent provider) and a user-facing component (RPC, sidechain query)? If so, this is a starvation risk (Issue C).

### 3.9 Cryptographic Construction Review

**Apply to:** All key derivation, nonce generation, commitment schemes, and randomness usage.

- [ ] Is the RNG cryptographically secure (`OsRng`, `ChaCha20Rng` seeded from entropy) for all security-sensitive operations?
- [ ] For key derivation: are derivation paths validated to match the expected key type/role? (e.g., a "shielded" wallet constructor should reject a "dust" derivation path)
- [ ] Are nonces unique and unpredictable? Check for patterns where the same seed produces the same nonce across invocations.
- [ ] For serialization used in hashing/signing: does the buffer allocation account for all components (header + payload), or just the payload?

### 3.10 External Data Source Integration

**Apply to:** All integrations with external databases, APIs, or chain followers.

- [ ] **Mock/test data source toggle:** Is there a runtime config flag that swaps production data sources for mocks? Such flags must be compile-time gated (`#[cfg(test)]` or `#[cfg(feature = "test-utils")]`), not runtime config. A runtime flag (e.g., `use_main_chain_follower_mock: bool` in a config struct) allows accidental or malicious activation in production — all consensus-critical data sources (authority selection, mainchain hash, token observations, governed maps) would operate on attacker-controlled mock data.
- [ ] **Pagination and truncation logic:** For functions that fetch data in batches with capacity limits, verify the cursor/counter logic actually advances. A counter that never increments causes permanent data skipping. **Specific sub-pattern:** check loop counter initialization -- if a variable is initialized to `None` or a sentinel value, and is only set to a real value inside a conditional branch that does not execute on the first iteration, the counter never initializes and pagination silently fails (e.g., `let mut cursor: Option<Id> = None;` where `cursor` is only set inside an `if buffer.len() == limit` branch, but the initial query with `cursor = None` returns `< limit` rows, so the branch never fires and one page is fetched forever).
- [ ] **Connection string handling:** Are connection errors formatted without exposing host/port/credentials? Check `Display`/`thiserror` implementations on connection error types for embedded host, port, or database name fields.
- [ ] **Timestamp source correctness for cross-chain data (apply at ALL THREE layers):** When constructing events or payloads that reference cross-chain data (e.g., Cardano observations, mainchain events), verify the timestamp comes from the **source chain's canonical time** (e.g., Cardano block time from db-sync, propagated through inherent data). Using the local chain's `pallet_timestamp` for cross-chain event timestamps is incorrect — the local timestamp is author-controlled and represents a different chain's clock. Mismatched timestamps cause verification failures, event misordering, and specification violations. **Critical: this check must be applied at the pallet consumption point, not just at the data source layer.** In 7 validated audit sessions, only 1 session found the timestamp source bug because the check was applied at the wrong layer. Specifically: search for `pallet_timestamp::Pallet::<T>::get()` in every pallet that processes inherent data from an external chain, and verify the resulting value is NOT used as the event/payload timestamp for cross-chain operations.

**Mechanical pallet_timestamp search (MANDATORY — knowledge-base insight from Marchesi et al. 2025 "Beware of block data"):**

The Marchesi et al. security checklist "Beware of block data" practice states: *"Avoid using block.timestamp for making critical decisions. Prefer external or verifiable time sources when exact timing or unpredictability is required."* This maps directly to Substrate's `pallet_timestamp::Pallet::<T>::get()`, which returns the **local** chain's author-controlled block time.

Before applying the cross-layer matrix below, the agent MUST run this mechanical search:
1. Search ALL pallet source files for `pallet_timestamp` (literal string search, not reasoning)
2. For each call site found, determine: is this timestamp used in a context involving cross-chain data (Cardano observations, mainchain events, bridge payloads)?
3. If YES → this is a **FAIL** regardless of any other reasoning. The local chain's author-controlled timestamp is never correct for cross-chain event attribution.
4. If NO (used only for local-chain operations like slot calculation, block context) → PASS for this call site.

This search is mechanical and takes seconds. In 8 validated sessions, only 1 found the timestamp source bug (13% hit rate) because agents reasoned about timestamps abstractly rather than searching for the literal `pallet_timestamp` string. The mechanical search eliminates the reasoning step entirely.

**Cross-layer verification matrix (mandatory for §3.10 timestamp checks):**

This check MUST be applied at all three architectural layers. A PASS at any single layer does NOT constitute a PASS for the check. Record evidence from each layer separately:

| Layer | What to check | Where to look |
|-------|--------------|---------------|
| Data source | Does the source chain's block time originate here? Is it propagated? | `primitives/*/data_source/`, `primitives/*/db/` |
| Inherent data provider | Is the source chain's block time included in inherent data? | `primitives/*/idp.rs` |
| Pallet consumption | Where is `cur_time` assigned? Does it come from `pallet_timestamp::get()` (LOCAL — wrong for cross-chain) or from the propagated source chain time? | `pallets/*/src/lib.rs` |

Format:
```
§3.10 Timestamp: data_source layer — PASS (Cardano block time fetched from db-sync)
§3.10 Timestamp: idp layer — PASS (block time propagated via inherent data)
§3.10 Timestamp: pallet layer — FAIL (pallet_timestamp::get() used as cur_time for cross-chain event)
```

In multi-agent mode (§5), the orchestrator includes supplementary cross-crate files (data source, IDP, and pallet files) in the Group A agent's prompt to enable three-layer timestamp verification within a single agent's context.

### 3.11 Cross-Crate Constant Consistency

**Apply to:** Constants that are defined in multiple crates or used across crate boundaries.

- [ ] Search for constants with similar names across different crates (e.g., `DEFAULT_X` in primitives vs `INITIAL_X` in a pallet). Do they have consistent values?
- [ ] For governance/configuration constants wired through `Config` traits: is the correct constant used? (e.g., `MaxMembers` wired to a `MAX_PROPOSALS` value instead of `MAX_MEMBERS`)
- [ ] Are type parameters consistent across delegated function calls? (e.g., calling a generic function with `<TypeA, TypeB>` when surrounding code uses `<TypeAHF, TypeBHF>`)

### 3.12 Runtime Upgrade and Storage Migration Safety

**Apply to:** All `on_runtime_upgrade` implementations, `StorageVersion` declarations, and migration modules.

- [ ] Does every pallet declare a `StorageVersion` and bump it on each storage-breaking change? Pallets without versioned storage cannot detect whether a migration has run.
- [ ] For each `on_runtime_upgrade`: does the implementation check the current `StorageVersion` before migrating, and set the new version after? A missing version guard means the migration re-runs on every upgrade.
- [ ] Does `on_runtime_upgrade` return an accurate `Weight`? Under-reported weight can exceed block limits, causing the upgrade block to fail validation.
- [ ] Are `pre_upgrade` and `post_upgrade` hooks implemented to validate migration correctness? These run in `try-runtime` testing but their absence means migrations are untested.
- [ ] For storage type changes (e.g., changing a `StorageValue<u32>` to `StorageValue<u64>`): is there a corresponding migration that transforms existing data? Missing migrations cause decode failures on first read.
- [ ] **Kill storage pattern:** Does the migration use `clear_prefix` or similar to remove old storage? Verify the prefix is correct -- an incorrect prefix silently corrupts or deletes unrelated storage.

### 3.13 Access Control and Origin Validation

**Apply to:** Every `#[pallet::call]` extrinsic and every dispatchable function.

- [ ] Does each extrinsic enforce the correct origin? Verify: `ensure_root` for governance-only operations, `ensure_signed` for user operations, custom origins for committee/council operations. A missing origin check allows any account to execute privileged operations.
- [ ] For `ensure_root` extrinsics: can the same effect be achieved through any non-root path (e.g., an inherent that writes the same storage, or a different extrinsic that calls the same internal function without the root check)?
- [ ] For `ensure_signed` extrinsics: is the signer's identity used correctly downstream? Verify the signed account is checked against ownership/authorization, not just that *someone* signed.
- [ ] Are there extrinsics that should be governance-gated but use `ensure_signed` instead (e.g., parameter changes, emergency operations, contract upgrades)?
- [ ] **Sudo bypass:** If a `pallet_sudo` or similar admin pallet is configured, can it bypass safety-critical checks that should be enforced even for root (e.g., storage migration ordering, balance conservation)?

### 3.14 System Transaction and Ledger Internal Function Review

**Apply to:** All system transaction application functions, ledger API query functions, transaction type matching, **and internal ledger implementation functions** (transaction application, minting/treasury, state queries). These functions are typically in submodules rather than the crate root — use the function registry from §1.2 step 8 to ensure they are not skipped.

- [ ] Does the system transaction type matcher use an **exhaustive match** (no wildcard `_ =>` arm)? A wildcard arm that maps unknown types to a default label (e.g., `"unknown"`) and continues execution allows potentially invalid transactions to be applied to state. Unknown types should be rejected with an explicit error. Search for `match` statements over `SystemTransaction` variants and check for `_ =>` fallthrough.
- [ ] Are unknown transaction types rejected with an explicit error, or silently accepted and applied? Even if the match arm maps to a label, does the calling function **gate execution** on the label (rejecting `"unknown"`) or proceed unconditionally to `apply_system_tx`?
- [ ] For query functions (`get_contract_state`, `get_balance`, `get_account_info`, etc.): does a not-found condition return a proper error (e.g., `Err(LedgerApiError::ContractNotPresent)`), or an empty/default value wrapped in `Ok`? Callers that cannot distinguish "empty state" from "entity does not exist" may make incorrect assumptions. **Check the `map_or` and `unwrap_or` patterns** on `Option<T>` returns from ledger queries.
- [ ] For ledger serialization and buffer construction: does the preallocation size account for all components? Check specifically for `serialized_size` vs `tagged_serialized_size` — using the wrong size function causes avoidable heap reallocations and may mask buffer calculation bugs in more critical contexts. **These are two distinct functions with different return values — do not conflate them.** `serialized_size` returns the payload size only; `tagged_serialized_size` returns `tag_len + global_tag_len + 1 + payload_size`. If `Vec::with_capacity(serialized_size(value))` is used but `tagged_serialize` is called (which writes tags + payload), the buffer will reallocate. The correct call is `Vec::with_capacity(tagged_serialized_size(value))`. **Validated false-PASS:** In a multi-agent audit, the agent read the exact line `Vec::with_capacity(serialized_size(value))` and concluded "PASS — correct pre-allocation" without recognizing the function was `serialized_size` (payload-only) rather than `tagged_serialized_size` (full tagged size). This produced a missed Medium-severity finding.
- [ ] **Transaction application with partial success:** For the core function that applies user transactions, trace the event construction loop. When a transaction has mixed successful and failed segments (partial success), are emitted events filtered to include **only** the successful segments? Or does the event loop unconditionally iterate all operations regardless of segment outcome? Check whether UTXO data is filtered for failed segments but event addresses/operations are not.
- [ ] **Minting and treasury payout functions:** What RNG is used for nonce generation in treasury or reward distributions? Is the seed fixed (deterministic and predictable), per-block (derivable from on-chain randomness), or truly random (from entropy source)? A fixed-seed RNG produces identical nonce values across invocations, enabling output identifier collisions and replay. Trace the nonce value from its generation point to its use in output construction.
- [ ] **Internal state query functions:** For each function that retrieves state and returns a serialized result, verify that the "not found" / `None` case is propagated as an error, not silently converted to an empty byte vector via `map_or(Ok(Vec::new()), ...)` or similar. Empty-vs-absent ambiguity is a class of bug, not a stylistic choice.

---

## 4. Reporting Format

### Finding Entry

```markdown
### Issue {ID}: {Title}

**Severity:** Critical | High | Medium | Low | Informational
**Category:** {Consensus | Panic/DoS | Cryptographic | State Consistency | Input Validation | Resource Exhaustion | Information Leak | Arithmetic/Type Safety | Configuration | Error Handling | Concurrency | Dependencies | Access Control | Runtime Upgrade | Unsafe Code}
**Affected Files:**
- `{file_path}#{line_number(s)}`

**Description:**
{What the code does, why it is problematic, what triggers it, what the impact is}

**Suggested Remediation:**
{Specific fix recommendation}
```

### Severity Scoring

For each finding, the agent MUST compute severity using both dimensions. Do not assign severity intuitively — use the rubric.

**IMPACT (I):**

| Score | Definition |
|-------|------------|
| 1 | No direct security impact — code quality, documentation, style |
| 2 | Affects local tooling or off-chain state only (wallets, CLI, deployers) |
| 3 | Affects node availability, correctness, or data integrity |
| 4 | Affects consensus integrity, enables fund loss, or halts the network |

**FEASIBILITY (F):**

| Score | Definition |
|-------|------------|
| 1 | Requires physical access, highly unlikely conditions, or multiple independent failures |
| 2 | Requires privileged access (root, validator key, config file control, operator action) |
| 3 | Requires only network access (RPC, p2p, public endpoint) |
| 4 | Occurs under normal operation, passive conditions, or routine network activity |

**Severity = map((I + F) / 2):**

| Average | Severity |
|---------|----------|
| 1.0–1.5 | Informational |
| 2.0–2.5 | Low |
| 3.0 | Medium |
| 3.5 | High |
| 4.0 | Critical |

Each finding entry MUST include the I and F scores with one-sentence justifications:

```
**Impact:** 4 — Consensus starvation blocks block production
**Feasibility:** 3 — Requires only RPC access, routinely available
**Severity:** High (avg 3.5)
```

**Calibration examples (from 7 validated audit sessions):**
- Connection pool shared (5 conns, RPC + consensus): I=4, F=3 → **High** (not Medium — RPC access is routine). LA rated Critical; the pool serves both consensus and RPC paths.
- Mock data source toggled by environment variable: I=4, F=2 → **Medium** (not Critical — requires config file control). LA rated Low; the real-world deployment controls config files as infrastructure.
- `unwrap()` on parent header in inherent creation: I=3, F=4 → **High** (not Low — pruning/reorgs trigger without attacker)
- Feature-gated genesis digest divergence: I=4, F=2 → **Medium** (not Critical — requires heterogeneous builds)
- `unwrap()` on chain spec properties: I=3, F=2 → **Medium** (not Low — attacker who controls config file triggers it, but requires operator-level access)
- Fixed-seed RNG 0x42 in minting: I=4, F=3 → **High** (predictable nonces, no privileges needed to observe)
- MaxRegistrations unenforced: I=3, F=3 → **Medium** (not Low — attacker needs only Cardano transactions, no special privileges)
- Mapping event missing utxo_index: I=2, F=4 → **Medium** (not Low — occurs on every multi-output Cardano tx; affects indexer correctness)
- Incomplete dust address validation (length-only): I=3, F=3 → **Medium** (not Low — invalid Fr values from Cardano data)
- Wallet from_path missing role validation: I=2, F=2 → **Low** (requires incorrect API usage by developer)

**Severity calibration cross-check (mandatory before finalizing report):**

For each finding rated Critical or High, verify:
1. Is the affected code reachable from the production node binary? (not just toolkit/test code)
2. What is the minimum privilege level needed to trigger it? No privileges (network access) → F ≥ 3; Config file control → F = 2; Validator key / physical access → F = 1
3. Does the finding affect consensus or just availability? Consensus integrity / fund loss → I = 4; Node availability / data integrity → I = 3; Off-chain tooling only → I ≤ 2

If I + F < 6, the finding should not be Critical. If I + F < 5, the finding should not be High.

**Severity calibration:** Compare each finding against the severity calibration examples before finalizing. The 14 calibrated examples are derived from professional audit benchmarking. Use these as lookup references — if a finding resembles a calibration example, use the example's severity as a baseline.

---

## 5. Execution Strategy

### Phase Order

1. **Reconnaissance** (Section 1.2): Map the architecture, identify trust boundaries and consensus paths.
2. **Static Analysis** (Section 2): Run all automated tools. Capture output as leads.
3. **Manual Review** (Section 3): Apply each strategy to every relevant component identified in reconnaissance. Work from highest-risk components first: pallet hooks and inherent data providers, then observation/bridge pallets, then service/startup code, then tooling.
4. **Report** (Section 4): Consolidate findings with severity, evidence, and remediation.

### Multi-Agent Execution Strategy

**Agents capable of delegating tasks to sub-agents** (e.g., orchestrating models that spawn worker agents) should use parallel delegation to overcome the context window and coverage limitations that cause the majority of missed findings in single-agent audits. The orchestrator performs reconnaissance and coordination; sub-agents perform deep, crate-level review.

**Phase 1 — Orchestrator: Reconnaissance and Planning**

The orchestrator executes §1.1–§1.2 directly: reads `Cargo.toml`, maps the architecture, identifies trust boundaries, builds the file inventory with line counts, and assigns crates to sub-agents. The orchestrator does NOT perform manual review itself — it coordinates.

**Phase 2 — Parallel Sub-Agent Dispatch**

Spawn sub-agents for the following roles. Agents in the same group can run concurrently:

**Group A: Crate-level deep review agents (one per priority-1/2 crate)**
Each agent receives: the crate path, the §3 checklist, the function registry entries for its crate, and supplementary files from other crates for cross-boundary checks. Each agent must:
- Read **every** `.rs` file in the crate, including large implementation submodules
- Build the function registry for its crate and track review status per function
- Apply every applicable §3 check with evidence-based PASS/FAIL/NA — **all checks are this agent's responsibility; there are no deferral markers**
- For checks requiring cross-crate context (§3.2 pagination, §3.4 inherent symmetry, §3.8 pool isolation, §3.10 timestamp source), use the supplementary files provided by the orchestrator
- Return structured findings as a list with fields: `{id, file, line, title, severity, checklist_item, evidence}`

For a typical Substrate node, this means ~6 parallel agents covering pallets (one per pallet), runtime, node binary, ledger implementation, and mainchain-follower primitives. Each agent gets its own context window, eliminating the large-file avoidance problem (§5 Limitation #8).

**Cross-crate supplementary files:** The orchestrator must include relevant files from other crates in each Group A agent's prompt to enable cross-boundary checks without deferral. Examples:
- The NTO pallet agent receives `primitives/mainchain-follower/src/data_source/mod.rs`, `primitives/mainchain-follower/src/idp.rs`, and `primitives/mainchain-follower/src/types.rs`
- The node agent receives `node/src/inherent_data.rs`, `node/src/main_chain_follower.rs`
- The ledger agent receives `ledger/src/versions/common/api/*.rs`

**Group B: Static analysis and mechanical checks agent**
One agent runs: (1) all §2 grep patterns against the **full** `{IN_SCOPE}` directory set; (2) mechanical pattern searches from §2.7.1 (storage lifecycle pairing), plus: every `impl Ord`/`PartialOrd` with field coverage verification, `take_while(Result::is_ok)` and `filter_map(Result::ok)` patterns, `Vec::with_capacity` size function mismatches, `subscribe`/`notification_service`/`justification_stream` for fan-out limits, every `StorageInit` construction site with genesis source verification, RPC subscription endpoints without per-connection limits, `pallet_timestamp` usage in cross-chain contexts. Returns categorized hits plus the storage lifecycle pairing table.

**Group D: Toolkit review agent (MANDATORY)**
One agent reviews all files in `ledger/helpers/src/` and `util/toolkit/src/` applying the mandatory toolkit checklist from §5 Component Priority Order. This agent MUST be dispatched concurrently with Groups A and B — not after them. Returns structured findings.

All groups dispatch concurrently. There is no wave separation.

**§3 Checklist Completeness Verification:**

After all agents return, the orchestrator produces a §3 coverage matrix: for every numbered §3 checklist item (§3.1 through §3.14), at least one agent must have a PASS/FAIL/NA verdict. Any item with zero verdicts is a coverage gap. For each gap, the orchestrator dispatches a targeted follow-up agent that reads the relevant files and evaluates the specific checklist item. The audit cannot proceed to adversarial verification with unevaluated §3 items.

**Phase 3 — Orchestrator: Structured Consolidation**

After all sub-agents return, the orchestrator consolidates using a mechanical process:
1. **Structured merge:** Concatenate all agent finding lists into a single flat table. Every agent finding becomes a row. No agent output is discarded.
2. **Dedup and map:** For each row, assign a report finding number. Rows with the same root cause get the same number with a "merged" justification. Every row MUST have a mapping. Any row without a mapping is automatically promoted to a new finding. The completed mapping table IS the elevation verification.
3. **§3 completeness verification:** Produce a §3 coverage matrix. For every numbered §3 item, at least one agent must have a verdict. Gaps trigger targeted follow-up.
4. Calibrate severity by comparing each finding against the severity calibration examples (§5.11)
5. Verify coverage: every >200-line file in priority-1/2 crates must have been read by at least one sub-agent (§5.14)

**Phase 3.5 — Exhaustive Panic Sweep**

After consolidation, spawn a dedicated panic sweep agent that receives:
- The panic inventory generated in Phase 0 (grep output of all `unwrap()`, `.expect(`, `panic!`, `assert!`, `unreachable!` sites)
- The file inventory with line counts

The panic sweep agent must:
1. For each panic site, determine reachability: (a) pallet hook / inherent provider / block import → Flag as High minimum; (b) service startup / subcommand handler → Flag as Medium minimum; (c) mutex-holding context (`between lock() and guard drop`) → Flag as Medium minimum (poison risk for `std::sync::Mutex`); (d) off-chain tooling → Flag as Low; (e) test/mock/bench → Skip.
2. For each flagged site, verify whether the `unwrap`/`expect` can fail under any valid input/configuration combination. Pay special attention to `Option::unwrap()` on config-derived values where a legitimate variant (e.g., `InMemory` database, missing parent header) returns `None`.
3. Perform a **late-file re-read** of the last 150 lines of every file with >400 lines. During this re-read, apply ONLY the panic-path checklist. Record results under `[File] LATE-FILE SWEEP` in the scratchpad.
4. Produce a panic inventory table: file, line, expression, reachability, trigger condition, severity.

**Phase 4 — Adversarial Verification (HARD GATE — Mandatory for High/Medium PASS items)**

After Phase 3.5 completes, spawn a verification agent. This phase is a **hard gate** — the workflow MUST NOT proceed to report generation without adversarial verification. The verification agent receives ONLY:
- Every §3 checklist item marked **PASS** with severity ≥ Medium potential
- The cited evidence and source files
- The §3 checklist items being verified

The verification agent does **NOT** receive the FAIL items, the findings list, or severity assessments. This prevents anchoring bias. The agent's goal is to REFUTE safety claims, not confirm them.

For each PASS item, the verification agent must:

**Step 1: Decompose the PASS claim.** What specific properties does the PASS require to be true? Example: "PASS — events are filtered for failed segments" requires: (a) UTXO data is filtered; (b) `call_addresses` are filtered; (c) `deploy_addresses` are filtered; (d) `maintain_addresses` are filtered; (e) `claim_rewards` are filtered.

**Step 2: Verify each property independently.** For each decomposed property, find the specific code that implements it. If any property lacks implementation → **REFUTED** → becomes a finding.

**Step 3: Output** one of:
- **CONFIRMED** — all decomposed properties verified with code citations
- **REFUTED** — one or more properties lack implementation → finding with evidence
- **INSUFFICIENT** — cannot determine from available code → flag for manual review

**Why this phase is mandatory:** In 4 validated audit sessions, this decomposition pattern would have caught 4-5 additional Medium/High findings that were marked as false PASSes. The primary agent's failure mode is stopping at the first positive signal — e.g., checking UTXO filtering (correct) and concluding all event fields are filtered (incorrect, 4 other field types are unconditional). Decomposition forces exhaustive verification of every constituent claim.

**Scoping:** Apply to all PASS items on §3.1 (flush checks), §3.2 (lifecycle/cursor), §3.3 (event fields), §3.4 (inherent symmetry), §3.6 (input validation), and §3.10 (timestamp/data source). These sections have the highest false-PASS rates.

Additionally:
- Search for pattern-absence bugs in areas between reviewed components
- Check the file inventory for >200-line files not referenced in any finding or scratchpad

**Why this architecture works:**
In 7 validated audit sessions, the multi-agent approach with template revision 2 achieved **75% overlap** with professional audit findings (33 of 44 matched or partially matched) — a significant improvement over earlier sessions (55% with revision 1, 36% with single-agent). The primary single-agent failure modes — large-file avoidance (8+ missed findings), selective grep scoping (1 Critical miss), scratchpad elevation failure (4+ missed findings), toolkit under-review (9 Low-severity misses) — were structurally resolved. The remaining 25% gap (11 findings missed) concentrates in four root causes: (a) **wrong-layer check application** — pagination and timestamp checks applied at pallet layer instead of data source layer (1 Critical + 1 Medium miss); (b) **first-positive-signal bias** — event field filtering checked for one field type, PASS extended to all (1 High miss); (c) **focused review missing individual panic sites** — architectural review overlooked specific `unwrap()` calls (1 High + 2 Low misses); (d) **scope omission** — files in `util/toolkit/` and intent modules not assigned to any agent (4 Low misses). The v3 workflow additions (pagination loop tracer, hard-gate adversarial phase, exhaustive panic sweep, Group E scope coverage, cross-layer deferral markers) are designed to close these specific gaps. Expected coverage: **85–90% overlap** with professional audits.

### Execution Model Requirements

**1. Mandatory Ingestion (See §1.4):** You must prove you have read the code before analyzing it.

**2. Structured "Scratchpad" Iteration:**
For every component audited, you MUST maintain a visible "Scratchpad" in your output to force attention to each check.
*   *Format:* `[Component] [Function/Struct]: [Check Name] ... [PASS/FAIL/NA]`
*   *Example:* `pallets/midnight/src/lib.rs on_finalize: Flush Check ... FAIL (No flush after write)`
*   *Why:* This prevents "attention decay" where the model skips checks on complex files.

**3. Trace-Based Prompts (Graph Navigation):**
Do not just analyze files in isolation. Explicitly trace critical objects across the codebase.
*   **Connection Pools:** Trace `PgPool`/`SqlitePool` from creation (`service.rs`) to all clones. Does the same pool serve RPC (public) and Consensus (critical)?
*   **Channels:** Trace `mpsc::Sender` from creation to all sinks. Is the channel bounded?
*   **Keys:** Trace private key usage from `keystore` to signing sites.

**4. Mandatory function-level review:** For every function in the registry built in §1.2 step 8, the agent MUST read the **full function body line-by-line** and trace every code path — not just scan for pattern matches via grep. Pattern matching (grep for `unwrap()`, `panic!()`, etc.) is a lead-generation tool, not a substitute for reading code. Each function's conditional branches, error handling paths, and state modification sequences must be individually verified. **If grep results suggest an issue in a function, read the entire function before concluding.**

**5. Depth-first, not breadth-first:** For priority-1 and priority-2 components (§5 Component Priority Order), the agent must complete an exhaustive review before moving to lower-priority components. "Exhaustive" means every function in the registry is read, every applicable checklist item from §3 is evaluated, and every finding is documented. Spreading effort equally across all components produces shallow coverage everywhere and deep coverage nowhere. Professional auditors spend the majority of their time on 2-3 critical modules — replicate this allocation.

**6. Evidence-based PASS/FAIL:** Every checklist item from §3 must be recorded with one of:
- **PASS — `{location}`: {one-sentence explanation of the code that provides the guarantee}.** Example: "PASS — `process_tokens` enforces monotonicity via `ensure!(new_pos > old_pos, Error::CursorRegression)` at line N."
- **FAIL — `{location}`: {description of the violation}.** This becomes a finding.
- **NA — {reason this check does not apply to this component}.**

A bare "PASS" without a location and justification is invalid. If you cannot point to specific code that provides the guarantee, the check has not been performed — it should be "not-yet-reviewed," not "PASS." **This is the single most important discipline: false PASSes are worse than skipped checks, because they create false confidence.**

**7. Negative-evidence discipline:** The majority of security findings are things the code *should* do but *doesn't*. For each checklist item, actively search for the **absence** of the expected pattern:
- §3.1 flush check → "Where is the flush after this write? If I can't find one, it's a finding."
- §3.2 remove check → "Where is the `remove()` for this `insert()`? If I can't find one, it's a finding."
- §3.2 cap check → "Where is the length check before this `push()`? If I can't find one, it's a finding."
- §3.4 validation check → "Where is the monotonicity guard for this cursor update? If I can't find one, it's a finding."
- §3.6 validation check → "Where is the structural validation for this address? If I can't find one, it's a finding."

This reverses the natural bias: instead of looking for evidence that the code is correct (and marking PASS when nothing looks wrong), look for evidence that the required safety mechanism exists (and mark FAIL when it's absent).

**8. Checklist instantiation:** For each component identified in §1.2, the agent MUST explicitly instantiate **every applicable check** from §3 and record pass/fail/NA with evidence as described above. Partial execution of the checklist is insufficient — findings cluster in the gaps between applied checks. When a check from §3 is skipped, there must be a documented reason (e.g., "§3.12 not applicable — no `on_runtime_upgrade` in this pallet"). **The template is a checklist, not a reference document.**

**9. Component Iteration Enforcement:** The agent must explicitly iterate through the list of crates generated in §1.2 Step 1. For each crate, it must ask: "Have I applied the §3 checklist to this crate?" If the answer is no, the audit is incomplete. Do not stop after the first 2-3 "interesting" crates.

**10. Grep pagination and truncation:** When running pattern searches that return truncated results (e.g., limited to 30 hits), the agent MUST either (a) increase limits to capture all results, or (b) run targeted searches per component to ensure no crate is missed. Truncated grep output is a signal to drill deeper, not to stop. A finding that appears only in the 31st hit is still a finding.

**11. Severity calibration via reachability and feasibility:** Before assigning Critical or High severity, confirm the affected code is reachable from the production node binary's execution paths — not just from toolkit or test code. Trace the call chain from the finding to the binary entry point. Code reachable only from off-chain tooling (node-toolkit, deployer utilities) should be rated at most Medium, unless it can corrupt state that the production node later consumes.

**Feasibility-weighted severity (validated calibration gap):** AI agents tend to rate infrastructure/configuration findings higher (based on theoretical worst-case impact) while rating availability/DoS findings lower (underweighting feasibility). Professional auditors weight both impact AND feasibility. Specifically:
- A connection pool shared between RPC and consensus with `max_connections = 5` is **Critical** (not Medium) because exploitation requires only RPC access, which is routinely available.
- An `unwrap()` on chain spec properties is **High** (not Medium) because an attacker who controls the configuration file trivially triggers it.
- An `unwrap()` on a parent header in inherent data creation is **High** because database inconsistencies (pruning, reorgs) trigger it without an active attacker.
- Conversely, a feature-gated genesis digest is **Medium** (not Critical) if heterogeneous feature builds are operationally unlikely in the target deployment.

When in doubt, calibrate severity by asking: "How many preconditions must an attacker satisfy, and how common are those preconditions in realistic deployments?"

**12. Mandatory finding elevation:** Every checklist item from §3 that is recorded as **FAIL** in the scratchpad MUST be elevated to a numbered finding in the final report (§4). Do not leave findings buried in the scratchpad without promoting them. In validated audits, multiple FAIL items (missing monotonicity checks, missing address validation, missing event field uniqueness) were noted in the scratchpad but not included as numbered findings — reducing the report's actionability and creating a false impression of lower finding density. The scratchpad is a working document; the report is the deliverable.

**13. Grep scope enforcement:** All grep patterns in §2 MUST be run against the **full `{IN_SCOPE}` path set**, not selectively against subsets (e.g., only `pallets/`). In validated audits, a fixed-seed RNG (`StdRng::seed_from_u64(0x42)`) in a ledger implementation crate was missed because cryptographic grep patterns were scoped only to the pallet layer. The `ledger/`, `primitives/`, and `node/` directories contain native-side implementation logic that is equally security-relevant.

**14. Implementation file coverage gate (extended):** Before beginning the report phase (§4), the agent must verify:
- (a) Every file with >200 lines of Rust source code in priority-1 and priority-2 crates has been **read** (not just grepped). List all `.rs` files sorted by line count, identify any >200-line files that have not been read, and read them before concluding. In validated audits, the two largest implementation files (696 and 1089 lines) were inventoried but never read, causing 8+ findings to be missed — including the single most critical finding in the professional audit.
- (b) The **exhaustive panic sweep** (Phase 1.5 in multi-agent mode) has been applied to every file in a consensus-critical path (pallet hooks, inherent providers, block import, service startup) and every file with >5 `unwrap()`/`expect()` calls.
- (c) The **late-file re-read** has been performed on the last 150 lines of every file with >400 lines. In 7 validated audit sessions, findings near the end of large files (e.g., `database_source.path().expect(...)` at line 802 of an 810-line file, `parent_header.unwrap()` in inherent data creation) were missed despite the file being read in full. The late-file re-read makes panic detection a mechanical second pass rather than an incidental byproduct of the first read.
- (d) Every `.rs` file in `{IN_SCOPE}` appears in at least one agent's file-read log. Any file not assigned to or read by any agent is a scope gap. In v7, 4 Low-severity findings were missed because `util/toolkit/` files and intent-related files were not in any agent's explicit scope.

**15. Invariant extraction for priority-1 functions:** For every function in the registry (§1.2 step 8) that belongs to a priority-1 or priority-2 component, the agent MUST perform explicit invariant extraction BEFORE applying the §3 checklist. This is the single highest-impact discipline for closing pattern-absence gaps.

For each function, list:
- **Preconditions:** What must be true about inputs? (e.g., cursor must be > previous value; address must be valid `Fr` element, not just 32 bytes)
- **Postconditions:** What must be true after execution? (e.g., storage write must be followed by flush; `UtxoOwners::insert` in create must have a corresponding `UtxoOwners::remove` in spend)
- **Cross-operation invariants:** What must hold between this function and its inverse? (e.g., `handle_create` inserts into `UtxoOwners` → `handle_spend` must remove from `UtxoOwners`)
- **Data source invariants:** What must be true about external data consumed? (e.g., timestamps from Cardano must use Cardano block time, not local `pallet_timestamp`)

For each extracted invariant, search for the enforcement mechanism:
- If found: cite the specific code (e.g., "`ensure!(new_pos > old_pos, Error::CursorRegression)` at line N") → PASS
- If NOT found: this IS a finding — do not mark PASS because the code "works" or "sets the value every block"

**Why this matters:** Pattern-absence bugs are the #1 gap in AI audits. Across 4 validated sessions, the improvement from 9% to 55% overlap was driven entirely by better file coverage and grep-pattern detection — NOT by improved reasoning about what code should-but-doesn't do. Invariant extraction converts "what's missing?" (hard — requires creative reasoning) into "does this specific guard exist?" (easy — mechanical search).

**Format:**
```
[pallet-native-token-observation] process_tokens:
  Invariant: NextCardanoPosition must increase monotonically
  Expected: ensure!(new_pos > current_pos) or comparison guard
  Found: No guard — position is set unconditionally via put()
  → FINDING (§3.2 cursor monotonicity)

  Invariant: UtxoOwners entries removed when UTXO is spent
  Expected: UtxoOwners::remove() or ::take() in handle_spend
  Found: Only UtxoOwners::get() — no removal
  → FINDING (§3.2 storage lifecycle)

  Invariant: Registered dust_address is valid DustPublicKey (Fr element)
  Expected: Fr::from_le_bytes() validation in handle_registration
  Found: Only length check (== 32 bytes) via BoundedVec
  → FINDING (§3.6 input validation)
```

### Component Priority Order

Review components in this risk order:

1. **Pallet hooks and inherent data providers** — consensus-critical, execute every block
2. **Observation/bridge pallets** — process external chain data, sit at trust boundaries, historically the densest source of findings. Allocate **disproportionate** review time here.
3. **Block production and verification paths** — consensus symmetry
4. **Runtime upgrades and storage migrations** — incorrect migrations corrupt chain state permanently
5. **Genesis and chain spec initialization** — foundation of chain identity
6. **Access control and origin validation** — privilege escalation surface
7. **External data source integrations** — trust boundary with off-chain systems (connection pools, database queries, follower data)
8. **Node service startup and configuration** — crash = offline node
9. **RPC layer** — attack surface from network (subscriptions, fan-out, resource limits)
10. **Shared primitives and types** — ordering, serialization, type safety
11. **Off-chain tooling and helpers** — lower criticality for consensus but affects users (wallets, deployers, genesis generators). **In 4 validated audit sessions, every session missed the same 9 Low-severity findings in `ledger/helpers/`.** The priority ordering governs *sequence*, not *whether to review* — the following minimum checklist MUST be applied even at priority 11:

    **Mandatory toolkit checklist (minimum coverage):**
    - [ ] For every function that modifies state (`self.xxx = ...`, `state.xxx = ...`): is the modification conditional on operation success (`TransactionResult::Success` vs `Failure`)?
    - [ ] For every function that modifies a clone or local copy of state: is the modified state written back to `self` or the source of truth? Anti-pattern: `let mut state = self.state.clone(); /* modify state */; return result;` — `self.state` is never updated. **Specific check:** in wallet `spend()` / `do_spend()` functions, does `do_spend()` apply changes to a cloned state that is then discarded on return?
    - [ ] For every `Mutex::lock()` → `.expect()` / `.unwrap()` sequence: could the panic poison the mutex? Is validation/cost calculation performed before or after acquiring the lock?
    - [ ] For every `std::fs::read` or `read_to_end`: is there a file type check (`is_file()`) and size limit before allocation? Could the path resolve to a device file, FIFO, or symlink to `/dev/zero`?
    - [ ] For every arithmetic operation on token/balance/financial values: is it `checked_*` or `saturating_*`? Are `as` casts replaced with `try_from`? Specifically check `u128 as i128` in offer/delta calculations.
    - [ ] For every function that returns `()` or logs-and-continues on error: should the error be propagated? Would the caller benefit from knowing about the failure? Specifically check `save_intents_to_file` and similar batch-write functions.
    - [ ] For every wallet constructor (`from_path`, `from_seed`): does it validate that `DerivationPath.role` matches the wallet type (e.g., `Role::Zswap` for shielded, `Role::Dust` for dust)?

    This checklist produces minimal context cost (toolkit code is typically ~2000 lines total) and catches the full cluster of Low-severity findings that professional auditors report.

### AI Agent Limitations and Mitigations

When this template is executed by an AI agent rather than a human auditor, the following structural limitations apply. The agent must actively mitigate each one. Limitations marked with **[MA]** are structurally resolved by the multi-agent execution strategy (§5 Multi-Agent) when available.

1. **Grep bias (pattern-presence vs pattern-absence):** AI agents gravitate toward grep-based analysis because it is token-efficient and produces concrete, triageable output. This systematically under-discovers pattern-absence findings (missing validations, missing flushes, missing lifecycle cleanup) which constitute the majority of real audit findings. **Mitigation:** The function registry (§1.2 step 8), negative-evidence discipline (§5.7), and evidence-based PASS requirements (§5.6). The agent must not consider grep triage as "review complete" for any module.

2. **Breadth-over-depth bias [MA]:** AI agents spread limited context across many files superficially. Professional auditors spend the majority of time on 2-3 critical modules. **Mitigation:** Depth-first review (§5.5). **Multi-agent:** Each crate-level sub-agent has a dedicated context window, enabling depth on every priority-1/2 crate simultaneously rather than forcing a depth-vs-breadth tradeoff.

3. **Context window pressure on module traversal [MA]:** Crate roots are short and cheap to read; implementation submodules are long and expensive. The agent may read `lib.rs` (50 lines of re-exports) and skip the 600-line implementation file. **Mitigation:** Function registry (§1.2 step 8) and coverage gate (§5.14). **Multi-agent:** Each crate-level sub-agent reads all files in its assigned crate, including large submodules, without competing for context budget with other crates.

4. **Inability to execute tools:** The agent may not be able to run `cargo audit`, `cargo clippy`, `cargo check`, or compile the codebase. **Mitigation:** §2.2 provides a fallback for dependency scanning. The inability to run tools increases — not decreases — the importance of manual code reading.

5. **Confirmation bias in checklist evaluation:** The agent tends to look for evidence that a check passes rather than evidence it fails. **Mitigation:** Evidence-based PASS/FAIL (§5.6) and negative-evidence discipline (§5.7). Every PASS must cite specific code.

6. **Scratchpad-to-report elevation failure:** AI agents note FAIL items in scratchpad evaluation but fail to transfer them into numbered findings. In validated audits, 4+ FAIL items were scratchpad-only. **Mitigation:** §5.12 mandates 1:1 FAIL-to-finding correspondence. **Multi-agent:** The consolidation agent (§5 Multi-Agent Phase 3) explicitly enforces this across all sub-agent outputs.

7. **Selective grep scoping [MA]:** AI agents scope grep to "obvious" directories (e.g., `pallets/`) and miss native-side code. In a validated audit, a fixed-seed RNG (`StdRng::seed_from_u64(0x42)`) in a ledger crate was missed because grep targeted only pallets. **Mitigation:** §5.13 mandates full `{IN_SCOPE}` scope. **Multi-agent:** The dedicated static analysis agent runs all patterns against the full scope.

8. **Large-file avoidance [MA]:** AI agents skip files over ~500 lines, creating coverage gaps where findings concentrate. In a validated audit, two unread files (696 and 1089 lines) contained 8+ missed findings including the single most critical finding. **Mitigation:** §5.14 coverage gate. **Multi-agent:** Each crate-level sub-agent reads all files in its crate regardless of size.

9. **Wrong-layer check application [MA]:** AI agents may apply a checklist item at the wrong architectural layer — e.g., checking timestamp source correctness at the data source level (where no timestamp dependence exists) instead of at the pallet consumption level (where `pallet_timestamp::get()` is incorrectly used for cross-chain events). In 7 validated sessions, this caused 1 Critical miss (pagination logic) and 1 Medium miss (timestamp source). **Mitigation:** The cross-layer verification matrices in §3.2 and §3.10 require per-layer evidence recording. **Multi-agent:** The orchestrator includes supplementary cross-crate files in each Group A agent's prompt, enabling the agent to trace data flows across crate boundaries and apply checks at the correct architectural layer. The §3 completeness verification step catches any check that was not evaluated at any layer.

10. **First-positive-signal bias on complex functions:** AI agents read a function, find one correct behavior (e.g., "UTXO data is filtered for failed segments"), and mark the entire check as PASS without verifying all related fields. **Mitigation:** For checks that involve multiple parallel fields or paths (§3.3 event emission, §3.8 state updates), the agent must explicitly enumerate every field or path and verify each one independently. A PASS on field A does not extend to field B.

11. **Late-file attention decay [MA]:** Findings near the end of large files (>500 lines) are missed at a higher rate than findings near the beginning. In 7 validated audit sessions, `database_source.path().expect(...)` at line 802 of an 810-line file and `parent_header.unwrap()` in inherent data creation were missed despite the files being read in full. **Mitigation:** After reading any file with >400 lines, the agent MUST perform a SECOND pass on the last 150 lines, applying ONLY the panic-path checklist (§2.1). Record results under `[File] LATE-FILE SWEEP` in the scratchpad. This is a mandatory mechanical step, not an advisory. **Multi-agent:** The exhaustive panic sweep (Phase 3.5) structurally resolves this by performing a dedicated panic-only pass with the pre-generated panic inventory, including explicit late-file re-reads. The §5.14 extended coverage gate (item c) verifies this has been performed.

### Tool Requirements

| Tool | Purpose | Installation |
|------|---------|-------------|
| `cargo clippy` | Lint and static analysis (panic paths, arithmetic, casts) | Included with rustup |
| `cargo audit` | Dependency vulnerability scan (RUSTSEC advisories) | `cargo install cargo-audit` |
| `cargo deny` | License compliance, advisory checks, duplicate deps | `cargo install cargo-deny` |
| `cargo geiger` | Unsafe code usage quantification across dependency tree | `cargo install cargo-geiger` |
| `cargo +nightly miri` | Undefined behavior detection in unsafe code | `rustup +nightly component add miri` |
| `grep` / `rg` | Pattern matching across codebase (lead generation only — see §2 preamble) | System utility / `cargo install ripgrep` |
| `cargo check` | Compilation and feature flag verification | Included with rustup |
| `cargo semver-checks` | API compatibility verification for runtime upgrades | `cargo install cargo-semver-checks` |
