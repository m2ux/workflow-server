# Condition not met when gated checkpoints — August 2026

> Enhancement · Created 2026-08-01 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This work package reviews PR #373 on m2ux/workflow-server: server support so `condition_not_met` dismisses checkpoints gated by `when` as well as structured `condition`, activity-file rule fragment references, and the AP-134 citation-grain guard. Completing the review path records disposition and close-out without treating the change as greenfield implementation.

## Problem Overview

This pull request is about making three related pieces of the workflow-server tooling finish a job that is only half done today. Checkpoints in a workflow can be skipped when their gate says they do not apply, but that skip path only works for one kind of gate; the other common gate form still leaves those checkpoints hanging. Separately, shared rule text can be pulled into workflow-level rules by reference, while the same kind of reference is blocked in activity files, so authors keep pasting the same wording. A third check that would catch a known documentation mistake — citing a whole guide and also citing pieces of it in the same place — is not automated yet.

Together those gaps mean reviews and migrations stay harder than they need to be: agents and authors cannot rely on a single gate style, cannot reuse rule fragments everywhere they write rules, and can reintroduce a citation pattern that already caused trouble. This work package reviews the open PR that is meant to close those gaps so the team can decide whether the change is ready, what still blocks it, and what should be recorded when the review closes.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ✅ |
| 2 | [Prior feedback triage](01-prior-feedback-triage.md) | Review-mode prior feedback ingest | 15-30m | ✅ |
| 3 | [Design philosophy](02-design-philosophy.md) | Problem classification, workflow path | 15-30m | ⬚ |
| 4 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across activities | 10-15m | ⬚ |
| 5 | Requirements elicitation | Scope, success criteria, boundaries | 30-60m | ⊘ |
| 6 | KB research | Knowledge-base and web synthesis | 20-45m | ⊘ |
| 7 | [Implementation analysis](05-implementation-analysis.md) | Baselines, gaps, measurement | 20-45m | ⬚ |
| 8 | [Work package plan](06-work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ⬚ |
| 9 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ |
| 10 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ⬚ |
| 11 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 12 | Assumptions review | Converge open assumptions | 20-40m | ⬚ |
| 13 | Implementation | Code changes per plan | 1-4h | ⊘ |
| 14 | Provenance log | Per-task AI-assistance provenance | 5-15m | ⊘ |
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
| Issue | [#338](https://github.com/m2ux/workflow-server/issues/338) |
| Related | [#358](https://github.com/m2ux/workflow-server/issues/358) |
