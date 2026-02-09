# Security Audit Workflow

> Multi-phase AI security audit for Substrate-based blockchain node codebases. Orchestrates reconnaissance, wave-based multi-agent deep review, adversarial verification, severity-calibrated reporting, optional ensemble passes, and gap analysis against professional audit reports.

## Overview

This workflow guides the complete lifecycle of a security audit:

1. **Scope Setup** — Confirm target, checkout at commit, run dependency scanning, create planning folder
2. **Reconnaissance** — Map architecture, identify crates, trust boundaries, consensus paths, build function registry, assign agent groups
3. **Primary Audit** — Wave-based concurrent dispatch of specialized agent groups against the codebase, followed by verification gates and finding consolidation
4. **Adversarial Verification** — Decompose and independently verify every PASS item from agent scratchpads
5. **Report Generation** — Consolidate all phases, apply severity scoring with calibration cross-check, produce report
6. **Ensemble Pass** (optional) — Second-model run on priority-1/2 components, union-merge with primary results
7. **Gap Analysis** (optional) — Compare against a professional audit report for benchmarking

**Design principles:**
- Fully automated sequential flow with phase gates
- **Goal → Activity → Skill → Tools** ontology with progressive disclosure
- Workflow-directed sub-agents that bootstrap the workflow-server, load assigned activities, and follow steps sequentially with verifiable outputs
- Composable skill architecture — 15 single-responsibility skills across orchestrator, analysis, and sub-agent tiers
- Wave-based agent dispatch to work within platform concurrency limits
- Verification gates between agent collection and finding consolidation
- The orchestrator coordinates and dispatches — sub-agents perform deep crate-level review
- Impact × Feasibility severity scoring with target-profile-backed calibration examples
- Contamination prevention — reference report quarantined until gap-analysis phase
- Target profile (resource 06) separates target-specific configuration from core workflow rules

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

The reference report is loaded only after the report is finalized — never during the audit itself.

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
    PA --> AV[adversarial-verification]
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

## Primary Audit — Wave-Based Agent Dispatch

The primary audit dispatches specialized agent groups in waves, collects their structured output, runs verification gates, and consolidates findings. When the platform limits concurrent sub-agents, agents are partitioned into waves that execute sequentially while agents within each wave run concurrently.

### Agent Groups

| Group | Agents | Activity | Scope |
|-------|--------|----------|-------|
| A | 1 per priority-1/2 crate (~6 agents) | `sub-crate-review` | Full crate file read, §3 checklist, invariant extraction, cross-function comparison |
| B | 1 | `sub-static-analysis` | All §2 grep patterns, mechanical checks, storage lifecycle pairing |
| D | 1 | `sub-toolkit-review` | Toolkit crates (see target profile) with 8-item checklist applied per-function |

### Dispatch and Consolidation

```mermaid
graph LR
    REC[Reconnaissance<br/>agent assignments] --> FORK1(( ))

    FORK1 --> A1["A1: Priority-1 crate"]
    FORK1 --> A2["A2: Priority-1 crate"]
    FORK1 --> A3["A3: Priority-1 crate"]
    FORK1 --> B["B: Static Analysis"]
    FORK1 --> D["D: Toolkit Review"]

    A1 --> JOIN1(( ))
    A2 --> JOIN1
    A3 --> JOIN1
    B --> JOIN1
    D --> JOIN1

    JOIN1 --> FORK2(( ))

    FORK2 --> A4["A4: Combined P2"]
    FORK2 --> A5["A5: Combined P2"]

    A4 --> JOIN2(( ))
    A5 --> JOIN2

    JOIN2 --> VER["Verification Gates"]
    VER --> MERGE["Structured Merge<br/>Dedup + Map<br/>§3 Completeness"]

    style FORK1 fill:#333,stroke:#666,color:#333
    style JOIN1 fill:#333,stroke:#666,color:#333
    style FORK2 fill:#333,stroke:#666,color:#333
    style JOIN2 fill:#333,stroke:#666,color:#333
    style VER fill:#e6553a,stroke:#c44,color:#fff
```

Wave 1 covers the highest-priority crates (Group A), static analysis (Group B), and toolkit review (Group D). Wave 2 combines remaining crates into fewer agents per the target profile. Both waves complete before verification begins.

### Verification Gates

Between agent collection and consolidation, the orchestrator runs verification checks. Any failure triggers targeted follow-up agent dispatch before proceeding.

| Gate | What It Checks | On Failure |
|------|---------------|------------|
| **Dispatch Completeness** | Every crate assigned during reconnaissance has a corresponding dispatched agent | Dispatch missing agents |
| **File Coverage** | Every `.rs` file >200 lines in priority-1/2 crates was read by a checklist-applying Group A agent | Dispatch targeted follow-up agents |
| **Output Tables** | Each Group A agent produced required analysis tables; Group D produced function × checklist matrix | Re-dispatch with explicit format instructions |
| **StorageInit Trace** | The node agent enumerated all genesis state construction sites and genesis header construction | Dispatch targeted follow-up |

### Sub-Agent Activity Flows

Each sub-agent bootstraps the workflow-server, loads its assigned activity and the `execute-sub-agent` skill, then follows steps sequentially with verifiable outputs.

#### `sub-crate-review` (Group A — one per crate)

```mermaid
graph LR
    CR1[Read all files] --> CR2[Build function registry]
    CR2 --> CR3[Extract invariants]
    CR3 --> CR4[Apply checklist]
    CR4 --> CR5[Produce analysis tables]
    CR5 --> CR6[Cross-function comparison]
    CR6 --> CR7[Verify completeness]
    CR7 --> CR8[Format output]
```

#### `sub-static-analysis` (Group B)

```mermaid
graph LR
    SA1[Run grep patterns] --> SA2[Run mechanical checks]
    SA2 --> SA3[Storage lifecycle scan]
    SA3 --> SA4[Zero-hit audit]
    SA4 --> SA5[Aggregate findings]
    SA5 --> SA6[Format output]
```

Uses the `search-pattern-catalog` supporting skill for catalog-based pattern execution. Mechanical checks include preallocation mismatch, mock data source toggle, and SmallRng security-context triage.

#### `sub-toolkit-review` (Group D)

```mermaid
graph LR
    TK1[Enumerate functions] --> TK2[Apply checklist per function]
    TK2 --> TK3[Verify function coverage]
    TK3 --> TK4[Format output]
```

Produces three structured tables: function enumeration, function × checklist matrix, and coverage attestation.

### Sub-Agent Ontology

```mermaid
graph TD
    subgraph activity ["Activity — defines WHAT"]
        STEPS["Step skeleton"]
        RULES["Constraints"]
    end
    subgraph skill ["Skill — defines HOW"]
        BOOT[Bootstrap protocol]
        EXEC[Step execution]
        VERIFY[Self-verification]
    end
    subgraph supporting ["Supporting skills"]
        SPC["search-pattern-catalog"]
    end
    subgraph resources ["Resources — defines WITH WHAT"]
        R04["Output schema"]
        R05["Static analysis patterns"]
        R03["Toolkit checklist"]
    end
    STEPS -->|"skills.primary"| BOOT
    RULES -->|"constraints"| EXEC
    BOOT --> EXEC
    EXEC -->|"get_resource()"| R04
    EXEC -->|"get_resource()"| R05
    EXEC -->|"get_resource()"| R03
    EXEC -->|"skills.supporting"| SPC
    EXEC --> VERIFY
```

| Group | Activity | Primary Skill | Supporting Skills | Resources | Key Outputs |
|-------|----------|--------------|-------------------|-----------|-------------|
| A | `sub-crate-review` | `execute-sub-agent` | — | Output schema | Findings, checklist coverage, analysis tables |
| B | `sub-static-analysis` | `execute-sub-agent` | `search-pattern-catalog` | Output schema, static analysis patterns | Pattern hits, storage pairing, zero-hit audit |
| D | `sub-toolkit-review` | `execute-sub-agent` | — | Toolkit checklist, output schema | Function × checklist matrix, coverage attestation |

---

## Activities

### 1. Scope Setup

Confirm target submodule and commit, checkout codebase, run dependency scanning, create planning folder.

**Skills:** `execute-audit`, `artifact-management`

**Steps:** confirm-target → confirm-commit → record-reference → checkout-submodule → run-cargo-audit → create-file-inventory → create-planning-folder → load-template

**Artifacts:** `START-HERE.md`

---

### 2. Reconnaissance

Map the codebase architecture, identify all crates, trust boundaries, consensus paths, and build the function registry. Assign crates to sub-agent groups with cross-crate supplement mappings.

**Skill:** `execute-audit`

**Steps:** identify-crates → map-architecture → identify-trust-boundaries → identify-consensus-paths → identify-pallet-hooks → map-data-flows → check-send-sync → build-function-registry → assign-agent-groups

**Artifacts:** `README.md` (scope and architecture summary)

---

### 3. Primary Audit

Execute the multi-agent audit via wave-based dispatch. Verify agent output completeness and file coverage before consolidating findings.

**Skill:** `execute-audit`

**Steps:** dispatch-wave-1 → dispatch-wave-2 → verify-checklist-prompt-coverage → verify-dispatch-completeness → collect-all → verify-coverage-gate → verify-mandatory-tables → verify-storageinit-trace → extract-table-derived-findings → structured-merge → dedup-and-map → verify-checklist-completeness

---

### 4. Adversarial Verification

Verify every High/Medium PASS item from audit scratchpads by decomposing each claim into constituent properties and independently verifying each one. The agent's role is to refute, not confirm.

**Skill:** `execute-audit`

**Steps:** extract-pass-items → decompose-claims → field-enumeration → verify-properties → compile-results

---

### 5. Report Generation

Consolidate all findings from primary audit and adversarial verification. Apply severity scoring with calibration cross-check. Produce the deliverable report.

**Skills:** `execute-audit`, `score-severity`

**Steps:** integrate-adversarial-results → apply-severity → severity-crosscheck → coverage-gate → verify-elevation-completeness → write-report

**Artifacts:** `01-audit-report.md`

---

### 6. Ensemble Pass (Optional)

Run the audit template a second time with a different model configuration on priority-1/2 components. Union-merge with primary results. If context constraints prevent a full second pass, a reduced-scope pass is preferable to skipping.

**Condition:** `ensemble_enabled == true`

**Merge strategy:**
- Finding in both runs → high confidence, median severity
- Finding in one run only → include, flag as single-source
- PASS in primary but FAIL in ensemble → escalate as new finding

**Artifacts:** `second-pass-findings.md`

---

### 7. Gap Analysis (Optional)

Compare the AI audit report against a professional reference report. Produce finding-by-finding mapping, identify gaps, analyze severity calibration, and provide root cause analysis.

**Condition:** `has_reference_report == true`

**Artifacts:** `02-gap-analysis.md`

---

### Sub-Agent Activities

These activities are dispatched by the orchestrator during the primary-audit phase. They do not appear in the main workflow transition graph.

| Activity | Used By | Description |
|----------|---------|-------------|
| `sub-crate-review` | Group A | 8-step structured crate review: file reading → function registry → invariant extraction → §3 checklist → analysis tables → cross-function comparison → completeness verification → structured output |
| `sub-static-analysis` | Group B | 6-step structured static analysis with catalog-based pattern execution, zero-hit auditing, storage lifecycle pairing, and mechanical checks |
| `sub-toolkit-review` | Group D | Per-function 8-item checklist application across all toolkit files with function × checklist matrix |

---

## Skills

Skills define tool orchestration, protocols, and composable capabilities.

### Orchestrator Skills

| Skill | Capability | Used By |
|-------|------------|---------|
| `execute-audit` | Orchestrator-level audit execution, agent dispatch coordination, consolidation | All orchestrator activities |
| `score-severity` | Impact × Feasibility severity scoring with calibration examples | report-generation, ensemble-pass |
| `dispatch-sub-agents` | Compose sub-agent prompts, dispatch concurrently, verify dispatch completeness | primary-audit |
| `verify-sub-agent-output` | Validate structural completeness, file coverage, output tables | primary-audit |
| `merge-findings` | Concatenate finding lists, deduplicate by root cause, assign finding numbers | primary-audit, ensemble-pass |
| `compare-finding-sets` | Finding-by-finding mapping, classify matches/gaps, severity calibration analysis | gap-analysis |

### Analysis Skills

| Skill | Capability | Used By |
|-------|------------|---------|
| `apply-checklist` | Iterate items against checklist entries, produce verdict matrix | primary-audit, sub-crate-review, sub-toolkit-review |
| `build-function-registry` | Enumerate functions by type and priority | reconnaissance, sub-crate-review |
| `extract-invariants` | Enumerate pre/post conditions and cross-function invariants | sub-crate-review |
| `scan-storage-lifecycle` | Find storage map insert/remove sites, verify pairing | sub-static-analysis |
| `decompose-safety-claims` | Decompose PASS verdicts into independently verifiable properties | adversarial-verification |
| `map-codebase` | Build structured architectural map from component inventory | reconnaissance |
| `setup-audit-target` | Validate target codebase, run dependency scanning, file inventory | scope-setup |
| `search-pattern-catalog` | Execute catalog patterns against codebase scope, triage results | sub-static-analysis |

### Sub-Agent Skills

| Skill | Capability | Used By |
|-------|------------|---------|
| `execute-sub-agent` | Bootstrap workflow-server, load assigned activity, follow steps, return structured output | All sub-agent activities |

---

## Resources

Resources contain detailed reference content loaded on demand by skills.

| Index | Resource | Content | Loaded By |
|-------|----------|---------|-----------|
| `00` | `start-here.md` | Quick start guide and workflow overview | Orchestrator bootstrap |
| `01` | `audit-template-reference.md` | Audit prompt template summary | Orchestrator setup |
| `02` | `severity-rubric.md` | Impact/Feasibility scales and severity mapping | `score-severity` skill |
| `03` | `toolkit-checklist.md` | 8-item toolkit minimum checklist | `execute-sub-agent` (toolkit review) |
| `04` | `sub-agent-output-schema.md` | Structured output schema with per-group requirements | `execute-sub-agent` (all) |
| `05` | `static-analysis-patterns.md` | Grep patterns, mechanical checks, storage lifecycle patterns | `search-pattern-catalog` |
| `06` | `target-profile.md` | Target-specific crate assignments, file paths, calibration data, ensemble blind-spots | Orchestrator setup, `score-severity`, ensemble |

---

## Variables

| Variable | Type | Description |
|----------|------|-------------|
| `target_submodule` | string | Path to the submodule being audited |
| `target_commit` | string | Git commit hash to audit |
| `in_scope` | string | Crate/module paths to audit |
| `out_of_scope` | string | Exclusions |
| `planning_folder_path` | string | Path to planning artifacts folder |
| `template_path` | string | Path to the audit prompt template |
| `reference_report_path` | string | Path to professional audit report (optional) |
| `ensemble_enabled` | boolean | Whether to run ensemble pass |
| `has_reference_report` | boolean | Whether gap analysis is available |
| `cargo_audit_available` | boolean | Whether cargo audit ran successfully |
| `reconnaissance_complete` | boolean | Phase 1a gate |
| `primary_audit_complete` | boolean | Phase 1b gate |
| `adversarial_complete` | boolean | Phase 2 gate |
| `report_complete` | boolean | Phase 3 gate |
| `agents_assigned` | number | Agents assigned during reconnaissance |
| `agents_dispatched` | number | Agents dispatched across all waves |
| `dispatch_complete` | boolean | All assigned agents dispatched and returned |

---

## Expected Artifacts

| Phase | Artifact | Description |
|-------|----------|-------------|
| Setup | `START-HERE.md` | Session overview and navigation |
| Setup | `cargo-audit-output.txt` | Dependency scan results (if tools available) |
| Setup | `file-inventory.txt` | Source files sorted by line count |
| Reconnaissance | `README.md` | Scope, methodology, crate inventory |
| Report | `01-audit-report.md` | Full audit report with numbered findings |
| Ensemble | `second-pass-findings.md` | Raw findings from second-pass run |
| Gap Analysis | `02-gap-analysis.md` | Comparison against reference report |

See [CHANGELOG.md](CHANGELOG.md) for version history.
