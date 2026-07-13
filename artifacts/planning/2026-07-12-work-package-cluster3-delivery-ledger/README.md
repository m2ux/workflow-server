# Cluster 3 Delivery Ledger - July 2026

> Enhancement · Created 2026-07-12 · Revised 2026-07-13 · **Status:** Submitted for review — DCO certified, branch pushed (`a0e35c39`), PR #223 body finalized and marked ready-for-review; awaiting review feedback

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Implements the cluster 3 "delivery ledger" server-side changes for the workflow-server: a block-level delivery ledger that tracks which technique/rule content blocks a session+agent has already received, plus `get_workflow` payload slimming. Together these cut repeated payload delivery so long-running sessions spend fewer tokens re-receiving unchanged content.

## Problem Overview

When an AI agent works through a long workflow, the server keeps handing it the same instructional content over and over. Earlier work taught the server to notice when it was about to re-send an entire block of instructions unchanged and instead send a tiny "you already have this" marker. That saved a lot, but two gaps remain. First, the biggest instruction payloads are only *partly* the same each time: a shared contract section and a rules section repeat verbatim, but they sit next to a piece that legitimately changes, so the server's whole-payload comparison never matches and it re-sends everything — roughly a quarter of that content is needless repetition. Second, a separate large bundle the server sends to set up each workflow is always sent in full, and it is paid again every time a session resumes.

This work closes both gaps. It teaches the server to compare and skip the repeating sections *individually* — the shared contract and the rules — rather than only the payload as a whole, and it lets the workflow setup bundle be skipped on resume the same way. The result is that agents in long-running sessions receive noticeably less duplicate text, which lowers the token cost and leaves more of the agent's limited working memory for the actual task. The change is opt-in and only affects sessions already using the skip-when-unchanged mode, so ordinary sessions behave exactly as before.

## Solution Overview

The fix teaches the server two new skip-when-unchanged tricks, both building on the mechanism it already uses. First, instead of only comparing each instruction payload as a whole, the server now compares the two repeating sections inside it — the shared contract and the rules — on their own. The first technique in a session sends them in full; every later technique that shares the same sections gets a tiny "you already have this" marker in their place, while the part that genuinely differs is still sent in full. Second, the large setup bundle the server sends when a workflow starts is now remembered too, so when a paused session is resumed the server can skip re-sending it and send a marker instead.

The result is that an agent working through a long session receives noticeably less duplicate text, which lowers the token cost and leaves more of its limited working memory for the actual task. The change is deliberately narrow and safe: it only activates for sessions already running in the skip-when-unchanged mode, it never alters the meaning of anything the agent receives, and ordinary sessions and short-lived helper agents behave exactly as they did before. If an agent ever loses track of a section it was told to remember, it can always ask for the full content again.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete (initial) |
| — | Implementation | Code changes per plan (commit `1c2d379f`) | 1-4h | ✅ Complete |
| 08 | [Provenance log](08-provenance-log.md) | Per-task DCO provenance rows | 5-10m | ✅ Complete |
| 09 | [Review findings](09-review-findings.md) | Over-engineering audit + applied simplification (`d55cae8d`) | 10-20m | ✅ Complete |
| 09 | [Debt ledger](09-debt-ledger.md) | Ponytail marker harvest (0 markers, clean) | 5-10m | ✅ Complete |
| 10 | [Change block index](10-change-block-index.md) | Indexed diff hunks for manual review (5 files, 16 hunks) | 5-10m | ✅ Complete |
| 10 | [Manual diff review](10-manual-diff-review.md) | Provenance attestation + user corrections | 5-10m | ✅ Complete |
| 10 | [Code review](10-code-review.md) | Code quality review — 0 ≥Minor, 3 Informational | 10-20m | ✅ Complete |
| 10 | [Structural analysis](10-structural-analysis.md) | Ledger conservation / channel-isolation walk | 10-20m | ✅ Complete |
| 10 | [Test suite review](10-test-suite-review.md) | Coverage assessment — TEST-1 gap found + fixed | 10-20m | ✅ Complete |
| 10 | [Architecture summary](10-architecture-summary.md) | Stakeholder overview | 10-15m | ✅ Complete |
| — | Fix cycle | Comment/description trims + TEST-1 + site regen (commit `a0e35c39`) | 20-40m | ✅ Complete |
| 12 | [Strategic review](12-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| — | [Comprehension artifact](../../comprehension/delivery-ledger.md) | Persistent codebase knowledge (delivery-ledger subsystem) | 20-45m | ✅ Complete |
| 11 | [Validation](11-validation.md) | Build, test, lint verification — PASS; baseline drift confirmed independent | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | 🔄 In progress (PR #223 ready-for-review) |
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, deferred items, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Parent Epic | [#189](https://github.com/m2ux/workflow-server/issues/189) — Epic: schema/technique/disclosure review repeat-pass backlog |
| Design spec | [2026-07-12-workflow-design-cluster3-delivery-ledger](../2026-07-12-workflow-design-cluster3-delivery-ledger/) |
| PR | [#223](https://github.com/m2ux/workflow-server/pull/223) |
