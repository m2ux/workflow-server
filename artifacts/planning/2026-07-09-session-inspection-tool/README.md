# Session Inspection Tool - July 2026

> Feature · Created 2026-07-11 · **Status:** Strategic review complete (clean — scope maps fully to #193; 1 Minor PR-body freshness nit) — awaiting review-findings disposition

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Adds a read-only `inspect_session` MCP tool to the workflow-server so close-out activities can read a session's own state (variable bag, checkpoint responses, activity lists, history, embedded child sessions) through a first-class, schema-versioned projection instead of ad-hoc inline `python3 -c` reads of `session.json`. Removes a per-call permission prompt and the schema re-discovery cost observed eight times in a single meta + client run, and updates the close-out techniques to advise workers to use the tool.

## Problem Overview

When an AI worker finishes a stretch of work, it needs to look back at the record of its own session — which steps completed, what decisions were made at checkpoints, and what values were carried along the way. Today the workflow server keeps that record in an internal file but offers no built-in way to read it back, so workers improvise: each one writes a small throwaway program on the spot to dig the answers out of the file. In a single observed run this happened eight times, and half of those attempts were the worker guessing at where information lived inside the file.

The consequences are wasted time and avoidable risk. Every improvised read interrupts the person supervising the run with a security confirmation that cannot be pre-approved, because each throwaway program is different from the last. And because each program is re-invented from scratch, a wrong guess about the file's layout silently returns nothing — so a close-out summary could quietly omit facts without anyone noticing. Giving workers one official, read-only way to ask the server about a session removes the interruptions and makes the answers dependable.

## Solution Overview

The fix gives workers one official, built-in way to ask the server about a session: a new read-only command called `inspect_session`. A worker names the session it wants and, optionally, which slice of the record it needs — the overall summary, just the decisions made at checkpoints, just the values carried along, the list of steps taken, the event history, or the child sessions spun off along the way. The server reads its own internal file and hands back a tidy, purpose-built answer rather than the whole raw file. Because this is a first-class server command and not an improvised program, it never triggers a security confirmation, and because the server owns it, the answer always matches the file's actual layout instead of relying on a guess.

The result is fewer interruptions for the person supervising a run and more dependable close-out records. The command only reads — it can never change a session — and it works even when a session is paused waiting for a decision, which is exactly when someone tends to want to look. Alongside the new command, the four close-out steps that used to improvise their own reads are updated with a short note telling the worker to use `inspect_session` instead. Together this removes the eight improvised reads seen in a single observed run and closes the risk that a close-out summary quietly leaves something out.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| — | [Proposal](proposal.md) | Problem evidence, tool proposal, alternatives | — | ✅ Complete |
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 15 | [Comprehension: Session State](../../comprehension/state-tools.md) | Session read path, read-only tool pattern, session-file shape, close-out surfaces; portfolio-lens findings | 30-45m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| 08 | [Implementation](08-provenance-log.md) | `inspect_session` tool + close-out technique updates (T1–T6); per-task provenance log | 1-3h | ✅ Complete |
| 09 | [Lean-coding audit](09-review-findings.md) | Over-engineering review (net -1 line; structure mirrors reference — accepted) + [debt ledger](09-debt-ledger.md) (clean) | 10-20m | ✅ Complete |
| 10 | [Change block index](10-change-block-index.md) | Indexed diff hunks (7 files, 11 hunks) for manual review | 5-10m | ✅ Complete |
| 10 | [Post-impl review](10-code-review.md) | Code review + structural + test-suite review; F1 (parity-oracle gap) resolved | 10-20m | ✅ Complete |
| 12 | [Strategic review](12-strategic-review-1.md) | Scope-vs-issue fit, requirement coverage, PR/commit readiness (clean — 0 artifact findings; 1 Minor PR-body nit) + [architecture summary](12-architecture-summary.md) | 15-30m | ✅ Complete |
| — | Validation | Build, test, lint verification (typecheck + build clean · 557 pass / 0 fail / 14 skipped · site-data drift guard satisfied) | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Close-out (COMPLETE.md)` | Deliverables, deferred items, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#193](https://github.com/m2ux/workflow-server/issues/193) |
| PR | [#215](https://github.com/m2ux/workflow-server/pull/215) (draft) |
