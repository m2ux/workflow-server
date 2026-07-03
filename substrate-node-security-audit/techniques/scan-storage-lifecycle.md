---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 10
  legacy_id: 10
---

## Capability

Audit storage lifecycle completeness for every storage map in a given scope: find all insert/push/append and remove/take call sites, verify pairing (flagging unpaired inserts as finding leads), check capacity enforcement at insertion points, and optionally verify cross-function invariant consistency between paired functions

## Inputs

### scan_scope

Directory scope to scan (a single crate for per-crate review, or full in-scope paths for global scan)

### verify_invariants

*(optional)* Whether to perform cross-function invariant comparison (e.g., do paired `insert`/`remove` functions maintain the same conditions?)

#### default

false

### output_format

*(optional)* The table shape the pairing results are rendered in.

### gitnexus_available

*(optional)* Whether the target is GitNexus-indexed (set at scope-setup). When true, the relational pairing and cross-function steps are resolved from the call graph; the site-sweep in step 2 stays a grep-appropriate presence search either way.

## Protocol

### 1. Find Storage Declarations

- Enumerate every `StorageMap`, `StorageDoubleMap`, and `StorageNMap` in the `{scan_scope}` as `{$storage_maps}`.

### 2. Find Mutation Sites

- For each map in `{storage_maps}`: find every `insert()`/`push()`/`append()` call site and every `remove()`/`take()` call site, recording them as `{$mutation_sites}`.

### 3. Verify Pairing

- For each insert site in `{mutation_sites}`, identify the corresponding remove site on the inverse lifecycle event. Flag unpaired inserts. For each map in `{storage_maps}` with inserts, check if declared capacity constants are enforced at the insertion point. Record each map's results as a row in the `{storage_lifecycle}` pairing table.

> When `{gitnexus_available}`, resolve which functions call `insert`/`remove` for each map via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) (callers of the mutation site) or a [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) chain, rather than pairing sites by manual read — the graph makes the insert↔remove caller pairing exact.

### 4. Verify Invariants

- If `{verify_invariants}` is true: for pairs of functions that operate on the same storage (e.g., `handle_create` and `handle_redemption_create`), verify they maintain the same invariants — if one inserts, the other should too under the same conditions.

> When `{gitnexus_available}`, enumerate the function set operating on a given map from the graph via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) so no operating function is missed from the cross-function comparison; the invariant judgement itself is made by reading the paired bodies.

## Outputs

### storage_lifecycle

Storage lifecycle pairing table with optional invariant comparison.

#### pairing_table

| `StorageMap` | Crate | `insert()` Sites | `remove()` Sites | Paired? | Cap Enforced? |

#### invariant_table

| `StorageMap` | `insert()` Callers | `remove()` Callers | Paired? | Cross-function Consistent? | (optional)
