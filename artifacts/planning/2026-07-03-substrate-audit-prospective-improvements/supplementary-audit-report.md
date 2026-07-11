# Supplementary Security Audit Report — midnight-node

| Field | Value |
|-------|-------|
| Target | `midnight-node` (main) |
| Commit | `88eafaff1d641068446775db8593249eb126cfc9` |
| Date | 2026-07-03 |
| Basis | Supplement to the primary [`05-audit-report.md`](https://github.com/shieldedtech/midnight-agent-eng/blob/mike/.engineering/artifacts/planning/2026-07-03-substrate-node-security-audit/05-audit-report.md) (`substrate-node-security-audit` v3.7.0, 52 findings, same commit) |
| Method | Codebase survey + direct source verification at the pinned commit; every candidate de-duplicated against the primary audit's 52 findings |
| Scope | Findings **present on main and not already in the primary audit**: the unaudited `relay/` crate, plus additional observations on the pallet surface the primary audit reviewed |

---

## 1. Executive Summary

The primary audit reviewed 52 findings at this commit. This supplement adds only what is **present on main and not already covered there**, in two groups: (a) the `relay/` crate (`midnight-beefy-relay`), a first-party binary the primary audit did not include in its scope (§2.1) or crate inventory; and (b) five lower-severity observations on the pallet surface the primary audit did review but did not report. Every item was verified against source at `88eafaff` and calibrated to the primary audit's Impact × Feasibility rubric; several candidates were **discarded on verification** as non-issues (§4.3).

The headline is a negative result worth stating plainly: after de-duplication, nothing here is High or Critical. The primary audit caught every material defect on the surface it examined. The residual is one unaudited off-chain component (whose own issues are Low) and a handful of minor hardening items.

### Severity Distribution

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 4 |
| Informational | 5 |
| **Total** | **9** |

### Headline Findings

- **The `relay/` binary was never audited.** It provisions BEEFY signing keys into a node and turns BEEFY justifications into the authority-set proofs the Cardano bridge consumes, yet it is absent from the primary audit's scope. Reviewing it surfaced three Low findings — no transport security on the node connection that carries a secret BEEFY seed and the consensus data proofs are built from (S-1), a subscription loop that dies on the first transient stream error (S-2), and key provisioning that reports success even when every insertion failed (S-3) — plus an Informational maturity flag (S-6): the crate ships with blanket `#![allow(dead_code)]` and an unwired MMR-proof path.
- **Five minor pallet observations the primary audit did not report:** a `dust_public_key` accepted at registration with no format/range validation (S-4, Low); a dynamic-weight helper that falls back to a fixed constant on cost-computation failure (S-5); a Cardano block-timestamp truncated ms→s without a staleness bound (S-7); a subminimal-transfer accumulator whose `saturating_add` would corrupt the flushed amount at saturation (S-8); and a governance RPC that serializes candidates with `unwrap_or_default()`, silently returning empty data on a serialization failure (S-9).

### Methodology Overview

Findings were produced by surveying the code and then verifying each candidate against source at the pinned commit — a step that matters: it removed six candidates that duplicate primary-audit findings, one covered by F-6, and three that the code already handles safely (§4.3). Severities use the primary audit's rubric and calibration benchmarks, so the two reports compose. Because this targets main, surfaces that exist only on the in-flight `feat/1474-expose-ledger-events` branch (a different commit) are out of scope and listed in §4.4.

---

## 2. Scope and Methodology

### 2.1 Scope

This supplement covers two categories of finding, both **on main at `88eafaff`** and both **absent from the primary audit's 52 findings**:

- **The `relay/` crate** — `main.rs`, `relayer.rs`, `beefy_keys.rs`, `authorities.rs`, `justification.rs`, `cardano_encoding.rs`, `helper.rs`, `error.rs`. The primary audit's §2.1 in-scope list (`pallets/`, `runtime/`, `node/src/`, `primitives/`, `ledger/`, `util/{toolkit,aiken-deployer,aiken-contracts-lib}`) and its §2.4 crate inventory both omit it. It is a first-party workspace member (`relay/Cargo.toml`, `name = "midnight-beefy-relay"`) that handles BEEFY signing keys and drives the Cardano bridge proof path, so it belongs on the audited surface.
- **Additional pallet observations** — items on `pallets/{cnight-observation, c2m-bridge, midnight, system-parameters}` that the primary audit's agents reviewed (A1/A2/A5/A7) but did not report. These are additive to, not corrections of, the primary findings on those crates.

**Out of scope:** the primary audit's exclusions stand, and — per the directive to target main — anything that exists only on the `feat/1474-expose-ledger-events` branch is excluded (§4.4).

### 2.2 How These Findings Were Derived

Candidates came from a targeted survey; each was then confirmed by reading source at `88eafaff`. Line numbers are at that commit. Because the survey was run against a feature branch, its line numbers did not match main (e.g. `handle_user_transfer` sits ~25 lines later on the branch); all citations here were re-derived from the main sources. No compilation or dynamic analysis was available.

### 2.3 Severity Scoring

Identical to the primary audit: Impact (1 none … 4 consensus/fund/halt) × Feasibility (1 physical/multi-failure … 4 normal/passive), mapped 1.0–1.5 Informational, 2.0–2.5 Low, 3.0 Medium, 3.5 High, 4.0 Critical, with the benchmark floor and the operational-hazard / shared-resource F ≥ 3 rules. Where the originating survey proposed a higher severity, it was recalibrated to this rubric (as the primary audit did with its own survey inputs); the recalibration is stated in the finding.

---

## 3. Findings

Ordered by severity, then grouped relay-first within a tier. Line numbers are at the audited commit.

### Low

#### Issue S-1: The relayer has no transport security for key provisioning or consensus-data retrieval

The relayer builds every node connection with no transport security: `Relayer::new` uses `OnlineClient::from_insecure_url` and `RpcClient::from_url`, the CLI default is a plaintext `ws://localhost:9933`, and there is no `wss`/TLS path anywhere in the crate. That one unauthenticated channel carries two sensitive payloads. During `--keys-path` provisioning, `insert_key_query` passes the BEEFY **secret seed** `self.suri` as an `author_insertKey` parameter, so the seed crosses the wire in cleartext. During relaying, the same connection supplies the BEEFY justifications and the runtime `validator_set()` from which the Cardano-bound authorities proof is built. Against a local node this is benign, but the tool accepts an arbitrary `--node-url` with no way to enable TLS, so any remote or cross-host deployment discloses validator key material and trusts unauthenticated consensus inputs. The primary audit flagged the same `from_insecure_url` class in an off-chain toolkit command (F-50) — this is that pattern on a component that handles a *real* signing seed rather than inert dev-key defaults.

**Impact:** 3 — On a non-local deployment, a disclosed `suri` is BEEFY signing-key material and a MITM'd validator set feeds a wrong authority root into the cross-chain proof; bounded below consensus-halt because the downstream Cardano verifier holds its own authority set and BEEFY is a supermajority scheme (escalates toward I=4 if the leaked key or forged inputs are consumed).

**Feasibility:** 2 — Requires a network position on the operator's relayer↔node link or a non-local deployment; the default is loopback (F→1), and it rises to F=3 on a genuinely untrusted network, which the tool permits with no TLS option.

**Severity:** Low (I=3, F=2) — one notch above the analogous F-50 (Informational) because the relayer transmits a real signing seed; escalates to Medium/High if operated across an untrusted network.

**Category:** External Connection Security / Cryptographic Key Handling

**Affected Files:** [`relay/src/relayer.rs`#33-41](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/relayer.rs#L33-L41), [`relay/src/beefy_keys.rs`#44-53](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/beefy_keys.rs#L44-L53), [`relay/src/main.rs`#31](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/main.rs#L31)

**Suggested Remediation:** Support a `wss`/TLS endpoint with certificate verification (replace `from_insecure_url` with the secure constructor) and refuse to transmit a `suri` over a non-loopback plaintext connection; document that key provisioning must run against a local or TLS-terminated node.

---

#### Issue S-2: A single transient subscription error terminates the relayer; the restart loop only covers connect failures

The driver in `main` is `loop { match Relayer::new(..) { Err(e) => log::error!(..), Ok(relayer) => relayer.run_relay_by_subscription().await? } }`. The `?` on the `Ok` arm propagates any error out of `run_relay_by_subscription` and out of `main`, so the process exits. Inside that function the stream is drained with `let justification = result?;` and `handle_justification_stream_data(..).await?`, which returns `Err` on a scale-decode failure. So a single undecodable justification, or a routine dropped/`Err` stream item, tears down the whole process; the surrounding `loop` provides no resilience because it only re-enters when `Relayer::new` itself fails.

**Impact:** 2 — Off-chain bridge-relay liveness: proof production stops until an operator or supervisor restarts the daemon; the node and chain are unaffected.

**Feasibility:** 3 — A malformed justification or a dropped subscription is a routine, passive occurrence, no attacker required.

**Severity:** Low (I=2, F=3)

**Category:** Error Handling / Availability (off-chain)

**Affected Files:** [`relay/src/main.rs`#52-59](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/main.rs#L52-L59), [`relay/src/relayer.rs`#44-60](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/relayer.rs#L44-L60)

**Suggested Remediation:** Log and continue on a per-justification decode error, and move the `?` off the loop body so a stream/connection error re-enters the reconnect loop (with backoff) instead of exiting the process.

---

#### Issue S-3: BEEFY key provisioning reports success even when every insertion failed

`read_and_insert_to_chain` iterates the key file, calls `key_info.insert_key().await` per entry, and returns `Ok(())` unconditionally. `insert_key` returns `()`: an RPC-connect failure is `log::warn!`-ed and swallowed, and `insert_key_query` does the same on an `author_insertKey` error. No success count is kept and no error propagates, so a run in which the node is unreachable, `author_insertKey` is disabled (it is an unsafe RPC), or every key is rejected is indistinguishable from a fully successful run. `main` compounds this: it only `log::error!`s the top-level result, then enters the relay loop regardless — so a relayer with no usable BEEFY key silently produces nothing.

**Impact:** 2 — Operator-tooling correctness: the relayer can run with no signing key while appearing provisioned, yielding a silently non-functional bridge relay.

**Feasibility:** 2 — Requires an insertion failure — an unreachable node, a disabled unsafe RPC, or a rejected key.

**Severity:** Low (I=2, F=2)

**Category:** Error Handling (silent failure) / Observability

**Affected Files:** [`relay/src/beefy_keys.rs`#22-53](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/beefy_keys.rs#L22-L53), [`relay/src/main.rs`#46-50](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/main.rs#L46-L50)

**Suggested Remediation:** Make `insert_key`/`insert_key_query` return `Result`, count successful insertions, and surface a non-zero-failure outcome (fail provisioning, or refuse to start the relay loop when no key was installed).

---

#### Issue S-4: cnight-observation accepts a `dust_public_key` at registration with no format or range validation

`handle_registration` destructures `RegistrationData { cardano_reward_address, dust_public_key }` and inserts the key straight into `Mapping` (`Mapping::<T>::insert(cardano_reward_address, utxo_id, dust_public_key.clone())`); the only logic applied is the uniqueness diff (0→1 / 1→2+) that drives the `Registration`/`Deregistration` events. Beyond the length bound of the `DustPublicKeyBytes` type itself, the key is never checked for being a well-formed curve point / field element. Any validation therefore currently depends on the off-chain inherent-data provider; at the pallet trust boundary the value is accepted as-is and later handed to `construct_cnight_generates_dust_event` (which is where a malformed key would surface, and where it is handled by returning `None`). This is the observed-data input-validation class the primary audit rated at Low elsewhere (F-13 quantity sign, F-14 datum decode).

**Impact:** 3 — An invalid registered key produces a `Mapping`/`MappingAdded` entry that can never yield DUST and adds event-stream noise for indexers; it does not corrupt consensus state.

**Feasibility:** 2 — The key arrives as observed mainchain data that every validator field-compares in `check_inherent`; it is not an unprivileged-attacker injection point.

**Severity:** Low (I=3, F=2) — recalibrated from the survey's Medium to match the primary audit's treatment of observed-data validation (F-14).

**Category:** Input Validation (trust boundary) / Defense in Depth

**Affected Files:** [`pallets/cnight-observation/src/lib.rs`#461-498](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/pallets/cnight-observation/src/lib.rs#L461-L498)

**Suggested Remediation:** Validate `dust_public_key` at registration (well-formed curve point / field-element range) and reject or skip malformed entries, or document that validation is delegated to the inherent-data provider and assert it there; this mirrors the Fr-range filtering being added on the observation path.

---

### Informational

#### Issue S-5: pallet-midnight `get_tx_weight` falls back to a fixed constant when ledger cost computation fails

`get_tx_weight` computes `get_transaction_cost(tx).map(Weight::from_parts).unwrap_or(EXTRA_WEIGHT_TX_SIZE) + ConfigurableTransactionSizeWeight::get()`. On any `get_transaction_cost` error it substitutes the fixed `EXTRA_WEIGHT_TX_SIZE` (20 ×10⁹ ref-time). If actual execution cost ever exceeds that constant on the failure path, the transaction is weight-under-charged. The fallback is a large constant and cost-computation failure is not a normal condition, so this is a hardening note rather than a demonstrated defect; it is adjacent to the primary audit's weight findings (F-25 placeholder `weights.rs`, F-35 zero version-weight) but is a distinct mechanism neither covers.

**Impact:** 3 — Potential per-transaction weight under-accounting on the cost-computation failure path (block-fullness / availability class).

**Feasibility:** 1 — Requires the `get_transaction_cost` error path, and only bites if the constant fallback is below true cost.

**Severity:** Informational (I=3, F=1)

**Category:** Pallet Weights

**Affected Files:** [`pallets/midnight/src/lib.rs`#629-634](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/pallets/midnight/src/lib.rs#L629-L634)

**Suggested Remediation:** Confirm `EXTRA_WEIGHT_TX_SIZE` is a conservative upper bound for the failure path, or reject the transaction (return a max-weight / error) rather than proceeding with a possibly-low estimate.

---

#### Issue S-6: The relay crate is not feature-complete — blanket dead-code allowance and an unwired MMR-proof path

Every relay module opens with `#![allow(dead_code)]`, suppressing the compiler's own signal about unfinished wiring. Concretely, `Relayer::get_mmr_proof` is implemented but never called on the subscription path (`handle_justification_stream_data` builds only the authorities proof), and `choose_params` returns a `best_block` its sole caller discards (`let (_best_block, at_block_hash) = ..`). The MMR proof is one half of a typical BEEFY→Cardano light-client proof, so the emitted `RelayChainProof` may be incomplete relative to what a Cardano verifier ultimately needs. Reviewers should treat the crate as not production-complete.

**Impact:** 1 — No direct security impact; a maturity signal that bounds the assurance the crate can currently carry.

**Feasibility:** 1 — n/a (static observation).

**Severity:** Informational (I=1, F=1)

**Category:** Code Maturity

**Affected Files:** [`relay/src/relayer.rs`#86-125](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/relayer.rs#L86-L125), [`relay/src/authorities.rs`#1](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/relay/src/authorities.rs#L1)

**Suggested Remediation:** Remove the blanket `#![allow(dead_code)]`, wire or delete `get_mmr_proof`, and confirm the emitted proof matches what the Cardano verifier consumes before relying on the relayer in production.

---

#### Issue S-7: Cardano block timestamp truncated milliseconds→seconds with no staleness bound

In `process_tokens`, the observed Cardano block timestamp is converted with `let now = utxo.header.tx_position.block_timestamp.0 as u64 / 1000` and passed to `construct_cnight_generates_dust_event` as the DUST event time. The truncation is deliberate and documented (a comment notes Cardano timestamps are integer-valued in practice for preview/preprod/mainnet), and the value is observed mainchain data that every validator field-compares in `check_inherent`, so it is neither attacker-controlled nor a precision defect in practice. It is recorded as Informational because there is no explicit staleness/relationship check between this externally-sourced time and the local block time.

**Impact:** 1 — No demonstrated security impact; DUST events carry a second-precision, externally-sourced timestamp by design.

**Feasibility:** 1 — The value is consensus-checked observed data, not an injection point.

**Severity:** Informational (I=1, F=1)

**Category:** External Data Handling

**Affected Files:** [`pallets/cnight-observation/src/lib.rs`#694-701](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/pallets/cnight-observation/src/lib.rs#L694-L701)

**Suggested Remediation:** No change required if the documented assumption holds; if a bound is desired, assert the observed time against the local block time and reject implausible values.

---

#### Issue S-8: Subminimal-transfer accumulator uses `saturating_add`; saturation would corrupt the flushed amount

`handle_subminimal_transfer` accumulates `sum = sum.saturating_add(transfer.amount)` and, when `sum > flush_threshold`, flushes `construct_unlock_to_treasury_system_tx(sum)` and emits `SubminimalFlushTransfer { amount: sum, .. }`. If `sum` ever saturated at `u64::MAX`, the flushed amount and event would be wrong. A `// Safe, because all existing cNight fits in u64` comment records the bounding assumption — total cNIGHT supply cannot drive `sum` to saturation before the far-lower `flush_threshold` fires — so this is a documented-invariant note, not a reachable defect. (Distinct from F-29, which concerns the *c2m-bridge counter* nonce.)

**Impact:** 2 — A wrong flushed amount would misstate a treasury unlock, but only in the saturation regime the supply bound precludes.

**Feasibility:** 1 — Requires `sum` to approach `u64::MAX`, which the total-supply bound makes unreachable.

**Severity:** Informational (I=2, F=1)

**Category:** Arithmetic / State Consistency

**Affected Files:** [`pallets/c2m-bridge/src/lib.rs`#285-301](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/pallets/c2m-bridge/src/lib.rs#L285-L301)

**Suggested Remediation:** No functional change required; optionally assert the supply invariant in code (e.g. `debug_assert`/`ensure!` that `sum` stays below a documented ceiling) so the bounding assumption is enforced rather than only commented.

---

#### Issue S-9: system-parameters RPC serializes candidates with `unwrap_or_default()`, silently returning empty data on failure

`get_ariadne_parameters` builds its response with `serde_json::to_value(c).unwrap_or_default()` for each permissioned candidate and `serde_json::to_value(&ariadne_params.candidate_registrations).unwrap_or_default()`. On a serialization failure this yields an empty/`null` JSON value rather than an RPC error, so a client would silently receive empty candidate data. In practice `to_value` on these well-typed values effectively never fails, so this is an Informational robustness note on a read-only query endpoint.

**Impact:** 2 — A serialization failure would silently return empty candidate data instead of an error (query-endpoint correctness/observability).

**Feasibility:** 1 — `to_value` on these types effectively never fails.

**Severity:** Informational (I=2, F=1)

**Category:** Error Handling (silent default)

**Affected Files:** [`pallets/system-parameters/rpc/src/lib.rs`#256-263](https://github.com/midnightntwrk/midnight-node/blob/88eafaff1d641068446775db8593249eb126cfc9/pallets/system-parameters/rpc/src/lib.rs#L256-L263)

**Suggested Remediation:** Propagate a serialization error as an RPC error rather than substituting a default, so a client can distinguish "no candidates" from "serialization failed".

---

## 4. Relationship to the Primary Audit

This section is the full disposition of the fifteen survey items against the primary audit's 52 findings, plus the four relay items. Only findings **present on main and not already in the primary audit** became findings above (§4.2); the rest are cross-referenced (§4.1), verified as non-issues (§4.3), or excluded as not-on-main (§4.4).

### 4.1 Already in the primary audit — remediate via the referenced finding

| # | Survey item | Primary finding |
|---|---|---|
| 1 | c2m-bridge silences `execute_system_transaction` / serialize errors → fund-flow | **F-1** (High) + **F-26** (Low) |
| 2 | c2m-bridge min-amount read failure falls through to regular handling | **F-27** (Low) |
| 3 | cnight-observation DUST system-tx construction failure returns `Ok` after cursor advance | **F-22** (Medium) |
| 6 | system-parameters `update_d_parameter` accepts `(0,0)` → empty committee | **F-2** (Low) |
| 8 | c2m-bridge approval consumed (`take`) before the fallible execution | **F-1** (High) |
| 9 | cnight-observation `handle_create/spend` event-construction skip | **F-6** (Low) — and the survey itself concluded the code is correct |
| 11 | pallet-midnight `initialize_state` `//todo`, unbounded StateKey | **F-12** (Low) |

The primary audit's severities are the adversarially-verified ones: the survey's CRITICAL/HIGH ratings for items 1–3 were recalibrated there to High/Low/Medium respectively.

### 4.2 New in this report (present on main, not in the primary audit)

| Finding | Survey item | Component | Severity |
|---|---|---|---|
| S-1 | — | `relay/` transport (key seed + consensus data over plaintext) | Low |
| S-2 | — | `relay/` subscription error terminates the process | Low |
| S-3 | — | `relay/` silent BEEFY key-provisioning failure | Low |
| S-4 | 4 | cnight-observation `dust_public_key` unvalidated at registration | Low |
| S-5 | 12 | pallet-midnight `get_tx_weight` fixed fallback | Informational |
| S-6 | — | `relay/` crate not feature-complete (dead code, unwired MMR) | Informational |
| S-7 | 7 | cnight-observation timestamp ms→s truncation | Informational |
| S-8 | 10 | c2m-bridge subminimal `saturating_add` accumulator | Informational |
| S-9 | 14 | system-parameters RPC `unwrap_or_default()` serialization | Informational |

### 4.3 Verified non-issues (present on main, but the code already handles them)

Confirmed against source and therefore **not** findings:

- **Survey item 5 — nonce collision in cnight-observation `UtxoOwners`.** The nonce is `T::Hashing::hash([b"asset_create", utxo_tx_hash, utxo_tx_index])`; both create and spend derive it from the globally-unique Cardano `(tx_hash, index)`, so a collision requires a cryptographic hash collision. The survey itself concluded it is safe under Cardano UTXO uniqueness. (The primary audit's F-29 concerns a different nonce — the c2m-bridge `TransferCounter`.) `pallets/cnight-observation/src/lib.rs`#564-567, 593-596.
- **Survey item 13 — get_state RPC "information leak".** The v1 path deliberately maps all errors to the generic `UnableToGetContractState` (documented legacy-compat), while v2 surfaces `ContractNotPresent`. Contract presence is public chain state queryable by anyone, so there is no confidentiality boundary to leak across. `pallets/midnight/rpc/src/lib.rs`#299-315.
- **Survey item 15 — throttle window reset under reorg.** The window uses `current_block.saturating_sub(usage.window_start) >= window_size`; `saturating_sub` makes a block-number rewind (reorg) collapse to `0` rather than wrongly resetting, so the logic is reorg-safe. The survey itself concluded it "should be safe." (The primary audit's F-8 covers the real throttle issue — unbounded `AccountUsage` growth — and F-23 covers the related CardanoPosition window-jump.) `pallets/throttle/src/check_throttle.rs`#121-129.

Also discarded during the relay review, for completeness: the Merkle tree on an empty validator set errors via `tree.root().ok_or(..)` rather than panicking (`authorities.rs`#48-52); missing BEEFY payloads fail closed via `ok_or` (`justification.rs`#37-49); and key insertion is a sequential loop, not an unbounded concurrent fan-out (`beefy_keys.rs`#27-29).

### 4.4 Excluded — not present on main

Per the directive to target main, surfaces that exist only on the in-flight `feat/1474-expose-ledger-events` branch (a different commit) are excluded here and belong to a branch-scoped review when that feature merges: the ledger-events V2 types (`LedgerEvent { content_tagged_bytes }`, `Vec<LedgerEvent>` host-function returns and their input-size bounds) and the `node/src/genesis/creation/*` restructure (ICS/reserve amount casts and asset-identity checks) do **not** exist at `88eafaff`. Separately, the primary audit already covers the toolkit/aiken candidates a broader survey raised — coin-selection builder panics (**F-51**) and the aiken-deployer unbounded reads / address-parse panics (**F-52**) — and the vendored `partner-chains/` SDK (committee selection, Plutus datum) remains a deliberate scope exclusion.
