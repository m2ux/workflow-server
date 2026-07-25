# Update the Docs Site — July 2026

> Enhancement · Created 2026-07-25 · **Status:** Implementation complete — post-implement review next

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Bring the workflow-server documentation site and aligned markdown sources current so operators and agents can find accurate setup, workflow, and day-to-day guidance. Classified as an inventive improvement (moderate) on an elicitation-only path: pin scope and success criteria, then refresh content under the existing two-layer docs system (markdown canonical, hand-authored site/).

## Problem Overview

The workflow-server documentation site needs an update so readers can find accurate, current guidance for setup, workflows, and day-to-day use. Today, parts of the published docs lag the product, which makes onboarding and correct configuration harder than they should be.

When docs drift, people waste time on outdated steps, misconfigure environments, and lose trust in the official material. Bringing the docs site current restores a single reliable place for how the system works and how to use it.

## Solution Overview

We will keep the existing two-layer docs system (markdown as source of truth, hand-authored site with generated API/nav regions) and use the evidence in [implementation-analysis.md](implementation-analysis.md) to fix trust-breaking drift first, then onboarding, then polish.

After you confirm the approach, work lands on PR #293 in seven reviewable batches: factual corrections (**remove** brittle inventory counts; session_index; vocabulary; ghost paths), onboarding/navigation, de-duplication, plain language, troubleshooting/examples, accessibility, and automated drift checks—ending with site tests and a manual golden-path walk, without a new docs platform or product redesign.

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ✅ |
| 2 | 01 | [Prior feedback triage](prior-feedback-triage.md) | Review-mode prior feedback ingest | 15-30m | ⊘ |
| 3 | 02 | [Design philosophy](design-philosophy.md) | Problem classification, workflow path | 15-30m | ✅ |
| 4 | 02 | [Assumptions log](assumptions-log.md) | Tracked assumptions across activities | 10-15m | ✅ |
| 5 | 03 | [Requirements elicitation](requirements-elicitation.md) | Scope, success criteria, boundaries | 30-60m | ✅ |
| 6 | 04 | [KB research](kb-research.md) | Knowledge-base and web synthesis | 20-45m | ⊘ |
| 7 | 05 | [Implementation analysis](implementation-analysis.md) | Baselines, gaps, measurement (A–G) | 20-45m | ✅ |
| 8 | 06 | [Work package plan](work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ✅ |
| 9 | 06 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ |
| 10 | 06 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ✅ |
| 11 | 06 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 12 | 07 | Assumptions review | Converge open assumptions | 20-40m | ✅ |
| 13 | 08 | Implementation | Batches 1–7 on PR #293; README rewrite out of scope | 1-4h | ✅ |
| 14 | 08 | [Provenance log](provenance-log.md) | Per-task AI-assistance provenance | 5-15m | ⬚ |
| 15 | 09 | Lean-coding audit | Ponytail lean lens on the change | 15-30m | ✅ |
| 16 | 09 | [Code review](code-review.md) | Consolidated review findings home | 15-30m | ✅ |
| 17 | 09 | [Debt ledger](debt-ledger.md) | Harvested ponytail debt markers | 10-20m | ✅ |
| 18 | 09 | [Lean change](lean-change.md) | Applied lean simplifications record | 10-20m | ✅ |
| 19 | 10 | Post-implementation review | Quality review before validation | 30-60m | ✅ |
| 20 | 10 | [Change block index](change-block-index.md) | Indexed diff hunks for review | 5-10m | ✅ |
| 21 | 10 | [Test suite review](test-suite-review.md) | Test quality and coverage | 10-20m | ✅ |
| 22 | 10 | [Structural analysis](structural-analysis.md) | Prism L12 when written standalone | 15-30m | ✅ |
| 23 | 10 | [Architecture summary](architecture-summary.md) | Stakeholder architecture overview | 15-30m | ✅ |
| 24 | 11 | Validation | Build, test, lint verification | 15-30m | ✅ |
| 25 | 12 | [Strategic review](strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ◐ |
| 26 | 13 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 27 | 14 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 28 | 14 | [Token usage](token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 29 | 14 | [Session trace](session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |
| 30 | 15 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ✅ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | _skipped_ |
| PR | [#293](https://github.com/m2ux/workflow-server/pull/293) |
