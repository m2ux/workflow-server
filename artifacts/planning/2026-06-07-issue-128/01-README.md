# Canonical Naming Convention for Technique Inputs/Outputs and Rules - June 2026

**Created:** 2026-06-07  
**Status:** In Progress  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Establish a canonical naming convention for the *identifiers themselves* of technique inputs, outputs, and rules — a consistent grammatical structure for what they are named, layered on top of the already-landed case and reference-syntax conventions. This makes technique definitions predictable to author and audit (booleans read as affirmative predicates, collections are plural, rules are positive assertions), and supplies an audit heuristic plus a corpus migration so existing identifiers conform.

---

## Problem Overview

The workflow system is described in many small definition files, and each one declares named pieces of information — the data a step takes in, the data it produces, and the rules it must follow. A recent round of cleanup made sure all of these names are written *consistently in style*: the right capitalisation, the right punctuation, and code-like words wrapped in backticks. But that work deliberately stopped short of agreeing on how the names should actually be *structured* — for example, whether a yes/no value should be called `squash_merge_available` or `is_squash_merge_available`, or whether a list of items should be singular or plural. As a result, the names are tidy on the surface but still inconsistent underneath, and two authors writing similar definitions can still arrive at quite different names.

When the underlying naming structure is left to individual judgement, the definitions become harder to read, harder to write correctly the first time, and harder to check automatically. Someone reviewing a definition cannot rely on a name's shape to tell them whether it is a yes/no flag, a single value, or a collection, so they have to read the surrounding description every time. Over a large and growing body of definitions, these small inconsistencies accumulate into real friction — slower authoring, more review back-and-forth, and no automated way to catch names that drift from the intended pattern. This work package settles the missing convention, writes it down, and brings the existing definitions into line.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete (DP + Research reconciled; DP-7 resolved → research-only) |
| 04 | [KB & web research](04-kb-research.md) | Naming-convention research synthesis (context scope: web-retrieval) | 20-45m | ✅ Complete |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated code quality review | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| 14 | [Comprehension artifact](../../comprehension/identifier-naming-convention.md) | Persistent codebase knowledge — identifier naming/binding model | 20-45m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Completion summary` | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#128](https://github.com/m2ux/workflow-server/issues/128) |
| PR | [#129](https://github.com/m2ux/workflow-server/pull/129) |

---

**Status:** In Progress
