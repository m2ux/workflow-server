# Changelog

All notable changes to the substrate-node-security-audit workflow.

## v4.14.0 (2026-02-11) — Supplementary Vulnerability Pattern Integration (Reports 21–22)

Integrates 3 new vulnerability patterns (V31–V33) and 1 pattern extension (V4) derived from analysis of 2 additional SlowMist audit reports for Substrate-based projects (Fusotao, Litentry-node). Also reinforces 3 existing patterns (V3, V15, V16) with new source evidence.

**Source reports:**
- 21-fusotao-slowmist.md — Fusotao (Substrate/Octopus, off-chain DEX verification), SlowMist, April 2022
- 22-litentry-slowmist.md — Litentry-node account-linker module (Substrate pallet), SlowMist, January 2021

**Track 1 — New mechanical checks (resource 05, executed by Group B):**
- +Check 27: Hardcoded Trivial Weight on Extrinsics (V32) — literal weight constants below 10,000 on user-callable extrinsics enable block-filling DoS
- +Check 28: Unbounded Temporal Parameter (V33) — future-pointing block number/timestamp parameters without maximum offset allow indefinite signature validity, permanent locks
- +Check 29: Missing `#[transactional]` on Multi-Write Storage Operations (V31) — `decl_module!` pallets and hook paths without transactional wrapping allow partial state corruption
- +Check 30: RPC Method Access Control / DenyUnsafe Gating — custom RPC handlers exposing sensitive operations (signing, key management) without `DenyUnsafe` guard
- +Check 31: Event Emission Fidelity / False Top-Up Prevention — financial events emitted before state finalization, with incorrect amounts, or on reverting error paths

**Track 1a — SlowMist Blockchain Common Vulnerability List cross-reference (resource 05):**
- Checks 30–31 derived from code-level mapping of the [SlowMist Blockchain Common Vulnerability List](https://github.com/slowmist/Cryptocurrency-Security-Audit-Guide/blob/main/Blockchain-Common-Vulnerability-List.md)
- Check 30 maps the "Ethereum Black Valentine's Day" RPC attack class to Substrate's `DenyUnsafe` mechanism
- Check 31 maps the "False Top-Up Attack" class to Substrate's event emission model
- Remaining 20+ items in the SlowMist list are protocol/network/infrastructure-level (consensus attacks, P2P topology, BGP hijack, etc.) — not detectable by code-level audit; documented as out-of-scope in planning artifact

**Track 2 — Pattern extension (resource 07, consumed by architectural analysis sub-agent):**
- V4 extended: "Immutable Erroneous State" variant — entity-creation extrinsics with no corresponding update/correction/removal mechanism

**Pattern reinforcements (frequency evidence, no structural change):**
- V3 (Unbounded Vec): +2 sources (Fusotao/SlowMist, Litentry/SlowMist) → 4 total independent sources
- V15 (Cross-Chain Replay): +1 source (Litentry/SlowMist) → 2 total, cross-auditor validated
- V16 (Narrowing Type Casts): +1 source (Litentry/SlowMist) → 3 total

**Not integrated (with rationale):**
- Fusotao N2 (saturating vs checked on weights): standard Substrate practice, not a vulnerability
- Fusotao N4 (DoS via transaction volume): application-specific economic tuning
- Fusotao N6 (low registration threshold): application-specific economic parameter
- Litentry 4.3 (SmallVec CVE): covered by existing `cargo audit` / `cargo-geiger` methodology insight
- Litentry (discarded caller identity): design-intentional for account-linking use case

**Planning artifact:** `.engineering/artifacts/planning/2026-02-11-25-vulnerability-pattern-update/`

---

## v4.13.0 (2026-02-10) — Session 19 Gap Analysis Remediation

Addresses 4 gap categories identified in Session 19 gap analysis (95.5% overlap with Least Authority professional audit, 2 gaps, 2 partial matches). Changes close the specific detection paths that caused each miss.

**Gap 1 — Configuration-variant panic (Issue X: DB path panic on InMemory config):**
- +workflow rule: CONFIGURATION-VARIANT PANIC TRIAGE — agents must enumerate all valid config variants for each expect()/unwrap() on config-derived Options
- +primary-audit step: `verify-config-variant-triage` — orchestrator verifies node agent produced configuration-variant triage table
- +sub-crate-review rule: CONFIGURATION-VARIANT PANIC TRIAGE with mandatory triage table format
- +resource 05: Check 25 (Configuration-Variant Panic Triage) — mechanical check with enumeration protocol
- +verify-sub-agent-output: `check-config-variant-triage` protocol step

**Gap 2 — Genesis parsing path coverage (Issue Y: extrinsics truncation):**
- +workflow rule: GENESIS PARSING PATH COVERAGE — node agent must trace ALL genesis data parsing paths, not just StorageInit
- +primary-audit step: `verify-genesis-parsing-coverage` — orchestrator verifies all 4 genesis parsing paths traced
- +primary-audit rule: GENESIS PARSING PATH ENUMERATION
- +resource 05: Check 26 (Genesis Data Parsing Truncation) — mechanical check for silent truncation
- +verify-sub-agent-output: `check-genesis-parsing-coverage` protocol step

**Partial match — Error-path storage persistence (Issue I: UtxoOwners orphan on event construction failure):**
- +primary-audit rule: ERROR-PATH STORAGE PERSISTENCE
- +sub-crate-review rule: ERROR-PATH STORAGE PERSISTENCE with mandatory table format
- +apply-checklist rule: `error-path-storage-persistence` with insert→fallible-op→revert verification protocol
- +verify-sub-agent-output: `check-error-path-persistence` protocol step

**Partial match — Canonical-state writeback in toolkit (Issue AO: DustWallet stale state):**
- +resource 03 (toolkit checklist): strengthened item 2 with explicit canonical-state vs tracker-state distinction and validated gap note
- +apply-checklist rule: `toolkit-canonical-state-writeback` — PASS on tracker alone is insufficient

**Target profile updates (resource 06):**
- +4 severity calibration benchmarks (DB path panic, genesis truncation, canonical-state writeback, error-path persistence)
- +4 ensemble blind-spot items (#12-#15) for the new gap patterns

**Version bumps:**
- workflow.toon: 4.12.0 → 4.13.0
- primary-audit: 4.9.0 → 4.10.0
- sub-crate-review: 1.7.0 → 1.8.0
- verify-sub-agent-output: 1.3.0 → 1.4.0
- apply-checklist: 1.2.0 → 1.3.0

---

## v4.12.0 (2026-02-10) — Cross-Project Vulnerability Pattern Integration

Integrates 12 new vulnerability patterns (V1-V10, V13, V16) derived from cross-project analysis of 20 professional Substrate audit reports (Trail of Bits, SlowMist, Hacken, Halborn, Veridise, SRLabs, Zellic, Quantstamp, Code4Arena, CoinFabrik, Oak Security). Patterns split into two tracks by detection mode.

**Track 1 — Mechanical checks (resource 05, executed by Group B):**
- +Check 19: Ignored Balance Primitive Return Values (V2) — `unreserve`/`slash` return values discarded
- +Check 20: Unbounded Vec in Extrinsic Parameters (V3) — `Vec<T>` instead of `BoundedVec`
- +Check 21: Unit-Type Trait Silencing in Runtime Config (V5) — `type X = ()` disabling security mechanisms
- +Check 22: Dangerous Semantic Defaults on Storage Lookup (V7) — zero-timestamp, wrong-decimal defaults
- +Check 23: Silent Error Swallowing in Hook Financial Ops (V8) — `if let Ok` without `else` on Currency ops
- +Check 24: Narrowing Type Casts Without Bounds Check (V16) — `as u8`/`as u32` truncation

**Track 2 — Reasoning patterns (new resource 07, consumed by architectural analysis sub-agent):**
- NEW resource 07 (vulnerability-pattern-vocabulary.md): 6 named patterns (V1, V4, V6, V9, V10, V13) with trigger conditions and FINDING criteria, consumed during emergent domain identification

**Activity changes:**
- sub-architectural-analysis (1.1.0 → 1.2.0): identify-emergent-domains step references resource 07

**Design rationale:**
- Mechanical patterns (grep-detectable) go in resource 05 with full Search/Verify/FAIL structure — Group B needs this to produce hits
- Reasoning patterns (require data-flow tracing or cross-function comparison) go in a sparse vocabulary resource — the architectural sub-agent needs recognition aids, not grep strings
- Zero impact on Group A, Group D, or orchestrator context

---

## v4.11.0 (2026-02-10) — External Security Pattern Integration

Integrates 3 of 8 gaps identified from cross-project security pattern analysis (SRLabs, MixBytes, SlowMist, CoinFabrik Scout Substrate Dataset — 20 audited projects, 14 sources). The remaining 5 gaps are either already covered by the architectural analysis sub-agent, out of scope, or inapplicable.

**Resource changes:**
- resource 05 (static analysis patterns): +Check 17 (Storage Deposit Enforcement), +Check 18 (External Data Freshness Validation)

**Activity changes:**
- sub-architectural-analysis (1.0.0 → 1.1.0): build-privilege-map step extended to enumerate runtime configuration constants affecting security boundaries

**Integration rationale:**
- Check 17 addresses the second most common Substrate audit finding category (SRLabs #5: missing storage deposits). Mechanical, executed by Group B, zero impact on other agents.
- Check 18 addresses a cross-project pattern (Trail of Bits / Parallel: oracle timestamp silently discarded). Mechanical, executed by Group B.
- Runtime config surface review (SRLabs #2) folded into the existing privilege map step — no new step, no new rule.
- Gaps 2 (transactional), 3 (RPC security), 5 (P2P), 6 (chain extensions), 8 (admin immutability) deferred: covered by architectural analysis, out of scope, or inapplicable.

---

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
