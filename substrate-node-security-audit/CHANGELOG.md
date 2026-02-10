# Changelog

All notable changes to the substrate-node-security-audit workflow.

## v4.10.0 (2026-02-10) — Architectural Analysis Sub-Agent

Introduces a dedicated security architecture analysis sub-agent dispatched during reconnaissance. Separates architectural reasoning (sub-agent) from mechanical domain binding (skill), following the orchestrator role discipline principle.

**Architectural change — Security Architecture Sub-Agent:**
- NEW activity `sub-architectural-analysis` (13-sub-architectural-analysis.toon): A sub-agent dispatched during reconnaissance that performs security-oriented architectural decomposition. Receives the crate map, file inventory, and trust boundaries; returns four structured artifacts:
  1. **Component Interaction Model** — per-component-pair data flows, trust assumptions, and required security properties
  2. **Privilege and Authority Map** — per-operation authority requirements and verification points
  3. **Candidate Point List** — ranked locations where code complexity concentrates (Dowd methodology)
  4. **Emergent Vulnerability Domains** — security-relevant properties that don't map to any §3 checklist item

- REFACTORED skill `map-vulnerability-domains` (1.0.0 → 2.0.0): Now a mechanical binding step that connects architectural artifacts to §3 verification procedures. No longer performs reasoning — consumes the sub-agent's output. New input: `emergent_domains` for ad-hoc review assignments beyond §3.

**Reconnaissance changes (2.3.0 → 2.4.0):**
- +1 step: `dispatch-architectural-analysis` — dispatched after function registry, before domain mapping
- +1 context variable: `architectural_analysis`
- +1 outcome: security architecture analyzed
- Domain mapping step description updated to reflect binding (not reasoning) role

**Design rationale:**
- The orchestrator's role is coordination, not security reasoning (ORCHESTRATOR ROLE DISCIPLINE rule)
- Architectural analysis benefits from a dedicated context window focused on security reasoning over component interactions
- The sub-agent can be dispatched after crate identification completes, running while the function registry is being built
- The output is structured artifacts consumed downstream — same pattern as Group A sub-agents producing findings for the merge step
- Emergent domains extend coverage beyond the finite §3 checklist, addressing a structural limitation of checklist-driven review

---

## v4.9.0 (2026-02-09) — Overfitting Remediation, Vulnerability Domain Mapping

Addresses structural overfitting identified in the S18 overfitting analysis. Replaces 22 target-specific rule references with domain-map-driven generics, removes 11 session statistics from rules/skills/resources, and relocates midnight-specific content to the target profile.

**Architectural change — Vulnerability Domain Mapping:**
- NEW skill `map-vulnerability-domains` (17-map-vulnerability-domains.toon): Maps generic §3 vulnerability classes to specific codebase locations using reconnaissance data. Sub-agents receive dynamically derived domain map entries instead of hardcoded target-specific rules.
- NEW reconnaissance step `map-vulnerability-domains`: Invoked after function registry, before agent assignment. Produces a per-crate partition of vulnerability targets.
- Sub-crate-review rules now reference "§3.X targets in the vulnerability domain map" instead of naming specific functions or files.

**Generalization (Tier 1+3 — 7 rules rewritten):**
- sub-crate-review: VERIFIER RECOMPUTATION → ASYMMETRIC PROVIDER VERIFICATION (generic)
- sub-crate-review: SYSTEM TRANSACTION TYPE EXHAUSTIVENESS → TYPE DISPATCH EXHAUSTIVENESS (generic)
- sub-crate-review: §3.1 FLUSH ORDERING → generalized, example removed
- sub-crate-review: SUPPLEMENTARY FILE BUDGET → target profile reference only
- sub-static-analysis: CONSENSUS-FILE ELEVATION FLOOR → references crate map priority, not file names
- sub-toolkit-review: problem statement, OUTPUT FORMAT, INCLUDE SUBDIRECTORIES, RNG TRIAGE → target symbols removed
- primary-audit: EVENT CONSTRUCTION SITE, CONFIGURATION INVARIANT, HYBRID WAVE → domain map references

**Session statistics removed (Tier 2 — 6 locations):**
- verify-sub-agent-output: removed "LA-P missed in 10/14 sessions"
- verify-sub-agent-output: mandatory tables and event site steps generalized
- resource 05: Check 13 note, Check 15 note, Check 16 note — session references removed

**Resource changes:**
- resource 03 (toolkit checklist): Generalized — all "Specific checks" blocks with midnight function names removed. Generic class definitions, anti-patterns, and verification procedures retained. Deep-check for spend/consume functions generalized from wallet-specific to any resource-consumption pattern.
- resource 05 (static analysis): Session statistics removed from Check 10 (TOOLKIT SCOPE), Check 13, Check 15, Check 16. Target file paths replaced with target profile references.
- resource 06 (target profile): +Toolkit Focus Items section (absorbs 11 specific checks from resource 03); +Vulnerability Domain Hints section (pre-identified targets to seed domain mapping)

**Severity rule:**
- Calibration comparison now conditional on benchmark table availability
- Fallback guidance for targets without professional audit benchmarks

**Activity version bumps:**
- reconnaissance: 2.2.0 → 2.3.0 (+1 step, +1 context variable)
- primary-audit: 4.8.0 → 4.9.0 (3 rules generalized)
- sub-crate-review: 1.5.0 → 1.6.0 (4 rules generalized, +1 context variable)
- sub-static-analysis: 1.4.0 → 1.5.0 (1 rule generalized)
- sub-toolkit-review: 1.2.0 (unchanged version, 4 rules cleaned)

**Skill version bumps:**
- verify-sub-agent-output: 1.3.0 (2 steps generalized)
- map-vulnerability-domains: 1.0.0 (NEW)

**Overfitting metrics (before → after):**
- Target-symbol references in core activities/skills: 22 → 3 (retained: into_rpc, deposit_event, StorageMap — Substrate-universal patterns)
- Session statistics in rules/descriptions: 11 → 0
- Midnight-specific function names in generic resources: 12 → 0 (relocated to target profile)

---

## v4.8.0 (2026-02-09) — Elevation Reliability, Lead Routing, Calibration Enforcement

Addresses 4 persistent regression patterns identified across Sessions 05–18 regression analysis (S18: 91% overlap, 4 gaps).

**Root causes targeted:**
- Table-derived finding elevation failure (LA-P missed in 10/14 sessions despite appearing in struct diff tables)
- Reconnaissance lead routing failure (LA-Y missed in S18 despite 83% historical detection rate)
- Static analysis hit suppression in consensus files (LA-W, LA-AF under-elevated)
- Severity under-rating for operational hazards (~1 level below LA calibration)

**Activity changes:**
- reconnaissance (2.1.0 → 2.2.0): +1 step (route-reconnaissance-leads), +1 context variable (leads_routing)
- primary-audit (4.7.0 → 4.8.0): +1 rule (RECONNAISSANCE LEAD INCLUSION)
- sub-crate-review (1.4.0 → 1.5.0): +1 rule (RPC SUBSCRIPTION LIMIT VERIFICATION)
- sub-static-analysis (1.3.0 → 1.4.0): +1 rule (CONSENSUS-FILE ELEVATION FLOOR)

**Skill changes:**
- verify-sub-agent-output (1.2.0 → 1.3.0): extract-table-findings step rewritten as deterministic cell-level scan with keyword match protocol

**Workflow rule changes:**
- Severity scoring rule strengthened with DIVERGENCE GATE: >=2 level divergence from calibration benchmark triggers mandatory recalculation

**Resource changes:**
- target-profile (resource 06): Node agent supplementary files expanded to include `node/src/rpc.rs` for subscription limit verification

**Regression targets:**

| Gap | LA ID | Root Cause | Fix |
|-----|-------|-----------|-----|
| Table elevation failure | LA-P | Orchestrator skips table cells | Deterministic cell-level scan in verify skill |
| Recon lead lost | LA-Y | Pattern noted but not routed to agent | Explicit leads routing step + inclusion rule |
| RPC fan-out missed | LA-W | No dedicated subscription check | Sub-crate-review rule + RPC supplementary file |
| Hits not elevated | LA-AF | Low hits in consensus files suppressed | Consensus-file elevation floor in static analysis |
| Severity under-rating | LA-F,G,J,L | F=2 for config hazards | Divergence gate forces benchmark floor |

---

## v4.7.0 (2026-02-09) — Quality Refactoring, Target Profiles, Rule Retirement

Addresses 6 gaps from Session 17 gap analysis plus quality improvements from workflow review.

**Structural changes:**
- NEW resource 06 (target-profile): Target-specific crate assignments, file paths, calibration data, and ensemble blind-spot items factored out of core workflow rules
- Rule retirement process established: superseded rules removed at each version bump (see target profile retirement log)
- Calibration examples moved from resource 02 to target profile — core severity rubric is now target-agnostic
- Session-specific narratives removed from rule text — rules contain only directives and verification criteria

**Rules compressed and consolidated (24 → 20 workflow rules, 21 → 17 primary-audit rules):**
- Removed: `panic_sweep_complete` variable (vestigial)
- Retired: INHERENT ASYMMETRY CLASSIFICATION (v4.4, superseded by v4.7 VERIFIER RECOMPUTATION)
- Retired: CROSS-CHAIN TIMESTAMP SCOPE (v4.4, consolidated into sub-crate-review DEFAULT-FAIL)
- Merged: MECHANICAL PATTERN COVERAGE (v4.3) scope clauses absorbed into Check 3 and target profile

**Resource changes:**
- resource 02: Calibration examples → profile reference; under-rating guidance consolidated
- resource 03: +Item 8 (RNG triage) — fixes checklist count mismatch (activity said 8, resource had 7)
- resource 05: Check 8 and Check 12 merged into Check 3; DB grep patterns merged into one; +Check 15 SSL/TLS; +Check 16 Wasm host functions
- resource 06 (NEW): Target profile for midnight-node

**Activity changes:**
- workflow.toon (4.6.0 → 4.7.0): 24 → 20 rules, 18 → 17 variables
- primary-audit (4.6.0 → 4.7.0): 21 → 17 rules, +1 step (checklist-to-prompt coverage gate)
- sub-crate-review (1.2.0 → 1.3.0): Session narratives compressed, rules unchanged in count
- ensemble-pass (2.2.0 → 2.3.0): Blind-spot list references target profile; supplementary files from profile

**Rule retirement process (Q10):**
At each version bump, review all rules for superseded content. If a newer rule is strictly more specific than an older rule on the same check, retire the older rule with an entry in the target profile's retirement log. Target: keep total rule count (workflow + primary-audit + sub-crate-review) below 50.

**Session 17 regression fixes (from v4.7.0 initial commit):**
- R1: Check 15 (SSL/TLS enforcement)
- R2: Timestamp source default-FAIL for cross-chain pallets
- R3: VerifierCIDP recomputation requirement
- R4: System transaction type exhaustiveness check
- R5: Check 16 (Wasm host function feature divergence)
- R6: Wallet spend deep-check in resource 03
- R7: Ensemble blind-spot list expanded (4 universal + target-specific)
- R8: Severity calibration anchors for operational hazards (in target profile)
- R9: Checklist-to-prompt coverage gate

---

## v4.6.0 (2026-02-09) — Session 16 Regression Countermeasures and Blind-Spot Targeting

Addresses 4 regressions from Session 16 vs Session 15 (82% → 89% LA match rate regression on Low-severity findings) while preserving Session 16's improvements in severity calibration (all Critical findings correctly rated). Also adds ensemble blind-spot targeting based on validated false-PASS patterns.

**Session 16 performance context:**

| Session | Version | Agents | LA Match | LA Match+Partial | Critical Accuracy | Severity Calibration |
|---------|---------|--------|----------|-----------------|-------------------|---------------------|
| S15 | v4.5 | 5 (combined) | **89%** | 93% | 2/3 (67%) | 3 findings ±2 levels |
| S16 | v4.5 | 8 (individual) | 82% | 91% | **3/3 (100%)** | **0 findings ±2 levels** |

Session 16 had better Critical finding accuracy and severity calibration but regressed on 4 Low-severity findings. This release targets both.

**New workflow rules (4):**
- MANDATORY TABLE AUTO-ELEVATION (v4.6): Orchestrator scans mandatory tables for FAIL/DIFF/Missing cells and auto-promotes to findings. Fixes the scratchpad-to-report elevation failure pattern (LA-P utxo_index regression).
- DEFENSE-IN-DEPTH VALIDATION (v4.6): §3.6 input validation PASS requires evidence at consumption layer, not just production layer. Fixes LA-Q Cardano address regression.
- MANDATORY WEIGHTS.RS READ (v4.6): Sub-agents must read weights.rs for §3.1 checks. Fixes the primary-pass miss on LA-A (weight benchmarks) that required ensemble to catch.
- ENSEMBLE TARGETED BLIND-SPOTS (v4.6): Ensemble agent verifies historically high false-PASS items first before general review.

**Activity changes:**
- primary-audit (4.5.0 → 4.6.0): +3 rules (table auto-elevation, event construction site verification, hybrid wave dispatch), +1 step (extract-table-derived-findings before structured-merge)
- sub-crate-review (1.1.0 → 1.2.0): +3 rules (defense-in-depth validation, mandatory weights.rs read, supplementary file budget)
- ensemble-pass (2.1.0 → 2.2.0): +2 rules (targeted blind-spot verification, ensemble supplementary files), +1 step (verify-blind-spots before execute-second-pass)

**Skill changes:**
- verify-sub-agent-output (1.1.0 → 1.2.0): +2 protocol steps (extract-table-findings, verify-event-construction-site)
- apply-checklist (1.0.0 → 1.1.0): Updated produce-tables step with weight accounting table and defense-in-depth validation requirements

**Resource changes:**
- 05-static-analysis-patterns.md:
  - +1 grep pattern: File I/O Safety (universal scope, not toolkit-only) — fixes LA-AI regression
  - +1 mechanical check: Check 13 Universal File I/O Safety
  - Updated Check 3: Serialization Size/Method Pairing now requires mandatory pairing table — fixes LA-AA regression
  - Renumbered Check 13 (Error Type Topology Leakage) → Check 14

**Regression targets:**

| Regression | LA ID | Root Cause | Fix |
|-----------|-------|-----------|-----|
| utxo_index not elevated | LA-P | Scratchpad elevation failure | Rec 1: Table auto-elevation |
| Cfg::load_spec file I/O | LA-AI | File I/O checklist scope | Rec 2: Universal file I/O in resource 05 |
| Buffer prealloc function name | LA-AA | Agent didn't compare names | Rec 3: Mandatory pairing table in Check 3 |
| Cardano address validation | LA-Q | Defense-in-depth philosophy | Rec 4: Consumption-layer validation rule |

**Primary-pass blind-spot targets:**

| Blind Spot | LA ID | Root Cause | Fix |
|-----------|-------|-----------|-----|
| Weight benchmark zero | LA-A | weights.rs not read | Rec 5: Mandatory weights.rs read |
| Event partial success | LA-E | Wrong construction site checked | Rec 6: Event construction site gate |

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
