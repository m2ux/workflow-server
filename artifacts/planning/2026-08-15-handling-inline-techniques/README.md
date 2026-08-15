# Handling Inline Techniques — August 2026

> Enhancement · Created 2026-08-15 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Technique files call other technique files from inside their protocol prose, and the server treats those calls as ordinary text — nothing resolves the reference, checks its arguments, or delivers the called technique. This work package settles how those inline calls are handled and carries the answer into the guards, the loader, and the design canon. A corpus survey counted 118 such call edges, 99 of them invisible to the activity layer and 56 passing fewer arguments than the technique they call declares.

**Binding note.** The request named issue #394, which was closed as not planned on 2026-08-02 and consolidated into the open epic [#397](https://github.com/m2ux/workflow-server/issues/397) as work items W2 and W3. This work package is bound to #397. The request also asks for a choice between hoisting inline calls to activity level and defining a canonical inline mechanism; that choice already has a recorded answer — the **visibility rule** in the [doctrine decision record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-protocol-structure-consolidation/doctrine-decision.md), which resolves it as neither-alone: a technique may call another technique when the result stays inside the calling technique's own work, and the call must become an activity step the moment the workflow itself acts on the outcome. Whether this work package executes that decision or reopens it is settled at requirements elicitation.

## Problem Overview

A technique file is a short instruction sheet telling the assistant how to carry out one job. Sometimes a sheet says, in the middle of its own instructions, to go and do what another sheet says, handing it a couple of values to work with. The server that gives out these sheets does not notice those sentences. It does not fetch the other sheet, it does not check that the values being handed over are the ones that sheet actually asks for, and it does not send that sheet along with the first. The assistant receives a file path buried in a sentence and has to work out the rest on its own. A count across all 554 sheets found 118 of these hand-offs. Ninety-nine of them — 84% — are invisible to the layer that schedules work, and 56 hand over fewer values than the sheet on the receiving end says it needs.

The consequence is that a whole class of instruction goes unchecked. When a sheet is renamed, or changes the values it needs, nothing warns the sheets that call it, so callers drift out of step silently — and examples of exactly that drift are already present in the codebase. About ten entries in one server file exist only to patch the gap by hand, with nothing keeping them aligned with the prose they mirror. This work package settles how these hand-offs are treated, so each one is either scheduled as a step the system can see or resolved and checked by the server before it is handed over, and it puts that same answer into the automated checks, the server, and the written design rules together rather than one at a time.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ✅ |
| 2 | [Design philosophy](02-design-philosophy.md) | Problem classification, workflow path | 15-30m | ⬚ |
| 3 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across activities | 10-15m | ⬚ |
| 4 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ⬚ |
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
| 17 | [Lean change](09-lean-change.md) | Applied lean simplifications record | 10-20m | ⬚ |
| 18 | Post-implementation review | Quality review before validation | 30-60m | ⬚ |
| 19 | [Change block index](10-change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ |
| 20 | [Code review method](10-code-review-method.md) | What the code review walked and swept | 5-10m | ⬚ |
| 21 | [Test suite review](10-test-suite-review.md) | Test quality and coverage | 10-20m | ⬚ |
| 22 | [Test suite review method](10-test-suite-review-method.md) | Suite baseline, coverage map, sweeps | 5-10m | ⬚ |
| 23 | [Structural analysis](10-structural-analysis.md) | Prism L12 when written standalone | 15-30m | ⬚ |
| 24 | [Architecture summary](10-architecture-summary.md) | Stakeholder architecture overview | 15-30m | ⬚ |
| 25 | Validation | Build, test, lint verification | 15-30m | ⬚ |
| 26 | [Strategic review](12-strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ⬚ |
| 27 | [Strategic review method](12-strategic-review-1-method.md) | Scope, conformance, minimality and delivery passes | 5-10m | ⬚ |
| 28 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 29 | [Close-out](14-COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 30 | [Token usage](14-token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 31 | [Session trace](14-session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#397](https://github.com/m2ux/workflow-server/issues/397) — [Epic] Protocol Structure: Alternatives and Delegation the Server Can See |
| Originating issue | [#394](https://github.com/m2ux/workflow-server/issues/394) — closed as not planned, consolidated into #397 as work items W2 and W3 |
| PR | [#466](https://github.com/m2ux/workflow-server/pull/466) — draft, branch `feat/397-handling-inline-techniques` off `main` |
| Fold investigation | [2026-08-02-inline-technique-fold-investigation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-inline-technique-fold-investigation) |
| Doctrine decision record | [doctrine-decision.md](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-protocol-structure-consolidation/doctrine-decision.md) |
