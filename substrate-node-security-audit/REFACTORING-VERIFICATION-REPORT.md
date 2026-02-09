# Refactoring Verification Report: Activities → Skills Migration

**Date:** 2026-02-09  
**Refactoring Commit:** a0b89b9 (v4.3)  
**Purpose:** Verify that procedural content was not lost during the refactoring from activity step descriptions to skills

## Executive Summary

**Overall Verdict: FAIL** — Several critical procedural details are missing from skills, though most core procedures are preserved.

## Detailed Findings by Activity

### 01-scope-setup → skills/14-setup-audit-target.toon

**Status:** ✅ **PASS** — All procedural content covered

- ✅ Target extraction with error handling: Covered in step 1
- ✅ Commit extraction with HEAD default: Covered in step 2
- ✅ Reference recording without loading: Covered in step 3
- ✅ Checkout verification: Covered in step 4
- ✅ Dependency scanning with fallback: Covered in step 5
- ✅ File inventory generation: Covered in step 6

**Missing Content:** None

---

### 02-reconnaissance → skills/13-map-codebase.toon

**Status:** ✅ **PASS** — All procedural content covered

- ✅ Crate enumeration: Covered in step 1
- ✅ Architecture classification: Covered in step 2
- ✅ Trust boundary identification: Covered in step 3
- ✅ Consensus path mapping: Covered in step 4
- ✅ Hook enumeration: Covered in step 5
- ✅ Data flow tracing: Covered in step 6
- ✅ Send/Sync override detection: Covered in step 7

**Missing Content:** None

---

### 03-primary-audit → skills/04-dispatch-sub-agents.toon

**Status:** ⚠️ **PARTIAL** — Core procedure covered, but specific examples lost

**Covered:**
- ✅ Bootstrap instructions ("call get_rules() then call get_workflow_activity..."): Covered in step 1
- ✅ Cross-crate supplementary file inclusion: Covered in step 1
- ✅ Wave partitioning: Covered in step 2

**Missing Content:**
- ⚠️ **Low Risk:** Specific crate examples (NTO pallet with supplements, midnight pallet + ledger with api/*.rs) are not in the skill, but these are examples rather than procedure. The skill correctly covers the general procedure.

**Recommendation:** Acceptable — examples belong in activity notes, not skill protocol.

---

### 03-primary-audit → skills/05-verify-sub-agent-output.toon

**Status:** ❌ **FAIL** — Critical threshold and specific verification rules missing

**Covered:**
- ✅ File coverage checking: Covered in step 1
- ✅ Mandatory table validation: Covered in step 2
- ✅ Structural completeness: Covered in step 3

**Missing Content:**
1. ❌ **CRITICAL:** Coverage gate file-size threshold ">200 lines" — The skill mentions "size threshold" but doesn't specify the number. The old activity explicitly stated "every .rs file >200 lines in priority-1/2 crates".
2. ❌ **HIGH:** §3.3 per-field event trace table requirement — The old activity specified: "For pallet agents: check per-field event trace table exists for §3.3 if the pallet has deposit_event() with partial-success paths — a PASS on §3.3 without this table is INVALID." The skill doesn't capture this specific validation rule.
3. ❌ **HIGH:** StorageInit trace online/offline path requirement — The old activity specified: "Check that the node agent (A3) explicitly enumerated every StorageInit construction site, covering BOTH online paths (run_node/new_full) and offline subcommand paths (check-block, export-state, revert, import-blocks, benchmark)." The skill doesn't specify this dual-path requirement.

**Recommendation:** Add explicit threshold and specific validation rules to skill protocol.

---

### 04-adversarial-verification → skills/11-decompose-safety-claims.toon

**Status:** ⚠️ **PARTIAL** — Core procedure covered, but filter criteria missing

**Covered:**
- ✅ Claim decomposition: Covered in step 1
- ✅ Field enumeration: Covered in step 2
- ✅ Independent verification: Covered in step 3
- ✅ Verdict compilation: Covered in output

**Missing Content:**
- ❌ **MEDIUM:** PASS extraction filter criteria — The old activity specified: "Filter to items with severity >= Medium potential (§3.1-§3.4, §3.6, §3.8, §3.10, §3.14)." The skill doesn't specify which PASS items to extract — it assumes all PASS items are provided as input.

**Recommendation:** Add filter criteria to the skill's first step or document that filtering happens before skill invocation.

---

### 05-report-generation → skills/01-score-severity.toon

**Status:** ❌ **FAIL** — Specific threshold rules missing from protocol

**Covered:**
- ✅ Impact x Feasibility rubric: Covered in scoring_rubric
- ✅ Calibration examples: Covered in calibration_examples
- ✅ Bias correction patterns: Covered in bias_correction

**Missing Content:**
- ❌ **CRITICAL:** Severity crosscheck threshold rules — The old activity specified explicit rules: "(1) Connection pool / infrastructure findings affecting consensus paths through routinely-accessible systems: F >= 3. (2) Panics triggered only by operator-provided invalid configuration: F = 2. (3) Conditions occurring under normal operation (pruning, routine block production): F = 4." These rules are not in the skill's protocol flow — they're only implied by calibration examples.

**Recommendation:** Add explicit threshold rules to the skill's `flow` section or create a dedicated `crosscheck` protocol step.

---

### 10-sub-crate-review → skills/07-apply-checklist.toon

**Status:** ⚠️ **PARTIAL** — General table production covered, but specific table types not enumerated

**Covered:**
- ✅ Checklist evaluation: Covered in steps 1-2
- ✅ Table production requirement: Covered in step 3 ("produce-tables")
- ✅ Completeness verification: Covered in step 4

**Missing Content:**
- ❌ **HIGH:** Specific mandatory table enumeration — The old activity specified exactly 4 tables: "(1) Per-field event trace table (§3.3): For every event constructor involving partial success, trace each collection field to its population source and determine whether it filters by outcome. (2) Struct diff table (§3.3): For every pallet that emits events with associated storage types, compare event fields vs storage fields. (3) Cross-layer verification matrix (§3.2, §3.10): For pagination and timestamp checks, produce the three-layer table (data source / IDP / pallet). (4) Two-level input validation table (§3.6): For each external input type, verify both structural (Level 1) and semantic (Level 2) validation." The skill mentions these as examples but doesn't enumerate them as required outputs.

**Recommendation:** Either enumerate the specific tables in the skill protocol, or document that the checklist resource defines which tables are required (if that's the intended design).

---

## Specific Content Verification

### 1. §3.3 per-field event trace table requirement

**Status:** ❌ **MISSING from skill protocol**

- **Location:** Was in `10-sub-crate-review > produce-required-tables`
- **Current Status:** Mentioned in `skills/07-apply-checklist.toon` step 3 as an example, but not as a mandatory requirement
- **Gap:** The skill doesn't specify that pallets with `deposit_event()` and partial-success paths MUST produce this table, or that a PASS without the table is INVALID

**Verdict:** ❌ **NOT FOUND** — Content exists but not as a mandatory protocol requirement

---

### 2. §3.5 StorageInit construction site enumeration

**Status:** ❌ **PARTIALLY MISSING**

- **Location:** Was in `03-primary-audit > verify-storageinit-trace`
- **Current Status:** Mentioned in activity notes and workflow.toon, but not in `skills/05-verify-sub-agent-output.toon` protocol
- **Gap:** The skill doesn't specify the requirement to check both online (run_node/new_full) and offline (check-block, export-state, revert, import-blocks) subcommand paths

**Verdict:** ❌ **NOT FOUND** — Specific dual-path requirement missing from skill protocol

---

### 3. Severity crosscheck threshold rules: "Connection pool F>=3, Panics F=2, Normal operation F=4"

**Status:** ❌ **MISSING from protocol**

- **Location:** Was in `05-report-generation > severity-crosscheck`
- **Current Status:** Implied by calibration examples in `skills/01-score-severity.toon`, but not stated as explicit protocol rules
- **Gap:** The skill's `flow` section doesn't include these threshold rules — they must be inferred from examples

**Verdict:** ❌ **NOT FOUND** — Rules exist only as examples, not as explicit protocol steps

---

### 4. Sub-agent bootstrap instruction template: "call get_rules() then call get_workflow_activity..."

**Status:** ✅ **FOUND**

- **Location:** Was in `03-primary-audit > dispatch-wave-1/2`
- **Current Status:** Explicitly stated in `skills/04-dispatch-sub-agents.toon` step 1: "workflow-server bootstrap instructions — 'call get_rules() then call get_workflow_activity with the assigned activity_id, follow the activity steps sequentially'"
- **Also Found:** In `skills/00-execute-audit.toon` bootstrap_instruction field

**Verdict:** ✅ **FOUND** — Content preserved

---

### 5. Coverage gate file-size threshold ">200 lines"

**Status:** ❌ **MISSING from skill protocol**

- **Location:** Was in `03-primary-audit > verify-coverage-gate`
- **Current Status:** Mentioned in activity notes, workflow.toon, and README, but `skills/05-verify-sub-agent-output.toon` step 1 only says "size threshold" without specifying the number
- **Gap:** The skill protocol doesn't specify ">200 lines" — it must be inferred from activity context

**Verdict:** ❌ **NOT FOUND** — Threshold number missing from skill protocol

---

## Summary of Missing Content

### Critical Gaps (Must Fix)

1. **Coverage gate threshold ">200 lines"** — Missing from `skills/05-verify-sub-agent-output.toon` step 1
2. **Severity crosscheck threshold rules** — Missing from `skills/01-score-severity.toon` protocol flow

### High-Priority Gaps (Should Fix)

3. **§3.3 per-field trace table validation rule** — Missing from `skills/05-verify-sub-agent-output.toon` step 2
4. **StorageInit trace online/offline path requirement** — Missing from `skills/05-verify-sub-agent-output.toon` step 2
5. **Specific mandatory table enumeration** — Missing from `skills/07-apply-checklist.toon` step 3

### Medium-Priority Gaps (Consider Fixing)

6. **PASS extraction filter criteria** — Missing from `skills/11-decompose-safety-claims.toon` step 1

---

## Recommendations

1. **Add explicit threshold to coverage gate skill:** Update `skills/05-verify-sub-agent-output.toon` step 1 to specify ">200 lines" threshold
2. **Add threshold rules to severity skill:** Add explicit crosscheck protocol step to `skills/01-score-severity.toon` with the three threshold rules
3. **Add specific validation rules:** Update `skills/05-verify-sub-agent-output.toon` step 2 to include §3.3 and §3.5 specific checks
4. **Enumerate mandatory tables:** Either add specific table enumeration to `skills/07-apply-checklist.toon` step 3, or document that the checklist resource defines required tables
5. **Add filter criteria:** Document PASS extraction filter in `skills/11-decompose-safety-claims.toon` or in the activity that invokes it

---

## Overall Verdict

**FAIL** — The refactoring successfully moved most procedural content to skills, but several critical details were lost:

- 2 critical gaps (coverage threshold, severity thresholds)
- 3 high-priority gaps (specific validation rules, table enumeration)
- 1 medium-priority gap (filter criteria)

The gaps are primarily in verification and crosscheck steps where specific thresholds and validation rules were procedural but are now only implied by examples or activity notes. These should be restored to the skill protocols to maintain workflow fidelity.
