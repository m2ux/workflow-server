---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.4.0
  order: 5
  legacy_id: 5
---

## Capability

Validate that collected sub-agent results meet structural completeness requirements, check coverage gates (including expected-file coverage) and mandatory output tables, and flag missing outputs for targeted re-dispatch on failure

## Inputs

### agent-results

Collected structured outputs from sub-agents

### expected-outputs

Per-agent list of required tables, coverage criteria, and completeness checks

### file-inventory

*(optional)* List of files that must be covered (for coverage gate verification)

### dispatch-manifest

*(optional)* Dispatch manifest showing assigned vs dispatched agents

### agent-assignments

*(optional)* Crate-to-agent-group assignments

## Protocol

### 1. Check Dispatch Completeness

- If a dispatch_manifest is provided, verify every agent in the agent_assignments was dispatched and returned. Produce a dispatch status table: crate, assigned_group, agent_dispatched (yes/no), structured_output_received (yes/no) — i.e. output conforming to the [sub-agent-output-schema](../resources/sub-agent-output-schema.md). If any assigned agent was not dispatched, flag as DISPATCH_INCOMPLETE. This is a HARD STOP — the orchestrator must dispatch missing agents before proceeding.

### 2. Check Coverage Gate

- For each .rs file exceeding 200 lines in priority-1/2 crates, check whether at least one §3-APPLYING GROUP A SUB-AGENT's output references it (via file manifest, findings, or checklist coverage). Files read ONLY during reconnaissance (by the orchestrator or reconnaissance sub-agents) do NOT satisfy the coverage gate. Produce a coverage table: file, lines, read-by-agent, agent_type (group-a/recon/none), status (COVERED/RECON-ONLY/UNREAD). Flag any file with status RECON-ONLY or UNREAD. This is a HARD STOP.

### 3. Check Mandatory Tables

- For each agent, check that every required table exists in the agent's result. Required tables are determined by the agent's vulnerability domain map entries: (a) §3 checklist evaluation table for all crate-review agents; (b) per-field event trace table AND event-vs-storage struct diff table for agents with §3.3 domain entries; (c) cross-function invariant table for agents with §3.2 domain entries; (d) cross-layer verification matrix for agents with cross-crate domain entries (§3.2 pagination, §3.10 timestamp); (e) genesis construction site enumeration for agents with §3.5 domain entries; (f) function enumeration table, per-function checklist matrix, and coverage attestation from the toolkit review agent. If any required table is missing or was replaced with prose, flag the agent and table for re-dispatch.

### 4. Check Structural Completeness

- Check that each agent's steps_completed list matches the activity definition. Check that every FAIL verdict has a corresponding finding entry. Check that every mandatory_tables field is populated or null with justification.

### 5. Check Cross Chain Timestamp

- For every Group A agent reviewing a pallet that processes inherent data from an external chain (specifically: NTO pallet, any bridge pallet), verify the agent's output includes a cross-layer timestamp verification matrix with explicit per-layer verdicts. If the agent marked §3.10 as PASS without producing this matrix, flag for re-dispatch.

### 6. Extract Table Findings

- DETERMINISTIC CELL-LEVEL SCAN: Iterate every row in every mandatory table from every agent. For each cell, apply keyword match: FAIL, DIFF, Missing, No, absent, not validated, unconditional, no guard, no check, unpaired. Each matching cell becomes a table-derived finding (source_table, cell_description, agent_id, severity=TBD). The orchestrator MUST NOT apply judgment to skip cells — all matches are extracted. Deduplication occurs later in merge-findings.

### 7. Verify Event Construction Site

- For every pallet that calls deposit_event() with data derived from transaction results, verify that the Group A agent's §3.3 per-field trace table covers ALL event construction sites identified in the vulnerability domain map. If the trace table covers only one site when multiple exist, dispatch a targeted follow-up agent for the uncovered sites.

### 8. Check Config Variant Triage

- For the node startup agent (A3), verify its output includes a configuration-variant triage table that maps each expect()/unwrap() in service initialization code to all valid configuration modes (InMemory, OnDisk, pruned, archive, development). If the table is absent or covers fewer than 80% of expect()/unwrap() sites in service.rs and command.rs, flag for re-dispatch with explicit Check 25 instructions.

### 9. Check Genesis Parsing Coverage

- For the node startup agent (A3), verify its output traces ALL four genesis data parsing paths: (1) StorageInit construction sites (existing §3.5 check), (2) genesis extrinsics decoding from chain spec properties, (3) genesis header construction (including feature-gated digest items), (4) chain spec property extraction (JSON parsing of genesis_state, genesis_block, etc.). Each path must have a truncation-safety verdict. If any path is untraced, flag for re-dispatch with explicit Check 26 instructions.

### 10. Check Error Path Persistence

- For each Group A pallet agent, verify that every StorageMap::insert() site identified in the agent's storage lifecycle pairing table has been checked for error-path persistence: does a subsequent fallible operation (host API call, event construction, serialization) exist on the same code path? If so, does the error path revert the insert? If the agent's output does not address error-path persistence for any insert site, flag for follow-up. This specifically targets the pattern where insert() persists but the handler returns None on a downstream failure.

### 11. Produce Verification Report

- Output a structured report listing: dispatch completeness status, all coverage gaps (files not read by §3-agents), all missing tables (agent + table ID), all structural issues, cross-chain timestamp check status, table-derived findings from extract-table-findings step, event construction site coverage status. For each gap, recommend a targeted follow-up dispatch.

## Outputs

### verification-report

Verification report with gap list and re-dispatch recommendations.

- **dispatch_manifest**: crate, assigned_group, dispatched, returned, status
- **coverage_table**: file, lines, agent, agent_type (group-a/recon/none), COVERED/RECON-ONLY/UNREAD
- **missing_tables_list**: agent_id, table_id, reason
- **redispatch_recommendations**: agent_id, scope, specific check to perform

## Errors

### dispatch_incomplete

**Cause:** One or more assigned agents were not dispatched

**Recovery:** HARD STOP — dispatch missing agents before proceeding to finding consolidation

### coverage_gate_failure

**Cause:** One or more files were read only during reconnaissance, not by §3-applying agents

**Recovery:** Dispatch targeted Group A follow-up agents for RECON-ONLY files before proceeding

### missing_mandatory_table

**Cause:** An agent returned prose instead of a required structured table

**Recovery:** Re-dispatch the agent with explicit output format instructions
