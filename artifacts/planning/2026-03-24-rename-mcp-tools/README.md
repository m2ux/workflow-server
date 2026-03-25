# Rename MCP Tools - March 2026

**Created:** 2026-03-24  
**Status:** Complete  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Rename and reshape the workflow-server MCP entry flow to eliminate naming ambiguity and enable session-aware interactions. Agents call **`help`** and **`list_workflows`** to bootstrap, then **`start_session`** (replacing `get_rules`) to obtain behavioral rules, workflow metadata, and an opaque **HMAC-signed session token** for correlated subsequent calls. The old `get_activities` / goal-index tool path was removed in favor of explicit workflow selection from the list.

---

## Problem Overview

The workflow server provides tools that AI agents call to discover and execute structured workflows. Two of these tools have names that cause confusion. The first, `get_activities`, is meant to help agents find the right workflow for a given task, but it uses the word "activities" — the same term used for phases within a workflow. This double meaning forces agents to guess which sense of "activity" applies in any given context, leading to errors during workflow discovery.

The second tool, `get_rules`, gives agents their behavioral guidelines but offers no way to establish an ongoing session. Without a session identifier, the server treats every call as independent and cannot track the sequence of actions an agent takes during a single working session. This limits the server's ability to provide context-aware responses and makes it harder to correlate related operations for debugging or auditing.

---

## Solution Overview

The shipped design replaces the confusing entry points with a clear bootstrap: **`help`** documents the protocol; **`list_workflows`** lists definitions; **`start_session`** replaces `get_rules` and returns rules, workflow metadata, and a signed session token. Session tokens are validated on each call (workflow consistency, transitions, skills, version drift, manifests—**warnings only**), advanced in `_meta`, and **encrypted at rest** when persisted via `save_state`.

Once an agent has its session token from `start_session`, it must include that token in every subsequent tool call. The server validates the token's format before processing each request, and the token automatically appears in audit logs so that all operations within a session can be traced together. The token is stored in the workflow state file alongside other session data, so it persists across session interruptions. This is a clean break — the old tool names are removed immediately, and all references across source code, documentation, and workflow definitions are updated atomically.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 02 | [Requirements elicitation](02-requirements-elicitation.md) | Captured requirements, scope, success criteria | 15-30m | ✅ Complete |
| 03 | [Implementation analysis](03-implementation-analysis.md) | Current state, baselines, gaps, strategy notes | 10-20m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 1-4h | ✅ Complete |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ✅ Complete |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ✅ Complete |
| 06 | [Architecture summary](06-architecture-summary.md) | New module overview (session, crypto, validation) | 5-10m | ✅ Complete |
| 06 | [Structural findings](06-structural-findings.md) | Single-pass structural analysis | 10-15m | ✅ Complete |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ✅ Complete |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ✅ Complete |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |
| 09 | [Step completion manifest](09-step-completion-manifest.md) | Design for step manifest validation | — | ✅ Complete |
| 10 | [Work package plan](10-work-package-plan.md) | HMAC signing + manifest implementation plan | 30-45m | ✅ Complete |
| 10 | [Test plan](10-test-plan.md) | Test cases for HMAC + manifest features | 15-30m | ✅ Complete |
| 11 | [Work package plan](11-work-package-plan.md) | Server-side transition evaluation implementation plan | 20-40m | ✅ Complete |
| 11 | [Test plan](11-test-plan.md) | Test cases for transition evaluation + summary mode | 15-30m | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#59](https://github.com/m2ux/workflow-server/issues/59) |
| PR | [#60](https://github.com/m2ux/workflow-server/pull/60) |
| Engineering | [Planning folder](https://github.com/m2ux/workflow-server/blob/main/.engineering/artifacts/planning/2026-03-24-rename-mcp-tools/README.md) |

---

**Last updated:** 2026-03-25 — Issue [#59](https://github.com/m2ux/workflow-server/issues/59) closed; PR [#60](https://github.com/m2ux/workflow-server/pull/60) merged. Completion summary: [08-COMPLETE.md](08-COMPLETE.md).

**Status:** Work package complete. Follow-up plans in this folder (e.g. transition evaluation, optional cleanups) remain **future** work unless filed as new issues.
