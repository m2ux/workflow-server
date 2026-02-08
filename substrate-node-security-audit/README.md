# Security Audit Workflow

> Multi-phase AI security audit for Substrate-based blockchain node codebases. Orchestrates reconnaissance, multi-agent deep review, exhaustive panic sweep, hard-gate adversarial verification, severity-calibrated reporting, optional ensemble passes, and gap analysis against professional audit reports.

## Overview

This workflow guides the complete lifecycle of a security audit:

1. **Scope Setup** — Confirm target, checkout at commit, run dependency scanning, generate panic inventory, create planning folder, verify file assignment completeness
2. **Reconnaissance** — Map architecture, identify crates, trust boundaries, consensus paths, build function registry
3. **Primary Audit** — Multi-agent dispatch: crate-level deep review (Group A with cross-layer deferral), static analysis (Group B), cross-cutting traces including pagination loop tracer (Group C), toolkit review (Group D), utility catch-up (Group E)
4. **Exhaustive Panic Sweep** — Mechanical triage of every unwrap/expect/panic site by reachability, with late-file re-read
5. **Adversarial Verification** (hard gate) — Decompose and independently verify every PASS item using anti-anchoring protocol (no access to findings or severity)
6. **Report Generation** — Consolidate all phases, apply severity scoring with calibration cross-check, verify extended coverage gate, produce report
7. **Ensemble Pass** (optional) — Second-model run on priority-1/2 components, union-merge with primary results
8. **Gap Analysis** (optional) — Compare against a professional audit report for benchmarking and improvement

**Key characteristics:**
- Sequential flow with hard gates (adversarial phase must complete before reporting)
- Multi-agent execution with 5 agent groups (crate review, static analysis, cross-cutting traces, toolkit, utility)
- 8 cross-cutting trace agents including pagination loop tracer and 3-layer timestamp/input validation tracers
- Cross-layer check deferral: crate-level agents defer multi-crate checks to Group C specialists
- Exhaustive panic sweep phase with pre-generated inventory
- Anti-anchoring adversarial verification (no findings/severity shared with verifier)
- Extended coverage gate (file read + panic sweep + late-file re-read + scope completeness)
- Impact x Feasibility severity scoring with calibration cross-check
- Based on the Substrate Node Security Audit Template v3 (iteratively improved via gap analysis against professional audit benchmarks)

---

## Getting Started

**To start an audit, say:** `"start security audit"` or `"audit midnight-node at commit abc123"`

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| **Target submodule** | Which submodule to audit | `midnight-node` |
| **Target commit** | Git commit hash (defaults to HEAD if not specified) | `abc1234...` |

### Optional Inputs

| Input | Description | When to Use |
|-------|-------------|-------------|
| **Ensemble pass** | Enable a second-model run on priority-1/2 components | When maximum coverage is needed and compute cost is acceptable |
| **Reference report** | Path to a professional audit report (PDF or MD) | When you want gap analysis comparing AI findings against a professional benchmark |

The ensemble option can be enabled at the setup checkpoint. The reference report is requested **only after the report is finalized** (Phase 5) — it is never loaded during the audit itself to avoid contaminating the results with known issues.

### Prerequisites

- Read and follow `AGENTS.md` in the project root
- The target submodule must exist in the repository (see `.gitmodules`)

---

## Workflow Flow

```mermaid
graph TD
    Start([Start]) --> SS[scope-setup]
    SS --> REC[reconnaissance]
    REC --> PA[primary-audit]
    PA --> PS[panic-sweep]
    PS --> AV[adversarial-verification<br/>HARD GATE]
    AV --> RG[report-generation]
    RG --> DEC1{ensemble enabled?}
    DEC1 -->|yes| EP[ensemble-pass]
    DEC1 -->|no| DEC2{reference report?}
    EP --> DEC2
    DEC2 -->|yes| GA[gap-analysis]
    DEC2 -->|no| Done([Complete])
    GA --> Done
```

---

## Primary Audit — Agent Groups

```mermaid
graph LR
    subgraph orchestrator[Orchestrator]
        RECON[Reconnaissance]
        MERGE[Consolidation]
    end

    subgraph groupA["Group A: Crate Review (cross-layer deferred)"]
        A1[Pallet Agent 1]
        A2[Pallet Agent 2]
        A3[Ledger Agent]
        A4[Node Agent]
        A5[Primitives Agent]
    end

    subgraph groupB[Group B: Static Analysis]
        B1[Pattern Agent]
    end

    subgraph groupC[Group C: Cross-Cutting Traces]
        C1[Pool Tracer]
        C2[Genesis Tracer]
        C3[Inherent Tracer]
        C4[Ord Verifier]
        C5["Timestamp Tracer (3-layer)"]
        C6["Validation Tracer (3-layer)"]
        C7[Struct Diff]
        C8["Pagination Loop Tracer ★"]
    end

    subgraph groupD[Group D: Toolkit]
        D1[Toolkit Agent]
    end

    subgraph groupE["Group E: Utility + Catch-up ★"]
        E1[Utility Agent]
    end

    RECON --> A1
    RECON --> A2
    RECON --> A3
    RECON --> A4
    RECON --> A5
    RECON --> B1
    RECON --> C1
    RECON --> C2
    RECON --> C3
    RECON --> C4
    RECON --> C5
    RECON --> C6
    RECON --> C7
    RECON --> C8
    RECON --> D1
    RECON --> E1

    A1 --> MERGE
    A2 --> MERGE
    A3 --> MERGE
    A4 --> MERGE
    A5 --> MERGE
    B1 --> MERGE
    C1 --> MERGE
    C2 --> MERGE
    C3 --> MERGE
    C4 --> MERGE
    C5 --> MERGE
    C6 --> MERGE
    C7 --> MERGE
    C8 --> MERGE
    D1 --> MERGE
    E1 --> MERGE
```

> ★ New in v3: Pagination Loop Tracer addresses the Critical pagination counter gap; Group E covers `util/toolkit/`, `util/upgrader/`, and unassigned files.

---

## Activities

### 1. Scope Setup

**Purpose:** Confirm target submodule and commit, checkout codebase, run dependency scanning, create planning folder.

**Primary Skill:** `audit-execution`
**Supporting Skill:** `artifact-management`

**Checkpoints:**
1. Target Confirmation: "Audit target: {submodule} @ {commit}. Proceed?"
2. Setup Complete: "Planning folder created, dependency scan {status}. Proceed to reconnaissance?"

**Artifacts:** `START-HERE.md`

---

### 2. Reconnaissance

**Purpose:** Map the codebase architecture, identify all crates, trust boundaries, consensus paths, and build the function registry (template §1.2).

**Primary Skill:** `audit-execution`

**Checkpoint:** "Architecture mapped: {N} crates, {M} functions in registry. Proceed to primary audit?"

**Artifacts:** `README.md` (scope and architecture summary)

---

### 3. Primary Audit

**Purpose:** Execute the multi-agent audit. Dispatches 5 agent groups in parallel with cross-layer deferral protocol.

**Primary Skill:** `audit-execution`

**Agent Groups:**

| Group | Agents | Scope | Checklist |
|-------|--------|-------|-----------|
| A | 1 per priority-1/2 crate | Full crate file read + §3 checklist + invariant extraction. **Cross-layer checks deferred to Group C** (pagination, timestamps, pools, inherent symmetry) | Template §3 + §5.15 |
| B | 1 | All §2 grep patterns across full in-scope dirs | Template §2 |
| C | 8 trace agents | Cross-boundary issues (pools, genesis, inherents, ordering, timestamps with 3-layer matrix, validation with 3-layer matrix, struct diffs, **pagination loop tracing**) | Template §3.2, §3.4, §3.5, §3.10 |
| D | 1 | ledger/helpers/ | Toolkit minimum checklist (resource 03) |
| E | 1 | util/toolkit/, util/upgrader/, unassigned files | Toolkit checklist + §2.7 file reads + §3.9 RNG |

**Checkpoint:** "Primary audit complete. {N} findings, {M} PASS items pending verification. Proceed?"

---

### 4. Exhaustive Panic Sweep

**Purpose:** Mechanically triage every `unwrap()`/`expect()`/`panic!` site using the pre-generated panic inventory from Phase 0. Perform late-file re-reads on the last 150 lines of every >400-line file.

**Primary Skill:** `audit-execution`

**Steps:**
1. Receive panic inventory from Phase 0 (grep output)
2. Triage each site by reachability (hook/inherent → High, startup → Medium, toolkit → Low)
3. Verify whether each unwrap can fail under valid configurations
4. Late-file re-read: re-scan last 150 lines of every >400-line file for panic paths
5. Produce panic findings table

**Checkpoint:** "{N} panic sites triaged, {M} findings generated. Proceed to adversarial verification?"

---

### 5. Adversarial Verification (HARD GATE)

**Purpose:** Verify every High/Medium PASS item from audit scratchpads by decomposing each claim into constituent properties and independently verifying each one. The agent's role is to **refute**, not confirm. This is a **hard gate** — the workflow must not proceed without it.

**Primary Skill:** `audit-execution`

**Anti-anchoring protocol:** The adversarial agent receives ONLY the PASS items, cited evidence, and source files. It does NOT receive findings, severity assessments, or conclusions from the primary audit.

**Steps:**
1. Extract PASS items from all scratchpads (§3.1-§3.4, §3.6, §3.10, §3.14)
2. Decompose each PASS into 3-7 constituent properties
3. For §3.3 PASS items: mandatory per-field decomposition (utxos, call_addresses, deploy_addresses, maintain_addresses, claim_rewards)
4. For §3.2/§3.10 PASS items: verify at all three layers (data source, IDP, pallet)
5. Search for DISCONFIRMING evidence first; only mark CONFIRMED after all properties verified
6. Output: CONFIRMED / REFUTED / INSUFFICIENT

**Checkpoint:** "{N} confirmed, {M} refuted, {K} insufficient. Proceed to report?"

---

### 6. Report Generation

**Purpose:** Consolidate all findings from primary audit, panic sweep, and adversarial verification. Apply severity scoring with calibration cross-check. Verify extended coverage gate. Produce final report.

**Primary Skill:** `audit-execution`
**Supporting Skill:** `severity-scoring`

**Steps:**
1. Merge primary + panic sweep + adversarial findings
2. Deduplicate by root cause
3. Apply Impact x Feasibility severity scoring (resource 02)
4. Run severity calibration cross-check (I+F < 6 = not Critical, I+F < 5 = not High)
5. Verify extended coverage gate (§5.14): (a) file-read coverage, (b) panic sweep on consensus files, (c) late-file re-reads on >400-line files, (d) all IN_SCOPE files assigned
6. Verify scratchpad elevation (§5.12)
7. Write `01-audit-report.md`

**Checkpoint:** "Report generated: {N} findings. Coverage: {status}. Finalize?"

**Artifacts:** `01-audit-report.md`

---

### 7. Ensemble Pass (Optional)

**Purpose:** Run the template a second time with a different model configuration on priority-1/2 components. Union-merge with primary results.

**Condition:** `ensemble_enabled == true`

**Merge Strategy:**
- Finding in both runs: high confidence, median severity
- Finding in one run only: include, flag as single-source
- PASS in primary but FAIL in ensemble: escalate as new finding

---

### 8. Gap Analysis (Optional)

**Purpose:** Compare the AI audit report against a professional reference report. Produce finding-by-finding mapping, identify gaps, analyze severity calibration, and provide root cause analysis.

**Condition:** `has_reference_report == true`

**Artifacts:** `02-gap-analysis.md`

---

## Skills

| Skill | Capability | Used By |
|-------|------------|---------|
| `audit-execution` | Core audit execution patterns, agent dispatch, tool usage | All activities |
| `severity-scoring` | Impact x Feasibility severity rubric with calibration examples | report-generation, ensemble-pass |

---

## Resources

| Resource | Purpose |
|----------|---------|
| `00-start-here.md` | Quick start guide and workflow overview |
| `01-audit-template-reference.md` | Pointer to the audit prompt template with section summary |
| `02-severity-rubric.md` | Detailed severity scoring guide with calibration examples |
| `03-toolkit-checklist.md` | Mandatory 7-item toolkit minimum checklist |

---

## Variables

| Variable | Type | Description |
|----------|------|-------------|
| `target_submodule` | string | Path to the submodule being audited |
| `target_commit` | string | Git commit hash to audit |
| `planning_folder_path` | string | Path to planning artifacts folder |
| `template_path` | string | Path to the audit prompt template |
| `reference_report_path` | string | Path to professional audit report (optional) |
| `ensemble_enabled` | boolean | Whether to run ensemble pass (default: false) |
| `has_reference_report` | boolean | Whether gap analysis is available (default: false) |
| `cargo_audit_available` | boolean | Whether cargo audit ran successfully |
| `reconnaissance_complete` | boolean | Phase 1a gate |
| `primary_audit_complete` | boolean | Phase 1b gate |
| `panic_sweep_complete` | boolean | Phase 1.5 gate |
| `adversarial_complete` | boolean | Phase 2 gate (HARD — must complete) |
| `report_complete` | boolean | Phase 3 gate |

---

## Expected Artifacts

| Phase | Artifact | Description |
|-------|----------|-------------|
| Setup | `START-HERE.md` | Session overview and navigation |
| Reconnaissance | `README.md` | Scope, methodology, crate inventory |
| Report | `01-audit-report.md` | Full audit report with numbered findings |
| Gap Analysis | `02-gap-analysis.md` | Comparison against reference report |
| Setup | `cargo-audit-output.txt` | Dependency scan results (if tools available) |
| Setup | `file-inventory.txt` | Source files sorted by line count |
| Setup | `panic-inventory.txt` | All unwrap/expect/panic sites for sweep |
| Panic Sweep | `panic-sweep-findings.md` | Triaged panic sites with severity |