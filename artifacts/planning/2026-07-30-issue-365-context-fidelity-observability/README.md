# Context Fidelity and Observability — July 2026

> Enhancement · Created 2026-07-30 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences explaining what this delivers and why it matters]

## Problem Overview

The workflow server coordinates AI-assisted engineering work: it hands each stage of a task to a worker, collects what that worker produced, and saves the results into a shared planning folder. Four gaps have accumulated in that machinery. First, the server takes each worker's word for which files it created and never compares that claim against what is actually on disk, so files nobody declared and nobody reviewed can be saved into the project's history unnoticed. Second, it records how much work each stage consumed — measured in tokens, the billable unit of AI usage — but never adds those figures up, because it has not settled how to count a worker that was paused and restarted; so nobody can see what a run cost. Third, it already avoids re-sending whole documents it has sent before, but it cannot see that the same standard wording is repeated many times *inside* those documents, and that repetition is roughly a quarter of what sending them costs. Fourth, its diagnostics stop short in three places: it does not check that the reference material it points workers at actually exists, it reports only at stage boundaries rather than step by step, and it cannot narrow a view down to a single worker.

Left alone, these gaps cost money and trust. Undeclared files reaching the saved record undermines the review discipline the workflow exists to enforce, and this is not hypothetical — two planning documents and twenty tracked assumptions once reached a commit that no one had read. Without a run total there is no way to budget a piece of work, compare two approaches, or notice a run that went badly wrong, so cost stays invisible until a bill arrives. The repeated wording is paid for on every single delivery, quietly inflating the price of every task the server runs. And the missing diagnostics mean that when something does go wrong, the evidence needed to explain it was never captured in the first place. This work closes all four gaps, so that what gets saved is what was declared, what a run costs is a number anyone can read, repeated material is paid for once, and failures leave a trail behind them.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ✅ |
| 2 | Prior feedback triage | Review-mode prior feedback ingest | 15-30m | ⊘ |
| 3 | [Design philosophy](02-design-philosophy.md) | Problem classification, workflow path | 15-30m | ⬚ |
| 4 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across activities | 10-15m | ⬚ |
| 5 | [Requirements elicitation](03-requirements-elicitation.md) | Scope, success criteria, boundaries | 30-60m | ⬚ |
| 6 | [KB research](04-kb-research.md) | Knowledge-base and web synthesis | 20-45m | ⬚ |
| 7 | [Implementation analysis](05-implementation-analysis.md) | Baselines, gaps, measurement | 20-45m | ⬚ |
| 8 | [Work package plan](06-work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ⬚ |
| 9 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ |
| 10 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ⬚ |
| 11 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 12 | Assumptions review | Converge open assumptions | 20-40m | ⬚ |
| 13 | Implementation | Code changes per plan | 1-4h | ⬚ |
| 14 | [Provenance log](08-provenance-log.md) | Per-task AI-assistance provenance | 5-15m | ⬚ |
| 15 | Lean-coding audit | Ponytail lean lens on the change | 15-30m | ⬚ |
| 16 | [Code review](09-code-review.md) | Consolidated review findings home | 15-30m | ⬚ |
| 17 | [Debt ledger](09-debt-ledger.md) | Harvested ponytail debt markers | 10-20m | ⬚ |
| 18 | [Lean change](09-lean-change.md) | Applied lean simplifications record | 10-20m | ⬚ |
| 19 | Post-implementation review | Quality review before validation | 30-60m | ⬚ |
| 20 | [Change block index](10-change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ |
| 21 | [Test suite review](10-test-suite-review.md) | Test quality and coverage | 10-20m | ⬚ |
| 22 | [Structural analysis](10-structural-analysis.md) | Prism L12 when written standalone | 15-30m | ⬚ |
| 23 | [Architecture summary](10-architecture-summary.md) | Stakeholder architecture overview | 15-30m | ⬚ |
| 24 | Validation | Build, test, lint verification | 15-30m | ⬚ |
| 25 | [Strategic review](12-strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ⬚ |
| 26 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 27 | [Close-out](14-COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 28 | [Token usage](14-token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 29 | [Session trace](14-session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |
| 30 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#365](https://github.com/m2ux/workflow-server/issues/365) |
| PR | [#366](https://github.com/m2ux/workflow-server/pull/366) |
