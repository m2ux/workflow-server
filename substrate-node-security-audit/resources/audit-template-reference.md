---
name: audit-template-reference
description: Authoritative section index for the §1–§5 audit checklist taxonomy. Every §X.Y reference used throughout this workflow resolves to an entry here; full detail lives in the audit-prompt-template resource.
metadata:
  order: 1
  legacy_id: 1
---

# Audit Prompt Template Reference

This is the section index for the **`§` taxonomy** used throughout the
`substrate-node-security-audit` workflow. Activities, techniques, and the
sub-agent output schema all refer to checklist items by number (e.g. `§3.4`,
`§5.14`). Every such reference resolves to an entry in the tables below.

## Source

The full template ships with this workflow as the
[audit-prompt-template](./audit-prompt-template.md) resource. It is the
authoritative source for every `§` item: each table entry below links to the
corresponding section there. The methodology is target-agnostic; target-specific
crate assignments, file paths, struct names, and calibration data live in
[target-profile](./target-profile.md).

## §1 Audit Setup

| § | Title | Purpose |
|---|-------|---------|
| [§1.1](./audit-prompt-template.md#11-scope-definition) | Scope Definition | Define in-scope crates/paths and trust boundaries |
| [§1.2](./audit-prompt-template.md#12-codebase-reconnaissance) | Codebase Reconnaissance | Map architecture; build the file inventory and function registry (step 8) |
| [§1.3](./audit-prompt-template.md#13-setup) | Setup | Toolchain and environment preparation |
| [§1.4](./audit-prompt-template.md#14-mandatory-ingestion-phase) | Mandatory Ingestion Phase | Prove the code was read before analysis; orchestrator-delegates-to-sub-agents model |

## §2 Static Analysis Phase

| § | Title | Purpose |
|---|-------|---------|
| [§2.1](./audit-prompt-template.md#21-panic-path-detection) | Panic Path Detection | `unwrap`/`expect`/`panic!`/indexing grep sweep |
| [§2.2](./audit-prompt-template.md#22-dependency-vulnerability-scan) | Dependency Vulnerability Scan | `cargo audit`/`cargo deny`, with a manual crate-table fallback |
| [§2.3](./audit-prompt-template.md#23-unsafe-code-detection) | Unsafe Code Detection | Quantify `unsafe` usage across the dependency tree |
| [§2.4](./audit-prompt-template.md#24-cryptographic-weakness-search) | Cryptographic Weakness Search | Weak RNG/hashing/constant-time — run against ALL in-scope dirs |
| [§2.5](./audit-prompt-template.md#25-type-safety-and-arithmetic) | Type Safety and Arithmetic | Overflow, truncating/lossy casts |
| [§2.6](./audit-prompt-template.md#26-feature-flag-divergence) | Feature Flag Divergence | Behaviour differences across feature gates |
| [§2.7](./audit-prompt-template.md#27-unbounded-resource-consumption) | Unbounded Resource Consumption | Missing size/length caps, fan-out, silent truncation |
| [§2.7.1](./audit-prompt-template.md#271-storage-lifecycle-pairing-scan) | Storage Lifecycle Pairing Scan | `insert` vs `remove`/`take` site pairing table |
| [§2.8](./audit-prompt-template.md#28-external-connection-security) | External Connection Security | Connection-pool sharing, TLS, endpoint exposure |
| [§2.9](./audit-prompt-template.md#29-information-leak-search) | Information Leak Search | Secrets/sensitive data in logs and errors |
| [§2.10](./audit-prompt-template.md#210-serialization-pre-allocation-mismatch) | Serialization Pre-Allocation Mismatch | `Vec::with_capacity` size-function mismatches |
| [§2.11](./audit-prompt-template.md#211-mock-data-source-toggle-detection) | Mock Data Source Toggle Detection | Env-controlled mock branches in data-source factories |

## §3 Systematic Manual Review Strategies

| § | Title | Purpose |
|---|-------|---------|
| [§3.1](./audit-prompt-template.md#31-pallet-hook-and-weight-audit) | Pallet Hook and Weight Audit | `on_initialize`/`on_finalize` weight accounting via `weights.rs` |
| [§3.2](./audit-prompt-template.md#32-on-chain-state-lifecycle-audit) | On-Chain State Lifecycle Audit | Insert/remove pairing; cursor/pagination monotonicity; orphan-on-error |
| [§3.3](./audit-prompt-template.md#33-event-emission-integrity) | Event Emission Integrity | Per-field event trace table + event-vs-storage struct diff |
| [§3.4](./audit-prompt-template.md#34-consensus-path-symmetry) | Consensus Path Symmetry | Proposer/verifier tuple symmetry; consensus-config invariant validation |
| [§3.5](./audit-prompt-template.md#35-genesis-initialization-consistency) | Genesis Initialization Consistency | `StorageInit` construction-site enumeration; online vs offline divergence |
| [§3.6](./audit-prompt-template.md#36-input-validation-at-trust-boundaries) | Input Validation at Trust Boundaries | Consumption-layer validation; typed wrappers over raw bytes/strings |
| [§3.7](./audit-prompt-template.md#37-error-handling-integrity) | Error Handling Integrity | Error-path state reversion; no silent swallowing |
| [§3.8](./audit-prompt-template.md#38-concurrency-and-shared-state-safety) | Concurrency and Shared State Safety | Shared pools/locks, contention, consumer isolation |
| [§3.9](./audit-prompt-template.md#39-cryptographic-construction-review) | Cryptographic Construction Review | Key handling, nonce reuse, signature/commitment schemes |
| [§3.10](./audit-prompt-template.md#310-external-data-source-integration) | External Data Source Integration | Cross-chain timestamp source AND freshness validation (DEFAULT-FAIL) |
| [§3.11](./audit-prompt-template.md#311-cross-crate-constant-consistency) | Cross-Crate Constant Consistency | Duplicated constants kept in sync across crates |
| [§3.12](./audit-prompt-template.md#312-runtime-upgrade-and-storage-migration-safety) | Runtime Upgrade and Storage Migration Safety | `on_runtime_upgrade` migration correctness |
| [§3.13](./audit-prompt-template.md#313-access-control-and-origin-validation) | Access Control and Origin Validation | Origin checks on privileged extrinsics/calls |
| [§3.14](./audit-prompt-template.md#314-system-transaction-and-ledger-internal-function-review) | System Transaction and Ledger Internal Function Review | System-txn application; wildcard `_ =>` match arms |

## §4 Reporting Format

| § | Title | Purpose |
|---|-------|---------|
| [§4 — Finding Entry](./audit-prompt-template.md#finding-entry) | Finding Entry | Numbered finding template (ID, title, location, evidence) |
| [§4 — Severity Scoring](./audit-prompt-template.md#severity-scoring) | Severity Scoring | Impact × Feasibility rubric replacing intuitive assignment |

## §5 Execution Strategy

`§5` covers the multi-agent execution protocol. The numbered items `§5.1`–`§5.15`
are the [Execution Model Requirements](./audit-prompt-template.md#execution-model-requirements);
the named subsections cover phase ordering, agent grouping, and AI-agent limitations.

| § | Title | Purpose |
|---|-------|---------|
| [Phase Order](./audit-prompt-template.md#phase-order) | Phase Order | Sequence of audit phases |
| [Multi-Agent Strategy](./audit-prompt-template.md#multi-agent-execution-strategy) | Multi-Agent Execution Strategy | Group A/B/C/D dispatch, consolidation, verification |
| §5.1 | Mandatory Ingestion | Prove code reading before analysis (see §1.4) |
| §5.2 | Structured Scratchpad Iteration | Per-component scratchpad discipline |
| §5.3 | Trace-Based Prompts | Graph-navigation review prompts |
| §5.4 | Mandatory Function-Level Review | Read full function bodies, not grep triage |
| §5.5 | Depth-First, Not Breadth-First | Exhaust priority-1/2 components first |
| §5.6 | Evidence-Based PASS/FAIL | Every PASS cites specific code |
| §5.7 | Negative-Evidence Discipline | Search for the absence of expected patterns |
| §5.8 | Checklist Instantiation | Instantiate every applicable §3 check per component |
| §5.9 | Component Iteration Enforcement | Iterate every crate from §1.2 |
| §5.10 | Grep Pagination and Truncation | Truncated grep output means drill deeper |
| §5.11 | Severity Calibration | Reachability/feasibility before Critical/High |
| §5.12 | Mandatory Finding Elevation | Every scratchpad FAIL becomes a numbered finding |
| §5.13 | Grep Scope Enforcement | Run §2 patterns over the FULL in-scope set |
| §5.14 | Implementation File Coverage Gate | Every >200-line priority-1/2 file must be read |
| §5.15 | Invariant Extraction for Priority-1 Functions | Extract pre/postconditions before applying §3 |
| [Component Priority Order](./audit-prompt-template.md#component-priority-order) | Component Priority Order | Crate prioritisation + toolkit minimum checklist |
| [AI Agent Limitations](./audit-prompt-template.md#ai-agent-limitations-and-mitigations) | AI Agent Limitations and Mitigations | Structural biases and their mitigations |

## Usage in This Workflow

The template is the **checklist** — this workflow is the **execution framework**. The workflow handles:
- Phase sequencing and automatic transitions (no checkpoints)
- Concurrent agent dispatch and result collection with verification agent
- Adversarial verification with field-enumeration as a separate phase
- Severity calibration via the technique rubric with cross-check
- Ensemble and gap analysis orchestration
- Mechanical verification of historically-missed patterns (Group B via [static-analysis-patterns](./static-analysis-patterns.md))

The template handles:
- What to look for (§2 patterns, §3 checklists)
- How to evaluate findings (PASS/FAIL criteria)
- What invariants to extract (§5.15)
- How to structure the report (§4)
