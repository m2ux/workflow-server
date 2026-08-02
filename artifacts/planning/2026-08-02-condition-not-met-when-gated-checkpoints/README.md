# Condition not met for when-gated checkpoints — August 2026

> Feature · Created 2026-08-02 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This work package continues implementation on open draft PR #373 for m2ux/workflow-server: finish server support so `condition_not_met` dismisses checkpoints gated by `when` as well as structured `condition`, add activity-file rule fragment references, and land the AP-134 citation-grain guard. Completing the path lands the remaining server half of the when/condition merge and unblocks the companion corpus migration.

## Problem Overview

Workflow checkpoints can be dismissed when their gate says they do not apply, but that dismissal path only works for one gate form today. The other common form — a `when` expression — still leaves those checkpoints active even when the expression is false, so agents keep hitting steps that should have been skipped. At the same time, shared rule text can be referenced from workflow-level rules, while activity files cannot use the same fragment references, so authors paste the same wording in many places. A third gap is automation: a known documentation mistake (citing a whole guide and also citing pieces of it in the same place) is not yet caught by a guard.

Those three gaps slow reviews and migrations. Authors cannot rely on one gate style, cannot reuse rule fragments everywhere rules are written, and can reintroduce a citation pattern that already caused trouble. This work package finishes the open PR that closes those gaps so the server behaviour matches the schema direction already chosen, and the companion corpus work can migrate cleanly.

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
| PR | [#373](https://github.com/m2ux/workflow-server/pull/373) |
| Related | [#338](https://github.com/m2ux/workflow-server/issues/338) |
| Related | [#358](https://github.com/m2ux/workflow-server/issues/358) |
