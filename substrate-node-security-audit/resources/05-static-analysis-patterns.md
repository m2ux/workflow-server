# Static Analysis Pattern Catalog

## Overview

A catalog of grep patterns and mechanical verification checks for security auditing Rust/Substrate node codebases. Each pattern defines a search string, triage or verification criteria, and pass/fail conditions. Patterns are organized into two tiers: automated grep patterns (lead generation) and mechanical checks (verification logic beyond simple matching).

---

## Grep Patterns

Run each pattern against all in-scope `.rs` files, excluding test/mock/bench files.

### Panic Paths

```
unwrap()  |  .expect(  |  panic!  |  assert!  |  unreachable!
```

**Triage by reachability:**
- **Critical:** Reachable from pallet hooks, inherent data creation, block import, genesis init
- **High:** Reachable from service startup, RPC handlers, CLI subcommands
- **Medium:** Reachable from off-chain tooling or utility functions
- **Informational:** Reachable only from explicitly guarded/impossible paths

### Unsafe Code

```
unsafe
```

### Cryptographic Weaknesses

```
seed_from_u64  |  StdRng  |  SmallRng  |  thread_rng  |  rand::random  |  from_seed  |  OsRng
0x42  |  0xdead  |  0xcafe  |  seed_from
```

### Type Casts

```
as i128  |  as u32  |  as i32  |  as u64  |  as usize  |  as u128
```

### Feature Flags

```
#[cfg(feature
```

### Resource Consumption

```
std::fs::read  |  read_to_end  |  take_while  |  filter_map.*ok  |  without_storage_info  |  subscribe  |  into_rpc
```

### Database Connection Security

```
PgPool  |  PgPoolOptions  |  PgSslMode  |  max_connections  |  PgConnectOptions  |  ssl_mode  |  SslMode
```

**Triage:** (a) For `max_connections` hits, verify pool size >= number of concurrent consumers sharing the pool. (b) For `PgPoolOptions::new()` hits, trace the builder chain — if no `.ssl_mode(...)` call appears before `.connect()`, the default is `Prefer` (permits TLS downgrade). Both are findings.

### Information Leaks — Credentials

```
password  |  secret  |  credential  |  private_key  |  api_key
```
(in error, log, or Display contexts)

### Information Leaks — Topology

```
host  |  port  |  database  |  db_name  |  connection_string
```
(in error Display/Debug implementations and thiserror format strings only — not in config constructors or connection builders)

**Triage:** For each hit in an error type's `Display` or `Debug` impl, verify whether the field value could expose deployment topology (internal hostnames, port numbers, database names) in logs or RPC error responses. Error types that format connection details aid reconnaissance.

### File I/O Safety

```
std::fs::read  |  std::fs::read_to_string  |  read_to_end  |  File::open  |  BufReader::new
```

**Scope:** ALL in-scope paths — not limited to toolkit code. Node configuration loaders, chain spec readers, and genesis file parsers are equally at risk.

**Triage:** For each hit, verify: (a) `is_file()` check before read, (b) size limit before allocation, (c) path cannot resolve to device file, FIFO, or symlink to `/dev/zero`.

### Serialization Pre-Allocation Mismatch

```
Vec::with_capacity(serialized_size  |  Vec::with_capacity(tagged_serialized_size
```

### Mock Data Source Toggle

```
MOCK  |  mock.*env  |  from_env.*mock  |  use_main_chain_follower_mock  |  MockDataSource  |  data_source_mock
```

### Empty-vs-Absent Query Pattern

```
map_or(Ok(Vec::new()  |  map_or(Ok(Default::default()  |  unwrap_or(Ok(Vec  |  unwrap_or_default
```
(on `Option<T>` returns from state/storage queries)

---

## Mechanical Checks

Each check extends the grep patterns above with verification logic that goes beyond simple matching.

### Check 1: Ord/PartialOrd Field Coverage

- **Search:** Every `impl Ord` and `impl PartialOrd`
- **Verify:** All struct fields are included in `cmp()`. Omitting a field means distinct values sort as equal.
- **FAIL if:** Any discriminating field is excluded from the comparison.

### Check 2: Silent Error Truncation

- **Search:** `take_while(Result::is_ok)` and `filter_map(Result::ok)`
- **Verify:** Error logging or propagation exists for dropped errors.
- **FAIL if:** Errors are silently discarded with no log or return path.

### Check 3: Serialization Size/Method Pairing

- **Search:** `Vec::with_capacity` near serialization code in ALL in-scope files, including two-line patterns with intermediate variables. Include serialization directories listed in the target profile. Zero hits in directories known to contain serialization code is a POSSIBLE FALSE NEGATIVE.
- **Verify (MANDATORY PAIRING TABLE):** For EVERY `Vec::with_capacity(size_variable)` near serialization code:
  1. Identify the SIZE FUNCTION that computed `size_variable` (trace backward to the assignment)
  2. Identify the SERIALIZE FUNCTION called after the allocation (trace forward to the write)
  3. Compare the two function names character by character:
     - `serialized_size` must pair with `serialize`
     - `tagged_serialized_size` must pair with `tagged_serialize`
     - Any cross-pairing → FINDING
  4. Produce a mandatory pairing table: `| Site | Size Function | Serialize Function | Match? |`
- **FAIL if:** A `serialized_size` preallocation is followed by `tagged_serialize`, or vice versa. "Correct pre-allocation" without the pairing table is an INVALID PASS.

### Check 4: Subscription Fan-Out Limits

- **Search:** `subscribe`, `notification_service`, `justification_stream`, `best_block_stream`, `finality_proof_stream`
- **Verify:** Per-connection subscriber limits or bounded channels are configured.
- **FAIL if:** No explicit per-connection caps or backpressure are visible in the node's code.

### Check 5: Genesis State Source Consistency

- **Search:** Every genesis state initialization construction site (e.g., `StorageInit`)
- **Verify:** All construction sites derive genesis state from the same source (chain spec).
- **FAIL if:** Online and offline paths use different genesis sources.

### Check 6: RPC Subscription Per-Connection Limits

- **Search:** `into_rpc()` registration sites
- **Verify:** Subscription endpoints have explicit per-connection limits.
- **FAIL if:** No limits configured. Do not assume the framework handles it.

### Check 7: Local Timestamp in Cross-Chain Contexts

- **Search:** `pallet_timestamp` in all pallet source files (literal string search)
- **Verify:** For each call site, determine whether the timestamp is used in a context involving cross-chain data (e.g., bridge observations, mainchain events, external chain payloads).
- **FAIL if:** The local chain's author-controlled timestamp is used for cross-chain event attribution.

### Check 8: (Retired — merged into Check 3)

### Check 9: Mock Data Source Toggle

- **Search:** `MOCK`, `mock.*env`, `from_env.*mock`, `use_main_chain_follower_mock`
- **Verify:** Data source selection is compile-time gated (`#[cfg(test)]`, `#[cfg(feature = "test-utils")]`), not runtime config.
- **FAIL if:** A runtime `bool` or environment variable controls production/mock data source selection.

### Check 10: SmallRng Security-Context Triage

- **Search:** `SmallRng`, `thread_rng`, `parent_block_hash` as RNG seeds in ALL non-test code, **including toolkit and helper crates**
- **For each SmallRng hit, MANDATORY triage:**
  1. Identify the seed source (constant, thread_rng, entropy)
  2. Trace what the RNG output is used for (block hash, nonce, key, test data)
  3. Determine blast radius — is the output visible to other nodes or observers?
- **FAIL if:** Output affects transaction context, block context, or any value visible to other nodes.
- **Note:** Listing a SmallRng grep hit without tracing to the usage context is insufficient. The triage step is what distinguishes a benign test helper from a predictable block hash.
- **TOOLKIT SCOPE:** SmallRng in toolkit code MUST be triaged when the RNG output is used in transaction construction, block context generation, or any value that enters the on-chain transaction pool. Dismissing toolkit SmallRng as "not production consensus" misses cases where toolkit-generated values feed transaction construction paths.

### Check 11: Empty-vs-Absent Query Pattern

- **Search:** `map_or(Ok(Vec::new()`, `map_or(Ok(Default::default()`, `unwrap_or(Ok(Vec`, `unwrap_or_default` on `Option<T>` returns from state/storage queries
- **Verify:** The `None` (not-found) case is distinguishable from an empty result by the caller.
- **FAIL if:** `None` is converted to `Ok(empty)` — callers cannot distinguish missing entities from valid empty state.
- **Note:** This is a pattern-absence bug that is invisible to callers: the function returns `Ok` in both "exists but empty" and "does not exist" cases.

### Check 12: (Retired — merged into Check 3)

### Check 13: Universal File I/O Safety

- **Search:** `std::fs::read`, `read_to_end`, `read_to_string`, `File::open` in ALL in-scope paths (not limited to toolkit code)
- **Verify:** For each file-reading site: (a) the path is checked with `is_file()` or equivalent before opening; (b) a size limit is enforced before allocation (`metadata().len() < MAX`); (c) the path origin is validated (not user-controlled without sanitization).
- **FAIL if:** Any file read occurs without type check AND size limit. Paths from CLI arguments, config files, or chain spec properties are highest priority.
- **Note:** Configuration loaders read arbitrary paths from environment or CLI — file I/O safety must be checked universally, not limited to toolkit code.

### Check 14: Error Type Topology Leakage

- **Search:** `impl Display` and `#[error(` in files containing `Connection`, `Pool`, `Postgres`, `Database`
- **Verify:** Error format strings do not embed `host`, `port`, or database name fields.
- **FAIL if:** An error type's Display/Debug formats connection details that would be visible in logs or RPC responses. Even when credentials are masked (`***:***`), exposing host/port/db names aids reconnaissance.
- **Note:** This is a pattern-presence bug — the fix is to redact or omit topology details from error messages while preserving them in structured (non-Display) fields for debugging.

### Check 15: Database Connection TLS Enforcement

- **Search:** `PgPoolOptions::new()`, `PgConnectOptions::new()`, `PgPool::connect(` in ALL in-scope paths
- **Verify:** For EACH pool/connection construction site, trace whether `.ssl_mode(SslMode::Require)` or `.ssl_mode(SslMode::VerifyFull)` is explicitly called. If no `.ssl_mode()` call exists, the default is `Prefer`, which allows silent downgrade to plaintext.
- **FAIL if:** Any production (non-test) database connection is established without explicit TLS enforcement. `Prefer` mode is insufficient — it allows a network attacker to strip TLS via downgrade.
- **Note:** The check must trace the DEFAULT behavior, not just explicit mode settings. A `PgPoolOptions::new()` without any `.ssl_mode()` call defaults to `Prefer`, which allows silent downgrade.

### Check 16: RuntimeExecutor Host Function Feature Divergence

- **Search:** `HostFunctions`, `RuntimeExecutor`, `ExtendedHostFunctions`, `WasmExecutor` in service initialization files
- **Verify:** Are there multiple type definitions for host functions gated by different features (e.g., `#[cfg(feature = "runtime-benchmarks")]`)? If the feature adds or removes host functions, nodes compiled with different features will have different Wasm execution environments.
- **FAIL if:** Different feature flags produce different `HostFunctions` type aliases that are used in the `RuntimeExecutor` or `WasmExecutor` construction. A Wasm module calling a host function present in one build but absent in another will trap, causing block import failure.
- **Relationship to Genesis Divergence:** This is a SEPARATE finding from feature-gated genesis digests (Check 5 / §3.5). Genesis divergence produces different genesis hashes; host function divergence produces different Wasm execution environments. Both cause consensus failure between heterogeneous builds, but through different mechanisms.
- **Note:** Feature-gated genesis digests and feature-gated host functions are two independent consensus-divergence vectors from feature flags. Both must be checked separately.

### Check 17: Storage Deposit Enforcement

- **Search:** `::insert(`, `::append(`, `::mutate(` in pallet source files (not runtime config)
- **Verify:** For each storage write site in a user-callable extrinsic (not hooks, not root-only), verify a storage deposit (`T::Currency::reserve`, `T::NativeBalance::hold`, or custom deposit mechanism) is charged proportional to the data stored.
- **FAIL if:** A user-callable extrinsic writes to storage without charging a deposit. Dust account and state-growth DoS vectors arise from free storage writes.
- **Scope:** Pallet extrinsics only. Hook writes (`on_initialize`, `on_finalize`) and root-only administrative calls are excluded.

### Check 18: External Data Freshness Validation

- **Search:** Functions that return tuples containing a timestamp or `updated_at` field alongside a value (price, rate, state). Typical patterns: `get_price`, `get_rate`, `fetch_data`, oracle trait implementations.
- **Verify:** The timestamp component is consumed by the caller (compared against current time, checked for staleness).
- **FAIL if:** The timestamp is destructured away (`let (value, _) = ...`) or the variable is assigned but never read. Stale external data (oracle prices, exchange rates) used without freshness checks can produce incorrect valuations.

### Check 19: Ignored Balance Primitive Return Values

- **Search:** `T::Currency::unreserve(`, `T::Currency::slash(`, `T::Currency::repatriate_reserved(` in all pallet source files
- **Verify:** The return value is assigned to a variable AND that variable is subsequently checked or used. `unreserve` returns the amount that could NOT be unreserved (not a `Result`); `slash` returns the unslashable amount.
- **FAIL if:** The return value is discarded (no `let x =` assignment) or assigned to `_`. Also FAIL if `if let Ok(...) = Currency::deposit_into_existing(...)` has no `else` clause in hook code (`on_initialize`, `on_finalize`).

### Check 20: Unbounded Vec in Extrinsic Parameters

- **Search:** `Vec<` in any `#[pallet::call]` function signature, and `Vec<` in `#[pallet::event]` definitions
- **Verify:** The Vec is either replaced with `BoundedVec<T, MaxLen>`, or an explicit length check (`ensure!(vec.len() <= MAX, ...)`) occurs before any iteration or storage write.
- **FAIL if:** A user-callable extrinsic accepts an unbounded `Vec<T>` parameter without a length guard. Root-only extrinsics are lower priority but should still be bounded.

### Check 21: Unit-Type Trait Silencing in Runtime Config

- **Search:** `type\s+\w+\s*=\s*\(\)` and `NoPriceFor`, `NoFilter`, `NoFee` in runtime configuration files
- **Verify:** For each match, determine whether the associated type controls a security-relevant mechanism (fee collection, call filtering, weight metering, message pricing). `()` implementations of non-security traits (e.g., `type Event = ()` in test mocks) are acceptable.
- **FAIL if:** A security-critical associated type is set to `()` or a known no-op type in a production runtime configuration.

### Check 22: Dangerous Semantic Defaults on Storage Lookup

- **Search:** `unwrap_or(0`, `unwrap_or_default()`, `value_or_default` on storage reads where the value represents a timestamp, decimal precision, exchange rate, or price
- **Verify:** The default value is semantically valid for the domain. Zero is not a valid timestamp (epoch 1970). Default decimal precision may not match the actual asset.
- **FAIL if:** A storage lookup returns a domain-invalid default that is subsequently used in calculations (division, multiplication, time comparison) without an explicit initialization check.

### Check 23: Silent Error Swallowing in Hook Financial Operations

- **Search:** `if let Ok` in `on_initialize`, `on_finalize`, `on_idle` functions, specifically on `Currency::deposit`, `Currency::transfer`, `Currency::withdraw`, or `mint` operations
- **Verify:** The `else` branch either emits an event, increments an error counter, or is explicitly documented as intentionally silent.
- **FAIL if:** A financial operation in a hook uses `if let Ok(...)` with no `else` clause. The inverse of the panic-path problem: silent failure drops funds or rewards without any observable signal.

### Check 24: Narrowing Type Casts Without Bounds Check

- **Search:** `as u8`, `as u16`, `as u32` (excluding test files), and `.as_usize()` on U256/U128 types
- **Verify:** The source value is bounded before the cast (e.g., `ensure!(val <= u32::MAX as u128, ...)`) or the cast uses `try_into()` with error handling.
- **FAIL if:** An explicit `as` narrowing cast is performed without a preceding bounds check. Clippy lint `cast_possible_truncation` catches many of these.

### Check 25: Configuration-Variant Panic Triage

- **Search:** `expect(`, `unwrap()` in service initialization files (`service.rs`, `command.rs`, `main.rs`) — specifically on `Option` values returned by config/database/storage accessor methods (`.path()`, `.get()`, `.header()`, `.properties()`)
- **Verify:** For EACH hit, enumerate all valid configuration variants that could produce `None`:
  - `DatabaseConfig::InMemory` → `.path()` returns `None`
  - Development presets → optional fields may be absent
  - Pruned database → old headers may be missing
  - First-run / empty state → genesis-dependent values may not exist
- **Produce a mandatory triage table:**

  | Site | Option Source | Config Variant Producing None | Reachable? | Severity |
  |------|-------------|-------------------------------|------------|----------|

- **FAIL if:** Any valid (non-test, non-impossible) configuration variant produces `None` at the unwrap site. "Works with default config" is NOT a valid PASS — all supported configurations must be checked.
- **Validated gap (Session 19):** `database_source.path().expect("db path available")` in `service.rs` panics when `DatabaseConfig::InMemory` is used. The node agent read the file but did not triage `expect()` calls against configuration variants because the panic was in infrastructure setup code, not consensus paths. This check makes configuration-variant triage mechanical.

### Check 26: Genesis Data Parsing Truncation

- **Search:** All code paths that parse genesis data in service or command files. Specifically: (a) genesis extrinsics decoding from chain spec properties, (b) genesis header construction, (c) chain spec property extraction, (d) StorageInit construction. Search for patterns: `take_while`, `filter_map`, `map_while`, early `break` or `continue` in parsing loops, `.ok()` on decode results inside iterators.
- **Verify:** For EACH genesis parsing path:
  1. Trace the iteration/decoding pattern
  2. Determine what happens when ONE element is malformed — does the parser stop, skip, or error?
  3. If the parser stops or skips silently, determine whether subsequent valid elements are lost
- **FAIL if:** A malformed element causes silent truncation of remaining valid elements. The genesis block's extrinsics root and state root depend on ALL elements; truncation alters these hashes and can cause consensus divergence between nodes that receive different chain spec versions.
- **Validated gap (Session 19):** Genesis extrinsics parsing in `service.rs` uses an iteration pattern that stops at the first invalid element, silently dropping all remaining extrinsics. The node agent found the StorageInit divergence (§3.5) but did not trace the extrinsics parsing path separately because the §2.7 check for `take_while(Result::is_ok)` only matched iterator-adapter patterns, not the specific truncation mechanism used here.
- **Scope:** Node service files and command handlers only. This is NOT a general-purpose check — it targets the specific genesis initialization codepaths.

### Check 27: Hardcoded Trivial Weight on Extrinsics

- **Search:** `#[weight = `, `#[pallet::weight(` followed by a numeric literal (not a function call) in all pallet source files
- **Verify:** For each extrinsic declaration, determine whether the weight is (a) a benchmarked weight function reference (`T::WeightInfo::function_name()`), or (b) a constant accompanied by documentation justifying the value (e.g., root-only extrinsics with inherent rate limiting).
- **FAIL if:** A user-callable extrinsic (`ensure_signed`) has a hardcoded weight literal below 10,000. This enables near-free block filling — an attacker can submit thousands of these extrinsics at negligible cost.
- **Relationship to Check 25:** Check 25 examines `weights.rs` for zero-weight benchmarks. Check 27 catches the case where no weight function is referenced at all — the weight is a literal constant in the extrinsic attribute, invisible to `weights.rs` analysis.
- **Note:** `decl_module!`-era pallets commonly use `#[weight = N]` syntax. The newer `#[pallet::weight(...)]` syntax can also contain literals. Both must be checked.

### Check 28: Unbounded Temporal Parameter (No Maximum Offset)

- **Search:** Extrinsic parameters representing future block numbers or timestamps. Typical names: `expiring_block_number`, `deadline`, `valid_until`, `lock_until`, `unlock_at`, `end_block`, `expiry`. Search for `BlockNumber` or `T::BlockNumber` in extrinsic signatures, and keyword patterns `expir`, `deadline`, `valid_until`, `lock_until`, `unlock_at` in pallet source files.
- **Verify:** For each future-pointing temporal parameter, verify that an upper bound is enforced: `ensure!(param <= current + MAX_OFFSET, ...)` where `MAX_OFFSET` is a runtime constant.
- **FAIL if:** No maximum offset check exists. An unbounded expiration means leaked signatures never expire, pending operations never time out, and locked assets remain locked indefinitely. The MAX_OFFSET should be a configurable runtime constant, not a hardcoded value.
- **Relationship to V18:** V18 (Deferred Action Precondition Gap) covers missing validation on scheduled actions generally. Check 28 targets the specific temporal-bound case — even if the deferred action is otherwise valid, an unbounded expiration window is itself a vulnerability.

### Check 29: Missing `#[transactional]` on Multi-Write Storage Operations

- **Search:** `decl_module!` in pallet source files. If found, the pallet uses pre-frame-v2 syntax where extrinsics are NOT automatically transactional. Then search for storage-writing helper functions (`try_mutate`, `::insert(`, `::mutate(`, `::put(`) that are called from extrinsics or hooks.
- **Verify:** For each `decl_module!` pallet:
  1. Identify all helper functions that write to storage
  2. Trace callers — is the helper called from an extrinsic or hook?
  3. Verify the helper or its caller has `#[transactional]` or uses `with_transaction`
  4. For `#[pallet::call]` pallets (frame v2+): extrinsics are auto-transactional, but helper functions called from hooks (`on_initialize`, `on_finalize`, `on_idle`) are NOT — these must still be checked
- **FAIL if:** A storage-writing helper function is reachable from a path where subsequent failure would leave partial state. Specifically: `decl_module!` extrinsics calling storage-writing helpers without `#[transactional]`, or any hook path calling storage-writing helpers without transactional wrapping.
- **Scope:** `decl_module!` pallets are the primary surface. For `#[pallet::call]` pallets, only hook paths need checking (extrinsic paths are auto-wrapped).

### Check 30: RPC Method Access Control (DenyUnsafe Gating)

- **Search:** `into_rpc()` registration sites in node service and RPC module files, and custom RPC handler implementations. Search for `DenyUnsafe`, `RpcMethods`, `unsafe`, `author`, `key`, `sign`, `rotate_keys`, `insert_key`, `submit_extrinsic` in RPC-related files.
- **Verify:** For each custom RPC handler registered via `into_rpc()`:
  1. Identify whether the method performs a sensitive operation (key management, signing, transaction submission, state mutation)
  2. Verify sensitive methods check `DenyUnsafe` and return an error when called in `Safe` mode
  3. Verify the node's default RPC method exposure is `Safe` (not `Unsafe`) — check CLI argument defaults and service configuration
- **FAIL if:** A custom RPC method that performs signing, key insertion, key rotation, or unsolicited transaction submission does not gate on `DenyUnsafe`. Also FAIL if the node defaults to `--rpc-methods=Unsafe` or if there is no `DenyUnsafe` check anywhere in custom RPC code that exposes sensitive operations.
- **Rationale:** An externally-accessible RPC interface exposing unsafe methods allows remote attackers to extract keys, sign arbitrary payloads, or drain funds from node-controlled accounts. This is the code-level manifestation of the "Ethereum Black Valentine's Day" attack class (SlowMist). Substrate's framework provides the `DenyUnsafe` guard, but custom RPC extensions must opt in explicitly.
- **Note:** Standard Substrate RPC modules (`system`, `chain`, `state`) are gated by the framework. This check targets **custom** RPC handlers added by the project.

### Check 31: Event Emission Fidelity (False Top-Up Prevention)

- **Search:** `deposit_event(`, `Self::deposit_event(`, `Event::` in all pallet source files, focusing on extrinsics and hooks that involve balance transfers, token minting, deposits, or withdrawals.
- **Verify:** For each event emission site involving a financial operation (transfer, mint, burn, deposit, withdraw, claim):
  1. Verify the event is emitted AFTER the state transition completes successfully — not before, and not in a branch that can still fail
  2. Verify the amount in the event matches the actual state change (fees deducted, rounding applied, partial fills reflected)
  3. Verify no event is emitted on error paths that revert state (in `decl_module!` pallets without `#[transactional]`, an event emitted before a later failure persists even though the intent failed)
  4. For hooks (`on_initialize`/`on_finalize`): verify events are emitted only for operations that actually succeeded, not optimistically
- **FAIL if:** (a) A financial event is emitted before the corresponding state transition is finalized, (b) the event amount diverges from the actual state change, or (c) an event is emitted on a path where subsequent failure does not revert the event. External systems (exchanges, indexers, bridges) rely on events as the source of truth for crediting funds — a misleading event enables false deposit attacks.
- **Relationship to V8 and V31:** V8 (Silent Error Swallowing) covers the case where financial operations fail silently with no event. Check 31 covers the inverse: events that fire when they shouldn't, or with incorrect amounts. Check 29 (Missing `#[transactional]`) is related — non-transactional extrinsics can emit events that persist despite later failure.

---

## Aggregation Rules

When consolidating grep hits and mechanical check results into distinct findings:

1. Multiple panic sites (`unwrap`/`expect`) in the **same file or module** → ONE aggregated finding with a count and severity based on the highest-reachability site
2. Multiple type casts in the **same function** → ONE finding
3. RPC subscription endpoints without limits across multiple modules → ONE finding
4. Each unpaired storage insert (no corresponding remove) → SEPARATE finding
5. Each mechanical check FAIL → SEPARATE finding
