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

### Connection Security

```
PgPool  |  PgSslMode  |  max_connections  |  PgConnectOptions
```

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

- **Search:** `Vec::with_capacity(serialized_size`
- **Verify:** The corresponding serialization call uses the matching size function:
  - `serialized_size` pairs with `serialize`
  - `tagged_serialized_size` pairs with `tagged_serialize`
  - A cross-pairing causes under-allocation and heap reallocation.
- **FAIL if:** A `serialized_size` preallocation is followed by `tagged_serialize`, or vice versa.

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

### Check 8: Preallocation Mismatch (Deep Scan)

- **Search:** `Vec::with_capacity(serialized_size` across ALL files, **with mandatory coverage of internal API and transaction-handling submodules** (e.g., `ledger/src/versions/*/api/*.rs`)
- **Verify:** The capacity function matches the subsequent serialization call. If an intermediate variable is used, trace it to its definition.
- **FAIL if:** Mismatch detected, OR zero hits across the ledger/serialization directory (flag as POSSIBLE FALSE NEGATIVE for manual review follow-up).
- **Note:** This pattern typically lives in internal transaction construction code, not the public API surface. Searches scoped only to top-level modules miss it.

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
- **TOOLKIT SCOPE (v4.5):** SmallRng in toolkit code (ledger/helpers/, util/toolkit/) MUST be triaged when the RNG output is used in transaction construction, block context generation, or any value that enters the on-chain transaction pool. Dismissing toolkit SmallRng as "not production consensus" misses the case where the output of `SmallRng::seed_from_u64(parent_block_hash_seed)` in `context.rs` feeds `TransactionWithContext::new`, which constructs transactions submitted to the network. Predictable parent block hashes allow observers to reconstruct the randomness used in transaction construction.

### Check 11: Empty-vs-Absent Query Pattern

- **Search:** `map_or(Ok(Vec::new()`, `map_or(Ok(Default::default()`, `unwrap_or(Ok(Vec`, `unwrap_or_default` on `Option<T>` returns from state/storage queries
- **Verify:** The `None` (not-found) case is distinguishable from an empty result by the caller.
- **FAIL if:** `None` is converted to `Ok(empty)` — callers cannot distinguish missing entities from valid empty state.
- **Note:** This is a pattern-absence bug that is invisible to callers: the function returns `Ok` in both "exists but empty" and "does not exist" cases.

### Check 12: Serialization Mismatch Deep Scan

- **Search:** Every `Vec::with_capacity` call in the ledger/serialization directory
- **Verify:** The capacity estimation function matches the serialization method. Trace intermediate variables.
- **FAIL if:** Mismatch between estimation and serialization. Zero hits is a POSSIBLE FALSE NEGATIVE — flag for manual review.
- **Note:** This check overlaps with Check 8 but is scoped specifically to the directory where serialization buffer mismatches are most likely to occur.

### Check 13: Error Type Topology Leakage

- **Search:** `impl Display` and `#[error(` in files containing `Connection`, `Pool`, `Postgres`, `Database`
- **Verify:** Error format strings do not embed `host`, `port`, or database name fields.
- **FAIL if:** An error type's Display/Debug formats connection details that would be visible in logs or RPC responses.
- **Note:** This is a pattern-presence bug — the fix is to redact or omit topology details from error messages while preserving them in structured (non-Display) fields for debugging.

---

## Aggregation Rules

When consolidating grep hits and mechanical check results into distinct findings:

1. Multiple panic sites (`unwrap`/`expect`) in the **same file or module** → ONE aggregated finding with a count and severity based on the highest-reachability site
2. Multiple type casts in the **same function** → ONE finding
3. RPC subscription endpoints without limits across multiple modules → ONE finding
4. Each unpaired storage insert (no corresponding remove) → SEPARATE finding
5. Each mechanical check FAIL → SEPARATE finding
