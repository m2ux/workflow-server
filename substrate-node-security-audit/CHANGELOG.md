# Changelog

All notable changes to the substrate-node-security-audit workflow.

## v4.3.0 (2026-02-09) — Skill Decomposition and Schema Alignment

**Skill architecture refactored** from 3 monolithic skills to 15 composable single-responsibility skills:
- **Orchestrator skills (6):** `execute-audit`, `score-severity`, `dispatch-sub-agents`, `verify-sub-agent-output`, `merge-findings`, `compare-finding-sets`
- **Analysis skills (8):** `apply-checklist`, `build-function-registry`, `extract-invariants`, `scan-storage-lifecycle`, `decompose-safety-claims`, `map-codebase`, `setup-audit-target`, `search-pattern-catalog`
- **Sub-agent skills (1):** `execute-sub-agent`

**Schema alignment:**
- Activity `notes` field renamed to `rules` across all activities — aligns with workflow-level `rules` field and makes the imperative nature explicit
- `modeOverrides` and `modes` added to the Zod schema (previously only in JSON schema)
- `artifactLocations` now accepts string shorthand in addition to full object form

**Activity version bumps:**
- scope-setup: 1.0.0 → 2.0.0
- reconnaissance: 1.0.0 → 2.0.0
- adversarial-verification: 1.0.0 → 2.0.0
- ensemble-pass: 1.0.0 → 2.0.0
- gap-analysis: 1.0.0 → 2.0.0
- sub-static-analysis: 1.1.0 → 1.3.0

**Mechanical pattern coverage (v4.3 workflow rule):**
- Group B checks #8/#12 must cover ledger internal API files (`ledger/src/versions/*/api/*.rs`)
- Check #11 must cover all state query functions
- Check #10 must trace each SmallRng hit to its usage context
- Targets 3 remaining gaps from S13 validation (LA-AA, LA-AD, LA-AQ)

**Variables added:**
- `in_scope` — space-separated list of crate/module paths to audit
- `out_of_scope` — space-separated list of exclusions

**Validated performance:**

| Session | Version | Agents | LA Overlap | Critical Coverage |
|---------|---------|--------|-----------|-------------------|
| S06 | v4.0 | 8 (6A+1B+1D) | 55% | 1/3 (33%) |
| S08 | v4.0 | 8 | ~65% | 2/3 (67%) |
| S11 | v4.0 | 8 (6A+1B+1D) | **93%** | 3/3 (100%) |
| S12 | v4.1 | 3 (0A+1B+1D) | 82% | 3/3 (100%) |

S11's 93% overlap with the Least Authority professional audit represents the current validated ceiling. The v4.3 changes target the 3 remaining gaps (LA-AA, LA-AD, LA-AQ) identified in S13's 93% overlap validation.

## v4.2.0 (2026-02-09) — Regression Countermeasures

Addresses the 11pp coverage regression identified in Session 12 vs Session 11 (82% → 93% overlap with Least Authority reference report). Root cause: Session 12 dispatched 0 Group A agents, the orchestrator performed crate-level review itself, and the coverage gate was not enforced.

**New workflow rules (4):**
- Orchestrator role discipline — orchestrator coordinates, does not perform crate-level review
- Coverage gate hard stop — report generation blocked until all >200-line files confirmed read
- Wave-based Group A dispatch — agents dispatched in waves when platform limits concurrency
- Mandatory output verification — structured tables required from all Group A and D agents

**Primary audit restructured (3.0.0 → 4.0.0):**
- Wave dispatch replaces single concurrent dispatch (dispatch-wave-1 + dispatch-wave-2)
- 3 new verification gate steps between collection and merge (coverage, tables, StorageInit)
- 5 new activity-level rules documenting each gate's validation requirements and failure actions

**Report generation (3.0.0 → 3.1.0):**
- Blocking entry condition — coverage gate must pass before report begins
- Mandatory table verification added

**Sub-static-analysis (1.0.0 → 1.1.0):**
- +3 mechanical checks: preallocation mismatch, mock data source toggle, SmallRng/block-hash RNG

**Sub-toolkit-review (1.0.0 → 1.1.0):**
- Output format strictly enforced — prose without tables rejected
- Function count cross-verification via grep
- Subdirectory inclusion requirement

**Audit prompt template:**
- +§2.10 Serialization Pre-Allocation Mismatch (mechanical search)
- +§2.11 Mock Data Source Toggle Detection (mechanical search)
- §3.3 hard-gate annotation (per-field trace table verified by orchestrator)
- §3.5 hard-gate annotation (StorageInit construction site enumeration table)

## v4.1.0 (2026-02-09) — Sub-Agent Workflow Activities

Added dedicated workflow activities for sub-agents (sub-crate-review, sub-static-analysis, sub-toolkit-review) with step-by-step execution, required outputs, and structured output schema.

## v4.0.0 (2026-02-08) — Multi-Agent Orchestration

Initial multi-agent architecture with Groups A, B, D. Structured merge table, severity calibration, contamination prevention.
