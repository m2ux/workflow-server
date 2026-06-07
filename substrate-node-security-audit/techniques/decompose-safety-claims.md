---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 11
  legacy_id: 11
---

## Capability

Adversarially decompose a safety claim (PASS verdict on a multi-faceted check) with the goal of refuting rather than confirming it: enumerate the constituent properties it asserts, enumerate every instance/field/site that must hold, and produce a decomposition table for independent verification. Optionally informed by a verification gap report to target areas with incomplete primary coverage.

## Inputs

### pass_items

List of PASS verdicts to decompose, each with the claim text, cited evidence, and checklist reference

### source_files

Code files to read for independent verification

### verification_gaps

*(optional)* Gap report listing §3 categories with incomplete coverage, missing tables, or unmet target profile obligations. PASS items in flagged categories are auto-included in the adversarial queue.

## Protocol

### 1. Seed From Gaps

- If {verification_gaps} input is provided, read the gap report. For each §3 category flagged as having incomplete coverage, missing mandatory tables, or unmet [target profile](../resources/target-profile.md#file-coverage-obligations) obligations, identify ALL PASS items from agent results that reference that category. These items are pre-seeded into the `{$adversarial_queue}` regardless of severity estimate — the verification gap indicates higher false-PASS risk.

### 2. Extract And Filter

- Collect the {pass_items} (each a PASS verdict with claim text, cited evidence, and checklist reference). Filter to items with severity >= Medium potential — specifically checklist items covering: hook/weight accounting, state lifecycle/cursor, event emission integrity, consensus path symmetry, input validation, pool isolation, and timestamp sources. Merge with the pre-seeded items in {adversarial_queue}. Deduplicate by checklist reference.

### 3. Decompose Claims

- For each PASS item, enumerate the specific independent properties the PASS requires to be true. A claim like 'events are filtered for failed segments' decomposes into N properties — one per event field type (e.g., UTXOs, call_addresses, deploy_addresses, maintain_addresses, claim_rewards).
- A PASS that says 'events are filtered' must be decomposed: are UTXOs filtered? call_addresses? deploy_addresses? maintain_addresses? claim_rewards? Each field independently.

### 4. Enumerate Instances

- For every property involving multiple fields, sites, or instances, enumerate ALL of them. A single-instance verification is insufficient. Produce a table: | Property | Instance | Verified? | Evidence |

### 5. Verify Independently

- For each decomposed property, read the cited code location in the {source_files} and search for the specific implementation. Output CONFIRMED (all instances verified with citations), REFUTED (any instance lacks implementation — becomes a new finding), or INSUFFICIENT (cannot determine).  
  > A PASS that says 'cursor is set correctly' must verify: is there an ensure!(new > old) guard? If not, the PASS is invalid regardless of whether the code 'works'.
- CONFIRMED only when ALL decomposed properties are verified with code citations. Record each verdict in the {decomposition_results} table, completing the per-instance Verified? and Evidence columns.

## Outputs

### decomposition_results

Decomposition table with per-instance verification results.

#### decomposition_table

| PASS Item | Property | Instance | Verified? | Evidence |

#### verdict_summary

CONFIRMED count, REFUTED count (each becomes a finding), INSUFFICIENT count

## Rules

### refute-role

Refute safety claims, not confirm them.

### focus-domains

§3.1 (flush), §3.2 (lifecycle/cursor), §3.3 (event fields), §3.4 (inherent symmetry), §3.6 (input validation), §3.10 (timestamps) — these checks are most susceptible to false PASSes.
