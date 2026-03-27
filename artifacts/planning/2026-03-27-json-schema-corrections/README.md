# JSON Schema Corrections - March 2026

**Created:** 2026-03-27  
**Status:** Complete  
**Type:** Bug-Fix

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Correct 15 structural defects across 5 JSON Schema files where the workflow schema rejects its own documented examples, condition-based validation is defeated by missing or misplaced constraints, and `additionalProperties` policy is applied inconsistently. These fixes ensure that valid workflow documents pass validation and that invalid documents are reliably caught.

---

## Problem Overview

The workflow-server's JSON Schema definitions contain structural errors that undermine the validation layer they are meant to provide. Schemas reject payloads that match their own documented examples because of overly restrictive `required` arrays, misplaced `enum` constraints, and `if`/`then` conditions that never activate due to the absence of the discriminant property from the enclosing `properties` block. The result is a validation surface that is both too strict (blocking correct inputs) and too lenient (allowing malformed inputs to slip through unchallenged).

The consequences are felt in two directions. Downstream consumers — agents and tooling that author workflow files — cannot trust the schema as a source of truth, because conforming to the documented structure still produces validation errors. Meanwhile, the condition-validation gaps mean structurally invalid documents (e.g., a step with `type: "checkpoint"` but missing the required `checkpoint` object) are accepted silently, pushing defect detection to runtime where failures are harder to diagnose. Inconsistent `additionalProperties` policies across sibling schemas compound the problem by making the rules unpredictable: some schemas forbid extra keys, others allow them, with no clear rationale for the difference.

---

## Solution Overview

Corrected all 15 findings with targeted schema edits across 5 files (+76 −35 lines). Added the missing `activities` property to the workflow schema. Fixed recursive condition validation by replacing `items: {}` with proper `$ref`. Enforced `additionalProperties: false` uniformly (stakeholder decision). Added `$id` to all schemas for explicit `$ref` resolution. Type-constrained variable-value properties. Made `currentActivity` conditionally required via `if`/`then`. Documented intentional type differences in `rules` descriptions.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan (commit `e4fb4b3`) | 1-3h | ✅ Complete |
| 07 | [Change block index](07-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 07 | [Code review](07-code-review.md) | Automated code quality review | 10-20m | ✅ Complete |
| 07 | [Test suite review](07-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ✅ Complete |
| 11 | [Strategic review](11-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| — | Validation | Build, test, lint verification (187/187 pass) | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ✅ Complete |
| 13 | [Completion summary](13-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ✅ Complete |
| 13 | [Workflow retrospective](13-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) — Quality & Consistency Audit Remediation |
| PR | [#69](https://github.com/m2ux/workflow-server/pull/69) — fix: JSON Schema corrections (WP-02) |
| Audit Report | [REPORT.md](https://github.com/m2ux/workflow-server/blob/engineering/.engineering/artifacts/planning/2026-03-27-quality-consistency-audit/REPORT.md) |

---

**Status:** Complete — 15 findings addressed, PR #69 ready for merge
