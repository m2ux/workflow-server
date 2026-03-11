# Headless Slack Workflow Runner - March 2026

**Created:** 2026-03-05
**Status:** Submitted for Review
**Type:** Feature

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Harden the headless Slack workflow runner for merge readiness by adding SQLite state persistence, structured logging with file rotation, and graceful crash recovery. This transforms the existing PoC — which already handles ACP protocol, checkpoint bridging, and worktree isolation — into an operationally reliable tool for headless workflow execution via Slack.

---

## Problem Overview

The headless Slack workflow runner currently keeps all session state in an in-memory JavaScript Map, meaning any runner restart — whether intentional or due to a crash — loses all active workflow context with no way to recover. Logging goes to the console with no file output, so post-mortem debugging requires someone to have been watching the terminal. When the runner shuts down, it stops the Slack connection but leaves agent processes running and git worktrees on disk, and if the runner itself crashes, those orphaned worktrees accumulate indefinitely.

These gaps are acceptable for a proof-of-concept but prevent the runner from being used for real workflow execution. A developer who restarts the runner mid-workflow loses all context. A crash that happens overnight leaves no diagnostic trail. And accumulated orphaned worktrees waste disk space and can cause git confusion. Before the runner can be merged, it needs to persist state, write structured logs to files, and clean up after itself on both graceful and ungraceful shutdown.

---

## Solution Overview

The fix adds three operational capabilities to the existing runner architecture. First, a SQLite database (using Node.js's built-in `node:sqlite` module, requiring no additional dependencies) stores session state — workflow ID, Slack thread coordinates, status, and timestamps — so that session records survive runner restarts. Second, all console output is replaced with the pino structured JSON logger, which writes machine-readable log entries to daily-rotating files with automatic retention management. Third, the runner now cleans up after itself: on graceful shutdown it terminates all active agent processes and removes their worktrees, and on startup it sweeps any orphaned worktrees left behind by a previous crash.

These changes are layered onto the existing architecture without restructuring it. The SessionManager gains a persistence adapter that saves state at each lifecycle transition, a logger that replaces console calls with structured output, and a shutdown method that iterates active sessions. The WorktreeManager gains a sweep method that identifies stale worktrees by their distinctive prefix. Each change is independently committable and testable, and the final validation — running one complete workflow end-to-end via Slack — serves as the merge gate.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | Design philosophy | Problem classification, design rationale | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | ongoing | ✅ Complete |
| 03 | [Requirements elicitation](03-requirements-elicitation.md) | Stakeholder requirements, scope, success criteria | 20-30m | ✅ Complete |
| 04 | [Research](04-research.md) | SQLite, pino, ACP protocol, crash handling | 30-45m | ✅ Complete |
| 05 | [Implementation analysis](05-implementation-analysis.md) | Gap analysis, baselines, success criteria | 20-30m | ✅ Complete |
| 06 | [Implementation plan](06-implementation-plan.md) | Task breakdown, dependencies, ordering | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan (7 tasks) | 5-7h | ✅ Complete |
| — | Change block index | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| — | Code review | Automated code quality review | 10-20m | ✅ Complete |
| — | Test suite review | Test quality and coverage assessment | 10-20m | ✅ Complete |
| — | Strategic review | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ✅ Complete |
| — | Live validation | End-to-end Slack + Cursor ACP run | 30-60m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ◐ In Progress |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#48](https://github.com/m2ux/workflow-server/issues/48) |
| PR | [#49](https://github.com/m2ux/workflow-server/pull/49) |

---

**Status:** Submitted for Review
