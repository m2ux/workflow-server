# Mandatory Toolkit Minimum Checklist

## Scope

Apply this checklist to ALL files in:
- `ledger/helpers/src/*.rs`
- `util/toolkit/src/**/*.rs`

This checklist is mandatory even at priority 11 (off-chain tooling). In validated audit sessions, toolkit code is consistently the most under-reviewed area, leaving a cluster of Low-severity findings undetected.

## Checklist

### 1. State Modification on Failure

For every function that modifies state (`self.xxx = ...`, `state.xxx = ...`):

- [ ] Is the modification conditional on operation success?
- [ ] Specifically: does `wallet.update_state_from_tx(tx)` check `TransactionResult::Success` vs `TransactionResult::Failure`?
- [ ] If wallets are updated on failure, local balances diverge from ledger state

**Anti-pattern:**
```rust
// BAD: unconditional wallet update
let result = apply_transaction(tx);
wallet.update_state_from_tx(tx); // runs even on Failure
```

### 2. State Mutation Completeness

For every function that modifies a clone or local copy of state:

- [ ] Is the modified state written back to `self` or the source of truth?
- [ ] Specifically: in wallet `spend()` / `do_spend()`, does `do_spend()` apply changes to a cloned state that is then discarded?
- [ ] If `self.dust_local_state` is not updated after `spend()`, subsequent calls select already-spent outputs

**Anti-pattern:**
```rust
// BAD: modified clone not written back
fn spend(&mut self) -> Vec<Spend> {
    let spends = self.do_spend(); // modifies internal clone, not self
    self.spent_utxos.extend(spends.nullifiers());
    spends // self.dust_local_state unchanged!
}
```

**Wallet spend deep-check (v4.7 — validated false-PASS):**

For EVERY wallet function named `spend`, `do_spend`, or `speculative_spend`:
1. Identify the state object modified during spend computation (e.g., `dust_local_state`)
2. Trace whether the modified state is WRITTEN BACK to `self` or only returned as a value
3. Check for TWO separate state aspects:
   - (a) The **spent-UTXO tracker** (e.g., `spent_utxos`, `nullifiers`) — is this extended?
   - (b) The **underlying local state** (e.g., `dust_local_state`, `coin_state`) — is this updated?
4. A function that extends the spent-UTXO tracker (a) but does NOT update the underlying local state (b) will cause subsequent spend calls to select already-spent outputs from the stale state.

In Session 17, the D agent marked DustWallet::spend as PASS on Item 2 because `spent_utxos` is extended. However, `dust_local_state` is NOT updated — the clone-and-modify pattern in `do_spend` modifies a local clone that is discarded on return. This is a false PASS.

### 3. Mutex Poisoning Risk

For every `Mutex::lock()` followed by `.expect()` or `.unwrap()`:

- [ ] Could the `expect()`/`unwrap()` panic while the mutex is held?
- [ ] If using `std::sync::Mutex`, a panic poisons the mutex permanently
- [ ] Is validation/cost calculation performed BEFORE acquiring the lock?

**Specific checks:**
- `update_from_tx`: does `well_formed().expect()` execute under lock?
- `update_from_block`: does `post_block_update().expect()` execute under lock?

### 4. Unbounded File I/O

For every `std::fs::read`, `read_to_end`, or `read_to_string`:

- [ ] Is there a file type check (`metadata.file_type().is_file()`)?
- [ ] Is there a size limit before allocation (`metadata.len() < MAX`)?
- [ ] Could the path resolve to a device file (`/dev/zero`), FIFO, or symlink?

**Specific checks:**
- `IntentCustom::build`: `read_to_end` without size limit
- `Cfg::load_spec`: `std::fs::read` without type or size checks
- `save_intents_to_file`: error on write silently consumed

### 5. Unchecked Arithmetic on Financial Values

For every arithmetic operation on token/balance/financial values:

- [ ] Is it `checked_add` / `checked_sub` / `checked_mul` (not `+`, `-`, `*`)?
- [ ] Are `as` casts replaced with `try_from` (not `u128 as i128`)?
- [ ] Specifically: in `calculate_offer_deltas`, is `u128 as i128` safe for values > `i128::MAX`?
- [ ] In `increment_seed`, can `num + 1` wrap at `u128::MAX`?

### 6. Silent Error Consumption

For every function that returns `()` or logs-and-continues on error:

- [ ] Should the error be propagated to the caller?
- [ ] Would the caller benefit from knowing about the failure?
- [ ] Specifically: `save_intents_to_file` — serialization failures are logged but not returned

**Anti-pattern:**
```rust
// BAD: caller sees success even when intents are lost
fn save_intents_to_file(&self) {
    for intent in &self.intents {
        match serialize(intent) {
            Ok(bytes) => file.write_all(&bytes),
            Err(e) => println!("error: {e}"), // silent drop
        }
    }
}
```

### 7. Wallet Constructor Validation

For every wallet constructor (`from_path`, `from_seed`):

- [ ] Does it validate that `DerivationPath.role` matches the wallet type?
- [ ] `ShieldedWallet::from_path` should reject non-`Role::Zswap` paths
- [ ] `DustWallet::from_path` should reject non-`Role::Dust` paths
- [ ] Invalid roles produce noncanonical wallet material that breaks recovery

## Expected Findings

Applying this checklist to a typical Substrate node's toolkit code consistently surfaces Low-severity findings covering state management, arithmetic safety, and file I/O bounds.
