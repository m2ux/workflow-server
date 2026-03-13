# Test Plan

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families

## Testing Context

This work package modifies workflow definition files (TOON and markdown) — not application code. There is no automated test framework for TOON files. Testing is performed via manual verification using MCP tool calls and structural inspection.

---

## T1: Resource Loading Verification

**Scope**: All 33 resources (00-32) load correctly via `get_resource`
**After**: CB-1

| Test | Command | Expected |
|------|---------|----------|
| T1.1 | `get_resource({ workflow_id: "prism", index: "12" })` | Returns deep_scan lens prompt content |
| T1.2 | `get_resource({ workflow_id: "prism", index: "18" })` | Returns 73w lens prompt content |
| T1.3 | `get_resource({ workflow_id: "prism", index: "23" })` | Returns behavioral_synthesis prompt |
| T1.4 | `get_resource({ workflow_id: "prism", index: "32" })` | Returns state_audit prompt |
| T1.5 | Spot-check 5 random indices from 12-32 | Content matches upstream source |
| T1.6 | Verify existing resources unchanged | `get_resource` for indices 00-11 returns same content as before |

**Pass criteria**: All 33 indices return valid content. Existing 00-11 unchanged.

---

## T2: Skill Definition Validation

**Scope**: Updated skills parse correctly and contain expected entries
**After**: CB-3, CB-4

| Test | Method | Expected |
|------|--------|----------|
| T2.1 | `get_skill({ skill_id: "plan-analysis", workflow_id: "prism" })` | Returns skill with expanded goal-mapping matrix containing SDL, behavioral, and hybrid entries |
| T2.2 | Verify plan-analysis resources list | Contains indices "00" through "32" |
| T2.3 | `get_skill({ skill_id: "portfolio-analysis", workflow_id: "prism" })` | Returns skill with expanded lens catalog including SDL and behavioral lenses |
| T2.4 | `get_skill({ skill_id: "behavioral-pipeline", workflow_id: "prism" })` | Returns new skill with label mapping and resources 19-23 |
| T2.5 | `get_skill({ skill_id: "orchestrate-prism", workflow_id: "prism" })` | Returns skill with behavioral dispatch protocols |
| T2.6 | Verify plan-analysis goal-mapping includes "error handling" → 19 | Entry exists in goal-mapping-matrix rule |
| T2.7 | Verify plan-analysis code-vs-general includes sdl-abstraction (15) in general set | Rule text includes "15" in general lens set |

**Pass criteria**: All skills load without error. New entries present.

---

## T3: Activity Definition Validation

**Scope**: Updated and new activities parse correctly
**After**: CB-5

| Test | Method | Expected |
|------|--------|----------|
| T3.1 | `get_workflow_activity({ workflow_id: "prism", activity_id: "select-mode" })` | Returns activity with behavioral option in confirm-mode checkpoint |
| T3.2 | `get_workflow_activity({ workflow_id: "prism", activity_id: "structural-pass" })` | Returns activity with behavioral conditional steps and transition to behavioral-synthesis-pass |
| T3.3 | `get_workflow_activity({ workflow_id: "prism", activity_id: "behavioral-synthesis-pass" })` | Returns new activity with behavioral synthesis loop |
| T3.4 | `get_workflow_activity({ workflow_id: "prism", activity_id: "deliver-result" })` | Returns activity with behavioral mode handling |
| T3.5 | Verify adversarial-pass unchanged | Activity still filters on `pipeline_mode == "full-prism"` only |
| T3.6 | Verify synthesis-pass unchanged | Activity still filters on `pipeline_mode == "full-prism"` only |

**Pass criteria**: All activities load. Behavioral mode recognized. Existing activities unmodified.

---

## T4: Workflow Definition Validation

**Scope**: workflow.toon parses with updated pipeline_mode
**After**: CB-2

| Test | Method | Expected |
|------|--------|----------|
| T4.1 | `get_workflow({ workflow_id: "prism" })` | Returns workflow with pipeline_mode description including "behavioral" |
| T4.2 | Verify initialActivity unchanged | Still "select-mode" |
| T4.3 | Verify all 12 rules still present | Rules array unchanged |

**Pass criteria**: Workflow loads. Behavioral mentioned in pipeline_mode. All rules intact.

---

## T5: Backward Compatibility

**Scope**: Existing single, full-prism, and portfolio modes work unchanged
**After**: All CBs

| Test | Method | Expected |
|------|--------|----------|
| T5.1 | Verify plan-analysis still maps "bug detection" → L12 (00) | Goal-mapping matrix preserves all 12 original entries |
| T5.2 | Verify portfolio-analysis still maps pedagogy → 06 | Original 6 portfolio lenses still present |
| T5.3 | Verify structural-pass single/full-prism conditional steps unchanged | Steps for `pipeline_mode != "portfolio"` still reference L12 lens |
| T5.4 | Verify adversarial-pass and synthesis-pass fully unchanged | File content identical to pre-change |

**Pass criteria**: All original functionality preserved.

---

## T6: End-to-End Behavioral Pipeline (Manual)

**Scope**: Behavioral pipeline executes correctly when invoked
**After**: All CBs

| Test | Method | Expected |
|------|--------|----------|
| T6.1 | Invoke prism workflow with `pipeline_mode: "behavioral"` on a code file | select-mode recognizes behavioral, structural-pass dispatches 4 lenses, behavioral-synthesis-pass runs synthesis, deliver-result presents findings |
| T6.2 | Verify 5 artifacts produced | `behavioral-errors.md`, `behavioral-costs.md`, `behavioral-changes.md`, `behavioral-promises.md`, `behavioral-synthesis.md` |
| T6.3 | Verify synthesis references all 4 inputs | Synthesis output mentions ERRORS, COSTS, CHANGES, PROMISES |

**Pass criteria**: Full pipeline completes. All 5 artifacts written. Synthesis integrates all 4 inputs.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| TOON syntax error in new/modified files | Verify each file loads via MCP tools after each CB |
| Resource index collision | Verify all 33 indices are unique and loadable |
| Broken backward compatibility | T5 tests run after every CB |
| Behavioral synthesis label mismatch | T6.3 verifies synthesis references all 4 expected labels |
