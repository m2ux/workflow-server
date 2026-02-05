# Ecological Navigation API - January 2026

**Created:** 2026-01-29
**Status:** Implementation Complete
**Type:** Enhancement
**Issue:** [#36](https://github.com/m2ux/workflow-server/issues/36)
**Server PR:** [#38](https://github.com/m2ux/workflow-server/pull/38) (server-side changes)
**Registry PR:** [#39](https://github.com/m2ux/workflow-server/pull/39) (effectivities, agents, skills) - MERGED
**Parent Branch:** `feat/34-navigation-workflow-engine`
**Server Branch:** `feat/36-ecological-navigation-api`
**Registry Branch:** `registry` (merged from `feat/36-registry-effectivities`)

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Enhance the navigation API with genuine situated cognition integration, restructuring skills into workflow-agnostic effectivities and implementing a delegated model where primary agents spawn sub-agents based on required capabilities. This moves from "theory validates pattern" to "theory shapes design."

---

## 📊 Progress

| Item | Status | Notes |
|------|--------|-------|
| Issue Management | ✅ Complete | Issue #36, branches created |
| Theoretical Grounding | ✅ Complete | Distributed cognition + activity theory |
| Skill Restructuring | ✅ Complete | 3 engine-subsumed, 3 effectivities identified |
| Registry Design | ✅ Complete | Effectivities + agents registry defined |
| Delegation Protocol | ➡️ Issue #37 | Sub-agent spawning model (future) |
| Navigation API Enhancement | ✅ Complete | Effectivities in actions (PR #38) |
| API Streamlining | ✅ Complete | 4 lifecycle tools (see below) |
| Effectivity Definitions | ✅ Complete | 5 effectivities created (PR #39) |
| Agent Registry | ✅ Complete | default + minimal variants (PR #39) |
| Skills Migration | ✅ Complete | Top-level skills/ folder (PR #39) |
| Tests | ✅ Complete | 228 tests passing |
| Documentation | ✅ Complete | API reference + READMEs |

---

## 🔧 Final Navigation API

The API was streamlined to 4 lifecycle-focused tools:

| Tool | Purpose | Parameters |
|------|---------|------------|
| `start-workflow` | Start workflow | `workflow_id`, `initial_variables?` |
| `resume-workflow` | Resume from saved state | `state` |
| `advance-workflow` | Advance workflow | `state`, `action`, + action-specific params |
| `end-workflow` | End workflow early | `state`, `reason?` |

**Actions for `advance-workflow`:**
- `complete_step` - Mark step done
- `respond_to_checkpoint` - Answer checkpoint
- `transition` - Move to activity
- `advance_loop` - Next loop iteration

**Key additions:**
- `complete?: boolean` in response indicates workflow finished
- `finalActivity` in workflow schema for end-workflow target
- `effectivities?: string[]` in Action for delegation

---

## 🎯 This Work Package

**Features to implement:**

1. **Theoretical Grounding**
   - Paradigm translation: organism-environment → agent-tool-surface
   - Identify what transfers, what needs new concepts
   - Priority: HIGH

2. **Skill Restructuring**
   - Subsume workflow execution into engine
   - Identify domain skills as effectivities
   - Priority: HIGH

3. **Effectivity Registry**
   - Registry format and variants
   - Stored in repo, consumed agent-side
   - Priority: HIGH

4. **Delegated Effectivity Model**
   - Sub-agent spawning based on effectivities
   - Effectivity → sub-agent configuration mapping
   - Priority: MEDIUM

5. **Navigation API Enhancement**
   - Affordance salience (descriptions, enables/requires)
   - Effectivities in response
   - True perceptual restriction
   - Invariants
   - Priority: MEDIUM

---

## 📅 Timeline

| Activity | Tasks | Time Estimate |
|----------|-------|---------------|
| Planning | Theoretical grounding, design | TBD |
| Implementation | Registry, API enhancements | TBD |
| Validation | Testing, documentation | TBD |

**Total:** TBD

---

## 🎯 Success Criteria

- [x] Theoretical foundation is explicit and justified
- [x] Paradigm translation problems acknowledged and addressed
- [x] Workflow execution skills subsumed by engine
- [x] Remaining skills are workflow-agnostic effectivities
- [x] Effectivity registry implemented and documented
- [x] Delegation protocol defined (interim guidance + Issue #37)
- [x] Navigation API returns effectivity requirements
- [x] API streamlined to 4 lifecycle tools
- [x] end-workflow with finalActivity support
- [ ] Sub-agent spawning works based on effectivities (Issue #37)

---

## 📚 Document Navigation

| Document | Description |
|----------|-------------|
| **[START-HERE.md](START-HERE.md)** | 👈 You are here |
| [theoretical-research.md](theoretical-research.md) | Paradigm translation analysis |
| [implementation-analysis.md](implementation-analysis.md) | Skill restructuring analysis |
| [work-package-plan.md](work-package-plan.md) | Implementation plan with 6 phases |
| [test-plan.md](test-plan.md) | Test strategy and cases |
| [Issue #36](https://github.com/m2ux/workflow-server/issues/36) | Full issue with detailed requirements |
| [Issue #37](https://github.com/m2ux/workflow-server/issues/37) | Related: Delegation Protocol (future) |

---

**Status:** Implementation complete - ready for review and merge
