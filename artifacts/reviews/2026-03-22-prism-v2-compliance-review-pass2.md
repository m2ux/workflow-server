# Compliance Review Pass 2: prism v2.0.0

**Date:** 2026-03-22
**Workflow:** prism v2.0.0 (post Phase 2+3 implementation)
**Scope:** Changes since pass 1 — execute-plan activity, generate-report v2.0.0, select-mode transition rewire

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 2 |
| Medium   | 2 |
| Low      | 1 |
| Pass     | 14 principles, 21 anti-patterns |

One critical finding: structural-pass still contains an internal unit loop that conflicts with execute-plan's per-unit dispatch model.

---

## Findings

### F-01 (Critical): structural-pass unit loop conflicts with execute-plan dispatch

**Files:** `01-structural-pass.toon`, `13-execute-plan.toon`
**Issue:** execute-plan iterates over `analysis_units` and dispatches per-unit. But structural-pass ALSO has a `forEach` loop over `analysis_units` (the `unit-cycle` loop). When execute-plan dispatches a worker for a single unit, the worker enters structural-pass which loops over ALL units — re-processing every unit, not just the one dispatched.

For single-unit plans this is harmless (loop runs once either way). For multi-unit plans, each dispatch would redundantly iterate the full unit list.

**Impact:** Multi-dimensional analysis (the core Phase 2 feature) would execute N×N pipeline runs instead of N.

**Fix:** structural-pass must become a single-unit executor. Remove its internal `loops[]` section and convert the loop steps into flat steps that operate on `current_unit` (set by execute-plan before dispatch). The same applies to adversarial-pass (line-by-line unit loop) and synthesis-pass and behavioral-synthesis-pass.

Alternatively: structural-pass can keep its loop for backward compatibility when invoked directly (not via execute-plan), but add a condition that skips the loop when `current_unit` is already set by execute-plan.

### F-02 (High): 10 activities orphaned in transition graph

**Files:** `01-structural-pass.toon` through `12-adaptive-pass.toon`
**Issue:** After rewiring select-mode to transition only to execute-plan, these activities have no incoming transitions:
- structural-pass, adversarial-pass, synthesis-pass, behavioral-synthesis-pass (original 4)
- dispute-pass, subsystem-pass, verified-pass, reflect-pass, smart-pass, adaptive-pass (new 6)

These activities still serve as **worker protocol definitions** — execute-plan dispatches workers that load these activities via `get_workflow_activity` to understand their steps. But they're unreachable in the orchestrator transition graph.

**Impact:** Functionally correct (workers load them directly), but violates design principle 2 (complete scope) in that the transition graph no longer represents the full execution flow. A reviewer reading only transitions would conclude these activities are dead code.

**Recommendation:** Add a comment or rule in execute-plan clarifying that mode-specific activities (01-12) are worker protocol definitions loaded via `get_workflow_activity`, not transition targets. This is an intentional architectural pattern, not orphaned code.

### F-03 (High): generate-report rules count is wrong

**File:** `06-generate-report.toon`, line 85
**Issue:** Declares `rules[6]` but contains 9 rules (6 original + 3 new evaluation rules).
**Fix:** Change `rules[6]` to `rules[9]`.

### F-04 (Medium): select-mode recognition patterns missing new modes

**File:** `00-select-mode.toon`, lines 6-17
**Issue:** Recognition patterns list 11 entries (analyze, structural analysis, full prism, etc.) but don't include the 6 new modes: dispute, subsystem, verified, reflect, smart, adaptive. Also missing: evaluate, evaluation, elicit.
**Recommendation:** Add recognition patterns for the new modes and the elicitation/evaluation entry points.

### F-05 (Medium): READMEs stale again after Phase 2+3

**Files:** `prism/README.md`, `prism/skills/README.md`
**Issue:** The READMEs updated in the previous commit don't reflect:
- execute-plan activity (13) in the activity table
- The rewired transition flow (select-mode → execute-plan → generate-report)
- The mermaid diagram still shows old direct transitions
- generate-report v2.0.0 with dual report format
- Activity count now 14 (was 13)
**Recommendation:** Update once, after all structural changes are stable.

### F-06 (Low): evaluation-plan.md artifact declared unconditionally

**File:** `13-execute-plan.toon`, line 51-55
**Issue:** The `evaluation-plan.md` artifact is declared but only produced for multi-dimensional plans. Single-unit plans skip it. The artifact declaration should note this is conditional.
**Recommendation:** Add a description note: "Produced only for multi-dimensional plans (analysis_units with dimension_names)."

---

## Recommended Fix Priority

| # | Severity | Fix | Files |
|---|---|---|---|
| 1 | Critical | Resolve structural-pass unit loop conflict with execute-plan | 01-structural-pass.toon + 02, 03, 05 |
| 2 | High | Fix generate-report rules count (6 → 9) | 06-generate-report.toon |
| 3 | High | Document orphaned activities pattern in execute-plan | 13-execute-plan.toon |
| 4 | Medium | Add new mode recognition patterns to select-mode | 00-select-mode.toon |
| 5 | Medium | Update READMEs (defer until stable) | README.md, skills/README.md |
| 6 | Low | Note evaluation-plan.md conditionality | 13-execute-plan.toon |
