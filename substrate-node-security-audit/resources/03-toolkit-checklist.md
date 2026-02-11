# Mandatory Toolkit Minimum Checklist

## Scope

Apply this checklist to ALL files in the toolkit paths specified by the target profile. This checklist is mandatory even for off-chain tooling crates.

If the target profile includes a "Toolkit Focus Items" section, apply those target-specific checks in addition to the generic items below.

## Checklist

### 1. State Modification on Failure

For every function that modifies state (`self.xxx = ...`, `state.xxx = ...`):

- [ ] Is the modification conditional on operation success?
- [ ] If state is updated regardless of success/failure, local state diverges from the authoritative source

**Anti-pattern:**
```rust
// BAD: unconditional state update
let result = apply_operation(op);
state.update_from(op); // runs even on Failure
```

### 2. State Mutation Completeness

For every function that modifies a clone or local copy of state:

- [ ] Is the modified state written back to `self` or the source of truth?
- [ ] Check for TWO separate state aspects: (a) the tracking/index state and (b) the underlying canonical state. A function that updates the tracker but not the canonical state will cause stale reads on subsequent calls.

**Anti-pattern:**
```rust
// BAD: modified clone not written back
fn spend(&mut self) -> Vec<Spend> {
    let spends = self.do_spend(); // modifies internal clone, not self
    self.tracker.extend(spends.ids());
    spends // self.canonical_state unchanged!
}
```

**Deep-check for spend/consume functions:**

For EVERY function that selects and consumes resources (spend, allocate, claim, consume):
1. Identify the state object modified during the selection computation
2. Trace whether the modified state is WRITTEN BACK to `self` or only returned as a value
3. Verify both the tracker state (a) and the underlying canonical state (b) are updated
4. **CRITICAL — Do not confuse tracker correctness with canonical-state correctness.** A function may correctly update a spent-UTXO tracker (preventing double-spend) while leaving the underlying canonical state (`dust_local_state`, `ledger_state`, balance cache) stale. Both aspects must be independently verified. If the tracker is correct but the canonical state is not written back, this is STILL a finding (stale reads on subsequent calls). **Validated gap (Session 19):** `DustWallet::spend`/`do_spend` correctly updates the spent-UTXO tracker, but the underlying `dust_local_state` is not written back after `do_spend()` modifies a clone. The Group D agent assessed the pattern as intentional based on the tracker correctness alone, producing a false PASS. The canonical-state divergence was flagged by the professional audit as a Low finding.

### 3. Mutex Poisoning Risk

For every `Mutex::lock()` followed by `.expect()` or `.unwrap()`:

- [ ] Could the `expect()`/`unwrap()` panic while the mutex is held?
- [ ] If using `std::sync::Mutex`, a panic poisons the mutex permanently
- [ ] Is validation/cost calculation performed BEFORE acquiring the lock?

### 4. Unbounded File I/O

For every `std::fs::read`, `read_to_end`, or `read_to_string`:

- [ ] Is there a file type check (`metadata.file_type().is_file()`)?
- [ ] Is there a size limit before allocation (`metadata.len() < MAX`)?
- [ ] Could the path resolve to a device file (`/dev/zero`), FIFO, or symlink?

### 5. Unchecked Arithmetic on Financial Values

For every arithmetic operation on token/balance/financial values:

- [ ] Is it `checked_add` / `checked_sub` / `checked_mul` (not `+`, `-`, `*`)?
- [ ] Are `as` casts replaced with `try_from` (not `u128 as i128`)?

### 6. Silent Error Consumption

For every function that returns `()` or logs-and-continues on error:

- [ ] Should the error be propagated to the caller?
- [ ] Would the caller benefit from knowing about the failure?

**Anti-pattern:**
```rust
// BAD: caller sees success even when data is lost
fn save_to_file(&self) {
    for item in &self.items {
        match serialize(item) {
            Ok(bytes) => file.write_all(&bytes),
            Err(e) => println!("error: {e}"), // silent drop
        }
    }
}
```

### 7. Constructor Validation

For every constructor that accepts a role, type, or variant parameter:

- [ ] Does it validate that the parameter matches the expected type?
- [ ] Mismatched parameters produce structurally valid but semantically wrong objects

### 8. RNG Security-Context Triage

For every `SmallRng` or fixed-seed `StdRng` in toolkit code:

- [ ] Trace the RNG output to its usage site
- [ ] If the output is used in transaction construction, block context generation, or any value that enters the on-chain transaction pool, it is a **FAIL**
- [ ] If the output enters the network or is visible to other nodes, it is a **FAIL**
- [ ] Toolkit RNG that only affects local display, logging, or file naming is N/A

## Expected Findings

Applying this checklist to a typical Substrate node's toolkit code consistently surfaces Low-severity findings covering state management, arithmetic safety, and file I/O bounds.
