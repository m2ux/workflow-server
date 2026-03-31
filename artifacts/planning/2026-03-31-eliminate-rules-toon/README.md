# Eliminate Standalone rules.toon — March 2026

**Created:** 2026-03-31  
**Status:** In Progress  
**Type:** Refactor

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Migrate all behavioral guidance from the standalone `meta/rules.toon` file into two new meta skills (`session-protocol` and `agent-conduct`), then remove the rules file, its loader, and the rules payload from `start_session`. This eliminates the only instance of a parallel rules-loading mechanism, aligning all behavioral content delivery with the standard skill system.

---

## Problem Overview

The workflow server delivers behavioral guidance to AI agents through a structured skill system — agents call `get_skills` and receive the protocols they need for each activity. However, one set of guidance lives outside this system: a standalone rules file that gets bundled into the session startup response. This means the server maintains two separate delivery mechanisms for the same type of content — one through skills (used by every workflow) and one through a dedicated rules loader (used only by the meta workflow). This creates extra code to maintain, an inconsistent API surface, and confusion about where behavioral guidance should live.

The practical consequences are threefold. First, the `start_session` response is heavier than necessary because it carries the full rules payload alongside the token and metadata. Second, the rules file mixes orchestration concerns (how to handle tokens and step manifests) with IDE-specific concerns (how to manage tasks and recover from errors) that don't belong in the workflow server at all. Third, any developer extending the system must understand two loading paths instead of one, increasing the learning curve and the risk of guidance being missed or duplicated.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ⬚ Pending |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ⬚ Pending |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#90](https://github.com/m2ux/workflow-server/issues/90) |
| PR | [#91](https://github.com/m2ux/workflow-server/pull/91) |

---

**Status:** Ready for design philosophy
