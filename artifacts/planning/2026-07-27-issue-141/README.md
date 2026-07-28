# Hierarchical Path-Scoped Resource Section References — July 2026

> Feature · Created 2026-07-27 · **Status:** Aborted before plan-prepare · Revised 2026-07-28

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences explaining what this delivers and why it matters]

## Problem Overview

The workflow server keeps its reference material in documents made up of nested headings, and a workflow step asks for one part of a document by naming the heading it wants after a `#`. That name is a single flat label, matched against every heading in the file at once, with no way to say "the *Grep Patterns* heading that sits under *Pattern 3*". Two separate pieces of code turn a heading into that label, and they disagree: the checker that runs before release converts headings one way, while the code that actually fetches the section at run time converts them another. A link can therefore pass every automated check and still return nothing when a workflow tries to use it — and there are live examples of exactly that in the current material.

The practical cost falls in two places. When a request quietly comes back empty, the step that needed that guidance carries on without it, so the failure shows up later as poor work rather than as an error anyone can see. And when a document repeats the same heading in several places — one catalogue repeats the same two headings seven times, once per pattern — only the first copy is reachable at all, so steps are forced to load the entire 326-line file just to read a small part of it, crowding out room the agent needs for the actual task. This work makes the two pieces of code agree on one set of rules, and lets a step address a heading by its position in the document's hierarchy (for example `parent-section/child-section`), so requests either return exactly the intended section or fail with a clear message saying which part could not be found. Every reference that works today keeps working unchanged.

## Solution Overview

The two pieces of code that turn a heading into a label are being replaced by a single shared one, so there is only one rule and both sides follow it. That one rule is written to match exactly what GitHub itself does, including the way GitHub handles a document that repeats the same heading: it quietly numbers the repeats, so the second copy of a heading can be asked for by name. Making the fetching code honour that numbering is what finally makes every repeated heading reachable, which turns out to remove the need for the more elaborate "parent/child" addressing the original request proposed — so that idea has been set aside rather than built, and the reference material stays ordinary markdown that still works when read on GitHub or in an editor. Alongside this, the pre-release checker gains the ability to complain about a request that is technically valid but cannot possibly mean one specific heading, and to prove, for every link it approves, that the fetching code really does return something for it.

The practical guarantee is that a check which passes can no longer hide a request that comes back empty at run time, because the checker now tests the real fetching code rather than its own private imitation of it. Every reference that works today returns the same content afterwards, with two deliberate and fully enumerated exceptions: six references shift by two characters because two documents had a formatting fault that was quietly cutting their content short, and three references are being rewritten to point at the section their authors meant, which also makes them slightly cheaper to deliver. Ninety-nine references that are currently accepted but silently return nothing start working. The work is deliberately narrow in two further respects: it does not add any new third-party code, and it does not attempt to repair fourteen unrelated test failures that were already present before this work began — those are recorded so nobody mistakes them for damage caused here.

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Start work package | Issue, branch, worktree, planning folder | 20-40m | ✅ |
| 2 | 01 | [Prior feedback triage](prior-feedback-triage.md) | Review-mode prior feedback ingest | 15-30m | ⊘ |
| 3 | 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, workflow path | 15-30m | ✅ |
| 4 | 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across activities | 10-15m | ✅ |
| 5 | 03 | [Requirements elicitation](03-requirements-elicitation.md) | Scope, success criteria, boundaries | 30-60m | ✅ |
| 6 | 04 | [KB research](04-kb-research.md) | Knowledge-base and web synthesis | 20-45m | ✅ |
| 7 | 05 | [Implementation analysis](05-implementation-analysis.md) | Baselines, gaps, measurement | 20-45m | ✅ |
| 8 | 06 | [Work package plan](06-work-package-plan.md) | Tasks, estimates, dependencies | 20-45m | ⬚ |
| 9 | 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ |
| 10 | 06 | [Deferred items](deferred-items.md) | Out-of-scope deferral register | 5-10m | ✅ |
| 11 | 06 | [Follow-ups](follow-ups.md) | In-task follow-ups register | 5-10m | ⬚ |
| 12 | 07 | Assumptions review | Converge open assumptions | 20-40m | ⬚ |
| 13 | 08 | Implementation | Code changes per plan | 1-4h | ⬚ |
| 14 | 08 | [Provenance log](provenance-log.md) | Per-task AI-assistance provenance | 5-15m | ⬚ |
| 15 | 09 | Lean-coding audit | Ponytail lean lens on the change | 15-30m | ⬚ |
| 16 | 09 | [Code review](code-review.md) | Consolidated review findings home | 15-30m | ⬚ |
| 17 | 09 | [Debt ledger](debt-ledger.md) | Harvested ponytail debt markers | 10-20m | ⬚ |
| 18 | 09 | [Lean change](lean-change.md) | Applied lean simplifications record | 10-20m | ⬚ |
| 19 | 10 | Post-implementation review | Quality review before validation | 30-60m | ⬚ |
| 20 | 10 | [Change block index](change-block-index.md) | Indexed diff hunks for review | 5-10m | ⬚ |
| 21 | 10 | [Test suite review](test-suite-review.md) | Test quality and coverage | 10-20m | ⬚ |
| 22 | 10 | [Structural analysis](structural-analysis.md) | Prism L12 when written standalone | 15-30m | ⬚ |
| 23 | 10 | [Architecture summary](architecture-summary.md) | Stakeholder architecture overview | 15-30m | ⬚ |
| 24 | 11 | Validation | Build, test, lint verification | 15-30m | ⬚ |
| 25 | 12 | [Strategic review](strategic-review-1.md) | Scope/minimality series (`strategic-review-{n}`) | 15-30m | ⬚ |
| 26 | 13 | Submit for review | PR review lifecycle / stealth push | 30-60m | ⬚ |
| 27 | 14 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, limitations, retrospective; ADR when owed | 10-20m | ⬚ |
| 28 | 14 | [Token usage](token-usage.md) | Session token and cost summary | 5-10m | ⬚ |
| 29 | 14 | [Session trace](session-trace.md) | Lean mechanical execution trace | 5-10m | ⬚ |
| 30 | 15 | Codebase comprehension | Persistent knowledge under comprehension/ | 20-45m | ✅ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#141](https://github.com/m2ux/workflow-server/issues/141) |
| PR | _pending_ |
