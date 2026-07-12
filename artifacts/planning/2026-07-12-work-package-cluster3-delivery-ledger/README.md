# Cluster 3 Delivery Ledger - July 2026

> Enhancement · Created 2026-07-12 · **Status:** In Progress

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Implements the cluster 3 "delivery ledger" server-side changes for the workflow-server: a block-level delivery ledger that tracks which technique/rule content blocks a session+agent has already received, plus `get_workflow` payload slimming. Together these cut repeated payload delivery so long-running sessions spend fewer tokens re-receiving unchanged content.

## Problem Overview

When an AI agent works through a long workflow, the server keeps handing it the same instructional content over and over. Earlier work taught the server to notice when it was about to re-send an entire block of instructions unchanged and instead send a tiny "you already have this" marker. That saved a lot, but two gaps remain. First, the biggest instruction payloads are only *partly* the same each time: a shared contract section and a rules section repeat verbatim, but they sit next to a piece that legitimately changes, so the server's whole-payload comparison never matches and it re-sends everything — roughly a quarter of that content is needless repetition. Second, a separate large bundle the server sends to set up each workflow is always sent in full, and it is paid again every time a session resumes.

This work closes both gaps. It teaches the server to compare and skip the repeating sections *individually* — the shared contract and the rules — rather than only the payload as a whole, and it lets the workflow setup bundle be skipped on resume the same way. The result is that agents in long-running sessions receive noticeably less duplicate text, which lowers the token cost and leaves more of the agent's limited working memory for the actual task. The change is opt-in and only affects sessions already using the skip-when-unchanged mode, so ordinary sessions behave exactly as before.

## Solution Overview

*Populated during plan-prepare activity.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | `Design philosophy` | Problem classification, design rationale, workflow path | 15-30m | ⬚ Pending |
| 01 | `Assumptions log` | Tracked assumptions across all activities | 10-15m | ⬚ Pending |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | `Comprehension artifact` | Persistent codebase knowledge | 20-45m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, deferred items, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Parent Epic | [#189](https://github.com/m2ux/workflow-server/issues/189) — Epic: schema/technique/disclosure review repeat-pass backlog |
| Design spec | [2026-07-12-workflow-design-cluster3-delivery-ledger](../2026-07-12-workflow-design-cluster3-delivery-ledger/) |
| PR | [#223](https://github.com/m2ux/workflow-server/pull/223) |
