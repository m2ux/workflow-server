---
name: scan-storage-lifecycle
description: A reusable technique for auditing storage lifecycle completeness in Substrate-based codebases. Finds all insert/push/append sites and all remove/take sites for each StorageMap, pairs them, flags unpaired inserts as finding leads, and checks capacity enforcement at insertion points. Optionally extends to cross-function invariant comparison (verifying that paired functions maintain the same storage invariants).
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 10
  legacy_id: 10
---

## Capability

For every storage map in a given scope, find all insert and remove call sites, verify pairing, check capacity enforcement, and optionally verify cross-function invariant consistency

## Inputs

### scope

Directory scope to scan (a single crate for per-crate review, or full in-scope paths for global scan)

### verify-invariants

*(optional)* Whether to perform cross-function invariant comparison (e.g., do paired insert/remove functions maintain the same conditions?)

- **default**: false

## Protocol

### 1. Find Storage Declarations

- Enumerate every StorageMap, StorageDoubleMap, and StorageNMap in the scope.

### 2. Find Mutation Sites

- For each storage map: find every insert()/push()/append() call site and every remove()/take() call site.

### 3. Verify Pairing

- For each insert site, identify the corresponding remove site on the inverse lifecycle event. Flag unpaired inserts. For each storage map with inserts, check if declared capacity constants are enforced at the insertion point.

### 4. Verify Invariants

- If verify_invariants is true: for pairs of functions that operate on the same storage (e.g., handle_create and handle_redemption_create), verify they maintain the same invariants — if one inserts, the other should too under the same conditions.

## Outputs

### storage-lifecycle

Storage lifecycle pairing table with optional invariant comparison.

- **pairing_table**: | StorageMap | Crate | insert() Sites | remove() Sites | Paired? | Cap Enforced? |
- **invariant_table**: | StorageMap | insert() Callers | remove() Callers | Paired? | Cross-function Consistent? | (optional)
