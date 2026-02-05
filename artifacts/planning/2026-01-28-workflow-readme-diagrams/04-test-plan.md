# Test Plan: Workflow README Diagrams

**Issue:** #29  
**PR:** #30  
**Date:** 2026-01-28

---

## Test Strategy

Since this is documentation-only (no code changes), testing focuses on:
1. Mermaid rendering correctness
2. Content accuracy against schema
3. Visual clarity and readability

---

## Test Cases

### TC-1: Mermaid Syntax Validation

**Objective:** Verify all diagrams have valid Mermaid syntax

**Steps:**
1. For each README.md created:
   - Open file in GitHub web interface
   - Verify each Mermaid code block renders without error
   - Check no "Unable to render" messages appear

**Expected Result:** All diagrams render successfully

---

### TC-2: Activity Coverage

**Objective:** Verify all activities are represented in diagrams

**Test Data:**

| Workflow | Expected Activities |
|----------|---------------------|
| meta | start-workflow, resume-workflow, end-workflow |
| work-package | issue-verification, requirements-elicitation, implementation-analysis, research, plan-prepare, implement, validate, strategic-review, finalize, update-pr, post-implementation |
| work-packages | scope-assessment, folder-setup, analysis, package-planning, prioritization, finalize-roadmap, implementation |

**Steps:**
1. For each workflow README:
   - Count activities in main flow diagram
   - Verify matches expected count
   - Verify all activity names present

**Expected Result:** All activities represented

---

### TC-3: Transition Accuracy

**Objective:** Verify transitions match activity definitions

**Steps:**
1. For work-package workflow:
   - Check issue-verification has 2 transitions (to requirements-elicitation, implementation-analysis)
   - Check validate has 3 branches (strategic-review, implement, plan-prepare)
   - Check feedback loops are represented

**Expected Result:** All transitions accurately reflected

---

### TC-4: Checkpoint Representation

**Objective:** Verify checkpoints shown as decision diamonds

**Steps:**
1. Count total checkpoints per workflow:
   - meta: 0
   - work-package: 17
   - work-packages: 6
2. Verify diamond shapes used in activity detail diagrams

**Expected Result:** Checkpoints visually distinguished

---

### TC-5: Skill References

**Objective:** Verify skills are referenced in diagrams or tables

**Test Data:**

| Workflow | Skills |
|----------|--------|
| meta | activity-resolution, workflow-execution, state-management, artifact-management |
| work-package | code-review, test-review, pr-review-response |
| work-packages | (uses meta skills) |

**Steps:**
1. Check skills summary table exists
2. Verify all skills listed

**Expected Result:** All skills documented

---

### TC-6: Connection Count

**Objective:** Verify diagrams stay under complexity limit

**Steps:**
1. For each main flow diagram:
   - Count edges (arrows)
   - Verify under 50 (well under 100 limit)

**Expected Result:** No diagram exceeds 50 connections

---

## Validation Checklist

| # | Check | Pass |
|---|-------|------|
| 1 | All diagrams render on GitHub | [ ] |
| 2 | All activities present in main flows | [ ] |
| 3 | Transitions match schema definitions | [ ] |
| 4 | Checkpoints shown as diamonds | [ ] |
| 5 | Skills documented | [ ] |
| 6 | Diagrams under 50 connections | [ ] |
| 7 | Consistent node shapes | [ ] |
| 8 | README structure matches template | [ ] |
