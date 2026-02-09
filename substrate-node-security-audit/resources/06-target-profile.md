# Target Profile: midnight-node

This profile contains target-specific configuration for auditing the midnight-node codebase. The core workflow rules are target-agnostic; this profile provides the crate-specific file paths, struct names, wave assignments, and calibration data that vary per target.

When auditing a different Substrate node, replace this profile with target-appropriate values.

---

## Wave Dispatch Assignments

### Wave 1 — Highest-Priority Crates + Groups B and D
- **A1:** NTO pallet (`pallets/native-token-observation/`)
- **A2:** Midnight pallet + ledger (`pallets/midnight/`, `pallets/midnight-system/`, `ledger/`)
- **A3:** Node binary (`node/`)
- **B:** Static analysis (all in-scope)
- **D:** Toolkit (`ledger/helpers/`, `util/toolkit/`, `util/upgrader/`)

### Wave 2 — Remaining Crates (Combined per v4.6 Hybrid Dispatch)
- **A4:** Runtime + upgrade + version (`runtime/`, `pallets/upgrade/`, `pallets/version/`)
- **A5:** All primitives (`primitives/`)

---

## Supplementary File Assignments

| Agent | Supplementary Files |
|-------|-------------------|
| Pallet agents (A1, A2) | `pallets/midnight/src/weights.rs`, `runtime/src/model.rs` |
| Ledger agent (A2) | `runtime/src/model.rs` |
| Node agent (A3) | `node/src/inherent_data.rs` (ProposalCIDP vs VerifierCIDP comparison) |
| Ensemble agent | All of the above, plus `primitives/mainchain-follower/src/data_source/mod.rs`, `pallets/midnight-system/src/lib.rs` |

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

