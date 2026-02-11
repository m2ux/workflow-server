# Target Profile: midnight-node

This profile contains target-specific configuration for auditing the midnight-node codebase. The core workflow rules are target-agnostic; this profile provides the crate-specific file paths, struct names, wave assignments, and calibration data that vary per target.

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

