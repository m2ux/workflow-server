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

---

## Aggregation Rules

When consolidating grep hits and mechanical check results into distinct findings:

1. Multiple panic sites (`unwrap`/`expect`) in the **same file or module** → ONE aggregated finding with a count and severity based on the highest-reachability site
2. Multiple type casts in the **same function** → ONE finding
3. RPC subscription endpoints without limits across multiple modules → ONE finding
4. Each unpaired storage insert (no corresponding remove) → SEPARATE finding
5. Each mechanical check FAIL → SEPARATE finding
