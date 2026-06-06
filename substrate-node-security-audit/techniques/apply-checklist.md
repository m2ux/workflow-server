---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.3.0
  order: 7
  legacy_id: 7
---

## Capability

Given a checklist (from a resource) and a set of items (functions, crate components, code paths), systematically apply the checklist by iterating every item against every checklist entry, assigning a PASS/FAIL/NA verdict with required evidence for each combination, producing a verdict matrix, and verifying completeness. Requiring an explicit entry for every item-by-checklist combination prevents skimming.

## Inputs

### checklist-source

Resource containing the checklist entries (e.g., [toolkit-checklist](../resources/toolkit-checklist.md) for toolkit, or the `§3` manual-review checklist for crate review — see [audit-template-reference](../resources/audit-template-reference.md) for the `§X.Y` section index that every reference below resolves to)

### item-set

The enumerated items to evaluate against the checklist (e.g., function list, crate components, code paths)

### scope-files

Source files to read for evidence gathering

## Protocol

### 1. Load Checklist

- Fetch the checklist from the `checklist-source` resource. Parse every numbered entry. Identify which entries apply universally and which apply conditionally (e.g., 'only for wallet constructors', 'only for pallets with events').

### 2. Iterate Items

- For EACH item in the `item-set`, evaluate EVERY checklist entry, reading the relevant `scope-files` to gather the evidence each verdict requires. Produce a verdict for each combination: PASS (with code citation — bare PASSes are invalid), FAIL (becomes a finding), or NA (with explicit justification for why the entry is structurally inapplicable). Every NA must be explicit — silent omission is not permitted.
- If a PASS verdict lacks a code citation, treat it as invalid: re-evaluate the combination with supporting evidence, or downgrade it to INSUFFICIENT.
- For §3.4, every consensus-critical configuration struct (see [target profile](../resources/target-profile.md#consensus-critical-configuration-structs)): verify the constructor validates mathematical invariants. 'No validation but works in practice' is not a valid PASS.
- For §3.6 input validation, PASS requires evidence at the CONSUMPTION layer (pallet), not just the PRODUCTION layer. Raw bytes/strings without typed wrappers are FAIL with severity reduced by 1 level.
- For every pallet with hooks, the sub-agent MUST read the WeightInfo implementation file (weights.rs). The 5 sub-actions (read return value, read body, trace chain, estimate work, check amplification) are REQUIRED outputs. §3.1 is INCOMPLETE without reading weights.rs.
- For pallets processing external-chain inherent data (see [target profile](../resources/target-profile.md#cross-chain-pallets) cross-chain pallets list), pallet_timestamp usage in cross-chain event/payload construction is DEFAULT FAIL. Agent must prove usage is local-only to override. 'Design choice' is NOT a valid PASS when event content derives from external chain observations.
- For §3.4, every type in the proposer tuple but absent from the verifier tuple is FAIL UNLESS the agent cites a specific code path where the verifier independently recomputes the value from its own data source. Invalid PASS justifications: 'value in digest', 'by design', 'framework handles it', 'extracted from header'. Valid PASS requires: 'verifier recomputes X at [file:line] from its own [source]'.
- When reviewing the ledger crate, check for wildcard _ => match arms in apply_system_transaction. Wildcard arms allowing unknown types to be applied to state = FAIL.
- When checklist is [toolkit-checklist](../resources/toolkit-checklist.md) (toolkit): every .rs file in every subdirectory of the toolkit paths must be enumerated. Do not read only top-level lib.rs.
- When checklist is [toolkit-checklist](../resources/toolkit-checklist.md) (toolkit): for every SmallRng or fixed-seed StdRng, trace the RNG output to its usage site. If the output is used in transaction construction (TransactionWithContext, BlockContext, parent_block_hash), it is a FAIL regardless of 'test infrastructure.' SEVERITY CEILING: Findings affecting only local wallet state, CLI output, or offline tooling have I <= 2. Elevate to I=3 only when the toolkit produces artifacts consumed by the production node or submitted to the network.
- For §3.2 storage lifecycle checks, every StorageMap::insert() must be evaluated for error-path persistence: if the code following the insert contains a fallible operation (host API call, event construction, serialization, external query) and the error path causes the handler to return None/Err WITHOUT reverting the insert, the storage entry becomes orphaned. This is a SEPARATE finding from the general insert/remove lifecycle pairing. The insert may have a corresponding remove() on the normal lifecycle path AND still be vulnerable to orphan persistence on error paths. Produce a table: | Insert Site | Subsequent Fallible Op | Error Path Reverts Insert? | Finding? |
- When checklist is [toolkit-checklist](../resources/toolkit-checklist.md) (toolkit) item 2: a PASS on tracker-state correctness does NOT extend to canonical-state correctness. The agent must independently verify BOTH: (a) the tracking/index state (e.g., spent_utxos set) is updated, AND (b) the underlying canonical state (e.g., dust_local_state, ledger_state) is written back to self. If the tracker prevents double-operations but the canonical state remains stale, this is a finding — subsequent reads return outdated values.

### 3. Produce Tables

- Where the checklist specifies that certain entries require structured tables as evidence, produce those tables or state 'N/A — [reason]' with a specific justification. Standard required tables for crate-level review: (1) Per-field event trace table — for every event constructor with partial success, trace each collection field to its population source and whether it filters by outcome; a PASS on the event emission checklist item without this table is INVALID for pallets with deposit_event() and partial-success paths. (2) Struct diff table — event vs storage field-by-field comparison. (3) Cross-layer verification matrix — data source / IDP / pallet for pagination and timestamp checks. (4) Two-level input validation table — structural (Level 1) and semantic (Level 2) per external input type. (5) Weight accounting table — for every pallet with on_initialize/on_finalize, read the WeightInfo implementation file (weights.rs) and record: hook name, WeightInfo function, return value, estimated actual work, verdict. A PASS on §3.1 without this table is INVALID. (6) Defense-in-depth validation — for §3.6 input validation entries, the two-level table must show validation at BOTH the production layer (data source) AND the consumption layer (pallet). A PASS citing only upstream validation without a type-safety guarantee at the consumption layer is a defense-in-depth gap (severity reduced by 1 level from missing validation).
- When checklist is [toolkit-checklist](../resources/toolkit-checklist.md) (toolkit): produce the three required structured tables (function enumeration, checklist matrix, coverage attestation). Prose summaries that lack the full matrix will be rejected; every FAIL cell becomes a finding.
- When checklist is [toolkit-checklist](../resources/toolkit-checklist.md) (toolkit): after producing the enumeration table, independently count functions per file (e.g. grep 'fn ') and compare against the table row count. A discrepancy > 10% indicates skimming and requires re-enumeration.

### 4. Verify Matrix Completeness

- Count items in the item set vs rows in the verdict matrix. Every item must have a row. Count checklist entries vs columns. Every entry must have a verdict per item. List any gaps and resolve them. If an item appears in the enumeration but not in the matrix, add the missing row and evaluate all checklist entries for it.

### 5. Produce Verdict Matrix

- Output the `verdict-matrix`: the complete item x checklist matrix with its coverage attestation, in the format specified by the activity step that invoked this technique.

## Outputs

### verdict-matrix

Complete verdict matrix and coverage attestation.

#### verdict-matrix

one row per item, one column per checklist entry, each cell is PASS/FAIL/NA with evidence

#### required-analysis-tables

any structured tables mandated by specific checklist entries

#### coverage-attestation

total items, total reviewed, coverage percentage, gaps list