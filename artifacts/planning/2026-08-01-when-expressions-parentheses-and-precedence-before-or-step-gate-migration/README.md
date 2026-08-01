# when expressions: parentheses and precedence before OR step-gate migration — August 2026

> Enhancement · Created 2026-08-01 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

*To be filled as the work package progresses.*

## Problem Overview

Today the workflow corpus can express simple step gates and flat AND compounds as inline `when:` expressions, but any gate that needs OR still has to stay in the older structured `condition:` form. That split exists because parentheses, operator precedence, and a full boolean evaluator for mixed `&&` / `||` were not validated when the plain gates moved over — so authors cannot safely write the nested shapes the remaining sites need.

Until those rules and the evaluator land, OR-shaped gates stay stranded on the structured path, docs that already describe boolean algebra over-promise what the walker can enforce, and a naive OR migration would risk running or skipping steps differently from the structured trees. Clarifying whether agents must also interpret the same expressions in-prompt is part of settling the acceptance bar, not an assumed requirement.


## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ⬚ |
| 2 | [Prior feedback triage](01-prior-feedback-triage.md) | Review-mode prior feedback ingest | 15-30m | ⊘ |
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
| GitHub Issue | [#379](https://github.com/m2ux/workflow-server/issues/379) |
| PR | _pending_ |
