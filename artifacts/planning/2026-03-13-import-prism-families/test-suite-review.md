# Test Suite Review

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families
> **Test Plan**: `06-test-plan.md`

## Context

This work package modifies TOON workflow definition files and markdown resources — not application code. There is no automated test framework for TOON files. The test plan defines 6 categories of manual verification via MCP tool calls.

## Test Plan Assessment

| Category | Coverage | Adequacy |
|----------|----------|----------|
| T1: Resource loading | All 30 indices | Adequate — verifies the foundation |
| T2: Skill definition validation | 4 skills via get_skill | Adequate — confirms TOON parsing |
| T3: Activity definition validation | 6 activities via get_workflow_activity | Adequate — confirms structure |
| T4: Workflow definition validation | 1 workflow via get_workflow | Adequate |
| T5: Backward compatibility | 4 checks on original modes | Adequate — regression coverage |
| T6: End-to-end behavioral pipeline | Full pipeline execution | Adequate — integration test |

## Gaps Identified

### Gap 1: No routing verification test

The test plan verifies that skills and activities *load* correctly but does not verify that plan-analysis *routes* correctly. For example:
- Does `analytical-goal: "error handling"` produce a plan with `pipeline_mode: single` and `lenses: [19]`?
- Does `analytical-goal: "comprehensive behavioral"` produce `pipeline_mode: behavioral`?
- Does `depth-preference: "behavioral"` on a general target get rejected?

**Recommendation**: Add a T7 category for routing verification — invoke plan-analysis with specific goals and verify the output plan's pipeline_mode and lens selections.

### Gap 2: No domain-neutral variant routing test

The test plan does not verify that general targets receive neutral variants (24-26) instead of code-specific behavioral lenses (19-22).

**Recommendation**: Add a T8 category for variant routing — invoke plan-analysis with `target_type: "general"` and a behavioral goal, verify neutral variants are selected.

### Gap 3: No 73w model constraint verification

The test plan does not verify that 73w (18) recommendations include the Sonnet-only advisory note.

**Recommendation**: Low priority — this is advisory documentation in skill text, not a runtime constraint.

## Overall Assessment

The test plan covers structural correctness (files load, parse, contain expected content) and backward compatibility (existing modes work). It has adequate integration coverage (T6 end-to-end behavioral pipeline).

The primary gap is routing logic verification (T7, T8) — verifying that the goal-mapping matrix produces correct lens selections for new analytical goals. This is testable via MCP tool calls but not currently in the plan.

**Verdict**: Adequate for the scope of this work package. Routing verification can be performed during the first real usage of the new modes.
