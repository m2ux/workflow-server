# Loader Error Handling and Validation - March 2026

**Created:** 2026-03-27  
**Status:** In Progress  
**Type:** Bug-Fix

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Remediate 12 findings (4 High, 8 Medium severity) across 6 loader files identified during the quality and consistency audit. These findings involve silent error swallowing, incorrect error type mapping, performance-inefficient full-loads, and inconsistent error policies that undermine reliability and debuggability of the workflow-server's content loading layer.

---

## Problem Overview

The loader subsystem (`src/loaders/`) is the critical path for all workflow, activity, skill, and resource content. The quality audit revealed that errors during content loading are frequently swallowed, misclassified, or logged at inappropriate severity levels. Corrupt TOON files return `null` silently, validation failures fall through to raw unvalidated objects, and catch-all blocks convert all errors into misleading `ActivityNotFoundError` responses.

These issues have two consequences: first, debugging content problems in production becomes difficult because errors are either invisible or misattributed; second, invalid content can propagate through the system when validation failures are silently ignored rather than rejected, potentially causing downstream tool calls to behave unpredictably.

---

## Solution Overview

Each finding receives a targeted fix within its source file, following three principles: (1) errors must be logged at appropriate severity rather than swallowed silently, (2) validation failures must result in rejection or clear warning rather than silent fallback to unvalidated data, and (3) error types must accurately represent the failure condition. No API or interface changes are required.

The `listWorkflows` performance issue is resolved by decoding only the `workflow.toon` manifest fields instead of full-loading all activities. All other changes are localized to catch blocks, validation branches, and type guards. Existing tests provide regression coverage since they exercise the same loader functions with real workflow data.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan (5 files, 12 findings) | 1-2h | ✅ Complete |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) — Quality & Consistency Audit Remediation |
| PR | [#72](https://github.com/m2ux/workflow-server/pull/72) — fix: loader error handling and validation (WP-05) |

---

**Status:** In Progress
