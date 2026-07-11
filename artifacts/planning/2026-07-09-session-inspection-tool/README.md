# Session Inspection Tool - July 2026

> Feature · Created 2026-07-11 · **Status:** In Progress

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Adds a read-only `inspect_session` MCP tool to the workflow-server so close-out activities can read a session's own state (variable bag, checkpoint responses, activity lists, history, embedded child sessions) through a first-class, schema-versioned projection instead of ad-hoc inline `python3 -c` reads of `session.json`. Removes a per-call permission prompt and the schema re-discovery cost observed eight times in a single meta + client run, and updates the close-out techniques to advise workers to use the tool.

## Problem Overview

When an AI worker finishes a stretch of work, it needs to look back at the record of its own session — which steps completed, what decisions were made at checkpoints, and what values were carried along the way. Today the workflow server keeps that record in an internal file but offers no built-in way to read it back, so workers improvise: each one writes a small throwaway program on the spot to dig the answers out of the file. In a single observed run this happened eight times, and half of those attempts were the worker guessing at where information lived inside the file.

The consequences are wasted time and avoidable risk. Every improvised read interrupts the person supervising the run with a security confirmation that cannot be pre-approved, because each throwaway program is different from the last. And because each program is re-invented from scratch, a wrong guess about the file's layout silently returns nothing — so a close-out summary could quietly omit facts without anyone noticing. Giving workers one official, read-only way to ask the server about a session removes the interruptions and makes the answers dependable.

## Solution Overview

*Populated during plan-prepare activity.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| — | [Proposal](proposal.md) | Problem evidence, tool proposal, alternatives | — | ✅ Complete |
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 15 | [Comprehension: Session State](../../comprehension/state-tools.md) | Session read path, read-only tool pattern, session-file shape, close-out surfaces; portfolio-lens findings | 30-45m | ✅ Complete |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | `Test plan` | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | `inspect_session` tool + close-out technique updates | 1-3h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | `Test suite review` | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | `Strategic review` | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Close-out (COMPLETE.md)` | Deliverables, deferred items, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#193](https://github.com/m2ux/workflow-server/issues/193) |
| PR | [#215](https://github.com/m2ux/workflow-server/pull/215) (draft) |
