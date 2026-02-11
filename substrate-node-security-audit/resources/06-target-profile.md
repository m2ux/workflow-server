# Target Profile: midnight-node

This profile contains target-specific configuration for auditing the midnight-node codebase. The core workflow rules are target-agnostic; this profile provides the crate-specific agent assignments, file paths, struct names, calibration data, and ensemble blind-spot items that vary per target.

When auditing a different Substrate node, replace this profile with target-appropriate values.

---

## Agent Dispatch Assignments

All primary agents dispatch concurrently in a single batch. The verification agent dispatches after collection.

### Primary Agents (concurrent)
- **A1:** NTO pallet (`pallets/native-token-observation/`)
- **A2:** Midnight pallet + ledger (`pallets/midnight/`, `pallets/midnight-system/`, `ledger/`)
- **A3:** Node startup + config (`node/src/service.rs`, `node/src/command.rs`, `node/src/cfg/`, `node/src/chain_spec/`)
- **A4:** Node consensus + network (`node/src/inherent_data.rs`, `node/src/main_chain_follower.rs`, `node/src/rpc.rs`, `node/src/extensions.rs`, `node/src/payload.rs`, `node/src/benchmarking.rs`, `node/src/main.rs`, `node/src/lib.rs`, `node/src/sidechain_params_cmd.rs`)
- **A5:** Runtime + governance (`runtime/`, `pallets/version/`, `pallets/system-parameters/`, `pallets/federated-authority/`, `pallets/federated-authority-observation/`)
- **A6:** All primitives (`primitives/`)
- **B:** Static analysis (all in-scope)
- **D:** Toolkit (`ledger/helpers/`, `util/toolkit/`, `util/upgrader/`)

### Post-Collection — Verification
- **V:** Output verification agent (receives all agent outputs, target profile, file inventory, dispatch manifest)

---

## File Coverage Obligations

Every .rs file > 200 lines in priority-1/2 crates MUST be assigned to a specific agent. The verification agent (V) checks this table against agent outputs. Any file not referenced in at least one agent's output is a coverage gap requiring re-dispatch.

| File | Lines | Agent | Notes |
|------|-------|-------|-------|
| `runtime/src/lib.rs` | 1825 | A5 | Runtime config, parameter_types!, all pallet Config impls |
| `ledger/src/versions/common/mod.rs` | 922 | A2 | Core ledger bridge, caching, system tx dispatch |
| `node/src/command.rs` | 867 | A3 | CLI handlers, genesis state extraction, keystore init |
| `node/src/service.rs` | 807 | A3 | Service init, genesis block builder, StorageInit |
| `util/toolkit/src/genesis_generator.rs` | 767 | D | Genesis generation tooling |
| `ledger/src/host_api/mod.rs` | 642 | A2 | Host function implementations |
| `util/toolkit/src/tx_generator/builder/mod.rs` | 605 | D | Transaction builder |
| `util/toolkit/src/fetcher/fetch_storage/redb_backend.rs` | 603 | D | Storage fetcher |
| `pallets/cnight-observation/src/lib.rs` | 589 | A1 | NTO pallet core |
| `ledger/helpers/src/versions/common/types.rs` | 588 | D | Helper types, SmallRng usage |
| `pallets/midnight/src/lib.rs` | 565 | A2 | Midnight pallet, hooks, state management |
| `util/toolkit/src/fetcher/fetch_storage/postgres_backend.rs` | 562 | D | PG storage backend |
| `node/src/cfg/mod.rs` | 559 | A3 | Config loading, ChainSpecCfg validation |
| `pallets/federated-authority-observation/src/lib.rs` | 555 | A5 | FA observation, membership reset |
| `primitives/mainchain-follower/src/data_source/cnight_observation.rs` | 546 | A6 | PG queries, pagination, type casts |
| `ledger/helpers/src/versions/common/transaction.rs` | 527 | D | Transaction helpers, save_intents_to_file |
| `util/toolkit/src/fetcher/wallet_state_cache.rs` | 509 | D | Wallet state caching |
| `ledger/src/versions/common/api/transaction.rs` | 499 | A2 | Ledger transaction API |
| `primitives/mainchain-follower/src/data_source/candidates_data_source/db_model.rs` | 487 | A6 | Candidate DB model |
| `util/toolkit/src/commands/generate_intent.rs` | 452 | D | Intent generation |
| `util/toolkit/src/tx_generator/builder/builders/batches.rs` | 450 | D | Batch builders |
| `pallets/federated-authority/src/lib.rs` | 425 | A5 | Governance motions |
| `pallets/federated-authority-observation/src/weights.rs` | 410 | A5 | Weight benchmarks |
| `primitives/cnight-observation/src/lib.rs` | 406 | A6 | Observation types, Ord impls |
| `ledger/helpers/src/versions/common/context.rs` | 397 | D | LedgerContext, wallet mutex, deadlock site |
| `primitives/mainchain-follower/src/data_source/candidates_data_source/mod.rs` | 379 | A6 | Candidate data source |
| `pallets/federated-authority/src/weights.rs` | 378 | A5 | Weight benchmarks |
| `util/toolkit/src/toolkit_js/mod.rs` | 376 | D | JS bindings |
| `node/src/main_chain_follower.rs` | 375 | A4 | Data source wiring, pool configs |
| `node/src/chain_spec/mod.rs` | 372 | A3 | Chain spec construction, genesis config |
| `ledger/src/versions/common/api/ledger.rs` | 370 | A2 | Ledger query API |
| `util/toolkit/src/commands/root_call.rs` | 363 | D | Root call commands |
| `ledger/src/versions/common/types.rs` | 345 | A2 | Ledger types, error codes |
| `util/toolkit/src/tx_generator/source.rs` | 336 | D | TX generator source |
| `node/src/inherent_data.rs` | 331 | A4 | CIDP structs, inherent providers |
| `util/upgrader/src/lib.rs` | 320 | D | Network upgrader |
| `runtime/src/currency.rs` | 320 | A5 | CurrencyWaiver impl |
| `ledger/helpers/src/versions/common/mod.rs` | 316 | D | Helper module root |
| `util/toolkit/src/tx_generator/builder/builders/contract_maintenance.rs` | 314 | D | Contract maintenance |
| `util/toolkit/src/sender.rs` | 314 | D | Transaction sender |
| `pallets/midnight/rpc/src/lib.rs` | 313 | A2 | Midnight RPC |
| `pallets/cnight-observation/src/config.rs` | 306 | A1 | NTO config, genesis validation |
| `node/src/metrics_push.rs` | 301 | A4 | Metrics push |
| `util/toolkit/src/fetcher.rs` | 301 | D | Fetcher module root |
| `primitives/ledger/src/lib.rs` | 298 | A6 | Ledger primitive types |
| `ledger/src/common/types.rs` | 289 | A2 | Common ledger types |
| `util/toolkit/src/tx_generator/builder/builders/single_tx.rs` | 288 | D | Single TX builder |
| `util/toolkit/src/commands/update_ledger_parameters.rs` | 286 | D | Ledger parameter updates |
| `util/aiken-deployer/src/main.rs` | 283 | D | Aiken deployer |
| `util/toolkit/src/fetcher/fetch_storage.rs` | 274 | D | Fetch storage module |
| `primitives/mainchain-follower/src/data_source/federated_authority_observation.rs` | 273 | A6 | FA observation data source |
| `primitives/federated-authority-observation/src/lib.rs` | 271 | A6 | FA observation primitives |
| `util/toolkit/src/cli.rs` | 265 | D | CLI argument parsing |
| `util/toolkit/src/toolkit_js/encoded_zswap_local_state.rs` | 264 | D | Encoded state types |
| `node/src/cli.rs` | 261 | A3 | Node CLI definition |
| `ledger/helpers/src/versions/common/intent.rs` | 261 | D | Intent helpers |
| `util/toolkit/src/fetcher/compute_task.rs` | 260 | D | Compute task (filter_map site) |
| `pallets/system-parameters/rpc/src/lib.rs` | 260 | A5 | System parameters RPC |
| `node/src/rpc.rs` | 218 | A4 | RPC module registration |
| `runtime/src/session_manager.rs` | 118 | A5 | Authority rotation, session hooks |
| `runtime/src/beefy.rs` | 188 | A5 | BEEFY configuration |
| `runtime/src/check_call_filter.rs` | ~50 | A5 | SignedExtra call filter |

---

## Supplementary File Assignments

| Agent | Supplementary Files |
|-------|-------------------|
| Pallet agents (A1, A2) | `pallets/midnight/src/weights.rs`, `runtime/src/model.rs` |
| Ledger agent (A2) | `runtime/src/model.rs` |
| Node startup agent (A3) | `node/src/inherent_data.rs` (CreateInherentDataConfig struct for invariant validation) |
| Node consensus agent (A4) | `node/src/service.rs` (service initialization context for inherent provider tracing), `node/src/rpc.rs` (RPC subscription limit verification) |
| Ensemble agent | All of the above, plus `primitives/mainchain-follower/src/data_source/mod.rs`, `pallets/midnight-system/src/lib.rs` |

---

## Node Agent Scope Split

The node binary covers three distinct security surfaces. To avoid prompt saturation, it is split into two agents with focused responsibilities:

### A3 — Startup + Config

**Files:** `service.rs`, `command.rs`, `cfg/**`, `chain_spec/**`

**Primary checks:**
- Config struct invariant validation (§3.4 extended to off-chain config) — verify every struct in the "Consensus-Critical Configuration Structs" table below
- Genesis construction paths (§3.5) — online vs offline divergence, StorageInit construction sites
- Panic triage (Check 25) — configuration-variant triage table for all expect()/unwrap() in service.rs and command.rs
- Genesis parsing truncation (Check 26) — trace all genesis extrinsic decoding paths for silent truncation
- Feature-gated divergence (Check 16) — HostFunctions type aliases gated by features

### A4 — Consensus + Network

**Files:** `inherent_data.rs`, `main_chain_follower.rs`, `rpc.rs`, `extensions.rs`, `payload.rs`, remaining `node/src/*.rs`

**Primary checks:**
- ProposalCIDP vs VerifierCIDP asymmetry (§3.4) — field-by-field comparison, recomputation citations
- Parent header safety — expect_header reachability under pruning/reorg
- Data source pool sizing (§3.8) — pool construction, consumer count, contention analysis
- RPC subscription limits (Check 6) — per-connection caps in create_full
- SSL/TLS enforcement (Check 15) — trace PgPoolOptions builder chain for .ssl_mode()
- Mock data source toggle (Check 9) — runtime vs compile-time guard

---

## Verification Agent (V)

Dispatched after all primary agents return. Receives all collected agent outputs and mechanically validates completeness against the target profile and workflow requirements.

**Inputs:** All agent structured outputs, target profile, file inventory, vulnerability domain map, dispatch manifest.

**Checks:**
1. Dispatch completeness — every assigned agent dispatched and returned
2. Coverage gate — every >200-line file in priority-1/2 crates read by a §3-applying agent
3. Mandatory table presence — per-field event trace, struct diff, config-variant triage, genesis parsing paths, storage lifecycle pairing, toolkit matrix
4. Target profile config struct coverage — every struct in the table below appears in at least one agent's output
5. Table-derived finding extraction — mechanical scan of all mandatory tables for FAIL/DIFF/Missing/No cells
6. Error-path persistence audit — every StorageMap::insert site has an error-path assessment

**Output:** Gap report with re-dispatch recommendations, table-derived findings, coverage attestation.

---

## Consensus-Critical Configuration Structs

The following structs must be enumerated during reconnaissance and verified for invariant validation:

| Struct | Location | Required Invariants |
|--------|----------|-------------------|
| `CreateInherentDataConfig` | `node/src/inherent_data.rs` | `epoch_duration % slot_duration == 0`, `slot_duration > 0` |
| `ScSlotConfig` | External crate (`sidechain_slots`) | `slot_duration > 0` |
| `MainchainEpochConfig` | External crate (`sidechain_domain`) | `epoch_duration > 0` |
| `MidnightCfg` | `node/src/cfg/midnight_cfg/mod.rs` | `mc_epoch_duration_millis > 0`, `mc_slot_duration_millis > 0` |

---

## Serialization Deep-Scan Paths

Mechanical checks for serialization buffer pairing (Check 3) must include these directories where serialization mismatches are most likely:

- `ledger/src/versions/*/api/*.rs`
- `ledger/src/versions/common/mod.rs`
- `res/src/lib.rs`
- `ledger/helpers/src/lib.rs`

Zero hits on serialization checks in the ledger directory is a POSSIBLE FALSE NEGATIVE.

---

## Cross-Chain Pallets

Pallets that process inherent data from an external chain (subject to §3.10 timestamp DEFAULT-FAIL and §3.2 three-layer pagination verification):

- `pallets/native-token-observation/` — processes Cardano observations via db-sync

---

## Target-Specific Ensemble Blind-Spot Items

In addition to the 4 universal blind-spot items (§3.1 weight, §3.3 event filtering, §3.2 pagination, §2.10 serialization), the ensemble agent verifies these target-specific items:

| # | Item | What to Check | Key Files |
|---|------|--------------|-----------|
| 5 | §3.10 timestamp source | Search `pallet_timestamp` in NTO pallet; verify not used in cross-chain event/payload | `pallets/native-token-observation/src/lib.rs` |
| 6 | §3.4 VerifierCIDP recomputation | For each asymmetric type in ProposalCIDP vs VerifierCIDP, cite recomputation code | `node/src/inherent_data.rs` |
| 7 | §3.14 system tx type exhaustiveness | Search for wildcard `_ =>` match arms in `apply_system_transaction` | `ledger/src/versions/common/mod.rs`, `pallets/midnight-system/src/lib.rs` |
| 8 | Check 15: SSL/TLS mode | Trace `PgPoolOptions::new()` builder chain for explicit `.ssl_mode()` | `primitives/mainchain-follower/src/data_source/mod.rs` |
| 9 | Check 16: Host function divergence | Search feature-gated `HostFunctions` type aliases in service init | `node/src/service.rs` |
| 10 | §3.1 flush ordering | Enumerate ALL writes in `on_finalize` in execution order. Verify `flush_storage()` runs after the last state-modifying operation. Specifically: does `mint_coins` execute after `flush_storage`? | `pallets/midnight/src/lib.rs` |
| 11 | §3.6 absent-entity query semantics | For `get_contract_state` and `get_unclaimed_amount`, verify that a non-existent entity returns `Err(...)`, not `Ok(default)`. `None` mapped to `Ok(empty)` is FAIL. | `ledger/src/versions/common/mod.rs` |
| 12 | Check 25: Config-variant panic | For each `expect()`/`unwrap()` on `Option` from config/database accessor in `service.rs`, check: does `DatabaseConfig::InMemory` cause `.path()` to return `None`? | `node/src/service.rs` (A3 scope) |
| 13 | Check 26: Genesis extrinsics truncation | Trace genesis extrinsics decoding from chain spec properties. Does the parsing stop at the first invalid element? Produce path enumeration table. | `node/src/service.rs`, `node/src/command.rs` (A3 scope) |
| 14 | Error-path storage persistence | For `UtxoOwners::insert` in `handle_create`: if `construct_cnight_generates_dust_event` fails and handler returns `None`, does the insert persist? | `pallets/native-token-observation/src/lib.rs` |
| 15 | Toolkit item 2: canonical-state writeback | In `DustWallet::spend`/`do_spend`, verify `dust_local_state` is written back to `self` after `do_spend()` — not just the spent-UTXO tracker | `ledger/helpers/src/wallet/dust.rs` |

---

## Toolkit Focus Items

Target-specific checks for the Group D toolkit review agent. These supplement the generic 8-item checklist (resource 03) with known high-value check sites for this codebase.

| Item | Function/Pattern | File | What to Check |
|------|-----------------|------|---------------|
| 1 | `wallet.update_state_from_tx(tx)` | `ledger/helpers/src/context.rs` | Does it check `TransactionResult::Success` vs `Failure`? |
| 2 | `DustWallet::spend` / `do_spend` | `ledger/helpers/src/wallet/dust.rs` | Is `dust_local_state` written back after `do_spend()` modifies a clone? Check BOTH spent-UTXO tracker AND underlying state. |
| 3 | `update_from_tx`, `update_from_block` | `ledger/helpers/src/context.rs` | Do `well_formed().expect()` or `post_block_update().expect()` execute under `Mutex::lock()`? |
| 4 | `IntentCustom::build` | `ledger/helpers/src/intent.rs` | `read_to_end` without size limit |
| 4 | `Cfg::load_spec` | `node/src/cfg/mod.rs` | `std::fs::read` without type or size checks |
| 5 | `calculate_offer_deltas` | `ledger/helpers/src/offer.rs` | Is `u128 as i128` safe for values > `i128::MAX`? |
| 5 | `increment_seed` | `ledger/helpers/src/wallet/mod.rs` | Can `num + 1` wrap at `u128::MAX`? |
| 6 | `save_intents_to_file` | `ledger/helpers/src/transaction.rs` | Serialization failures logged but not returned |
| 7 | `ShieldedWallet::from_path` | `ledger/helpers/src/wallet/shielded.rs` | Does not reject non-`Role::Zswap` paths |
| 7 | `DustWallet::from_path` | `ledger/helpers/src/wallet/dust.rs` | Does not reject non-`Role::Dust` paths |
| 8 | `TransactionWithContext::new` | `ledger/helpers/src/context.rs` | `SmallRng::seed_from_u64(parent_block_hash_seed)` produces predictable block hash entering transaction construction |

---

## Vulnerability Domain Hints

Pre-identified vulnerability domain targets for this codebase. The `map-vulnerability-domains` skill uses these as seed hints during reconnaissance. They accelerate domain mapping but do not replace dynamic analysis.

| §3 Class | Trigger Location | Pattern |
|----------|-----------------|---------|
| §3.1 Flush ordering | `pallets/midnight/src/lib.rs` on_finalize | `flush_storage()` followed by `mint_coins()` and `StateKey::put()` |
| §3.2 Unpaired storage | `pallets/native-token-observation/` UtxoOwners | insert in handle_create, no remove in handle_spend |
| §3.3 Partial-success events | `pallets/midnight/src/lib.rs` send_mn_transaction | `call_addresses`, `deploy_addresses`, `maintain_addresses` populated unconditionally |
| §3.4 Provider asymmetry | `node/src/inherent_data.rs` | ProposalCIDP has `runtime_upgrade_proposal`, VerifierCIDP does not |
| §3.5 Genesis divergence | `node/src/command.rs` | Online uses chain_spec properties, offline uses `UndeployedNetwork.genesis_state()` |
| §3.8 Shared pool | `primitives/mainchain-follower/src/data_source/mod.rs` | 5-connection pool shared across 7+ consumers |
| §3.14 Wildcard dispatch | `ledger/src/versions/common/mod.rs` get_system_tx_type | `_ => "unknown"` on SystemTransaction match |

---

## Severity Calibration Benchmark

The following calibration examples are derived from a professional security audit of this codebase at the same commit. Use these as severity anchors — if your scoring diverges by 2+ levels from these benchmarks, re-evaluate.

| Finding Pattern | I | F | Avg | Severity | Reasoning |
|-----------------|---|---|-----|----------|-----------|
| Shared connection pool (5 conns, RPC + consensus) | 4 | 3 | 3.5 | **Critical** | Pool size < consumer count; RPC access (F=3) can exhaust all connections during block production. |
| Mock data source via env var toggle | 4 | 2 | 3.0 | **Medium** | Requires config control — not Critical. |
| Parent header `unwrap()` in inherent creation | 3 | 4 | 3.5 | **High** | Pruning/reorgs trigger passively — not Low. |
| Feature-gated genesis digest divergence | 4 | 2 | 3.0 | **Medium** | Heterogeneous builds unlikely — not Critical. |
| Fixed-seed RNG 0x42 in treasury minting | 4 | 3 | 3.5 | **High** | Seed is public constant, observation is trivial. |
| Chain spec `unwrap()` on malformed properties | 3 | 3 | 3.0 | **Medium** | Config file control is routine. |
| Startup panic on chain spec `unwrap()` | 3 | 3 | 3.0 | **Medium** | CI pipelines, manual edits, distribution channels all produce malformed specs. F >= 3. |
| Panic on missing parent header (pruning) | 3 | 4 | 3.5 | **High** | Database pruning and reorgs are normal operation — F=4. |
| Shared connection pool (N conns, RPC + consensus) | 4 | 3 | 3.5 | **Critical** | Single RPC burst during block production is routine. |
| Incomplete Ord in consensus-sorted collection | 4 | 3 | 3.5 | **High** | Field collisions statistically expected at blockchain volumes. |
| Config struct missing mathematical invariant | 4 | 3 | 3.5 | **High** | Config errors are operational hazards, not exotic attacks. |
| Panic on DB path when InMemory config used | 3 | 3 | 3.0 | **Medium** | InMemory is a valid, supported config mode; crash occurs on every startup attempt with this config. F >= 3. |
| Genesis extrinsics parsing truncation on malformed input | 3 | 3 | 3.0 | **Medium** | Chain spec distribution is not privileged; malformed prefix alters extrinsics root. F >= 3. |
| DustWallet canonical state not written back after spend | 2 | 2 | 2.0 | **Low** | Requires incorrect wallet API usage sequence; affects local state only. |
| Storage insert persists on downstream event construction failure | 3 | 3 | 3.0 | **Medium** | Orphaned entries accumulate; trigger is external chain data which is not attacker-controlled. |

