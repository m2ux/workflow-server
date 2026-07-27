# Review-Mode Friction Continuation — July 2026

> Update · Created 2026-07-27 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This session finishes the last eight binding-fidelity drifts on PR #274, the in-flight branch that resolves review-mode friction (#271) and publish-ref link handling (#270) in the `work-package` workflow. All eight sit in the #270 Pass B area, where UPPERCASE URL-template placeholders moved out of a resource file into a technique file and so no longer resolve as session variables. Closing them — together with the outstanding A-9 and A-10 Gate 2 judgements — clears the branch's own drift and leaves PR #274 reviewable without inherited-baseline noise.

## Problem Overview

This server keeps a library of written procedures that tell an AI assistant how to carry out engineering work. One of them — covering how a code review is summarised and posted — was revised across a batch of changes that are already committed and waiting to be reviewed. During that revision, a handful of the rewritten instructions ended up referring to pieces of information by names the system cannot actually look up: an instruction says to use the repository owner in a link, but nothing in the surrounding procedure ever supplies a value under that name. Eight such gaps remain, and all eight were introduced by this batch rather than inherited from what came before.

Left alone, each gap means the assistant reaches a step with nothing to fill in, so the review summary it produces can carry broken links back to the planning documents it is meant to point at — which is the very problem this batch set out to fix. Closing the eight gaps, and settling two judgement calls the earlier run left open, finishes the batch so it can be reviewed and merged as one coherent change instead of leaving a half-corrected procedure in place.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Target, mode, planning folder | 15-30m | ✅ |
| 2 | 01 | [Structural inventory](01-structural-inventory.md) | Target baseline counts and scope | 10-15m | ✅ |
| 3 | 01 | [Format conventions](01-format-conventions.md) | Authoring literacy notes | 5-10m | ✅ |
| 4 | 01 | [Deferred items](01-deferred-items.md) | Out-of-scope deferrals register | 5m | ✅ |
| 5 | 03 | [Design specification](design-specification.md) | Change goals and constraints | 20-40m | ⬚ |
| 6 | 03 | [Assumptions log](assumptions-log.md) | Open and settled assumptions | 10-15m | ⬚ |
| 7 | 04 | [Pattern analysis](pattern-analysis.md) | Applicable patterns and practices | 20-40m | ⬚ |
| 8 | 05 | [Impact analysis](impact-analysis.md) | Blast radius and preservations | 20-40m | ⬚ |
| 9 | 06 | [Scope manifest](scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 10 | 06 | [Drafting plan](drafting-plan.md) | Draft order and blocks | 10-20m | ⬚ |
| 11 | 06 | [Draft attestation](draft-attestation.md) | Batch review attestation | 5-10m | ⬚ |
| 12 | 06 | [File review note](file-review-note.md) | Removals and draft highlights | 5-10m | ⬚ |
| 13 | 08 | Quality review | Principle and anti-pattern audits | 30-60m | ⬚ |
| 14 | 08 | [Principle findings](principle-findings.md) | Principles audit satellite | 10-20m | ⬚ |
| 15 | 08 | [Anti-pattern findings](anti-pattern-findings.md) | Anti-pattern audit satellite | 10-20m | ⬚ |
| 16 | 09 | Validate and commit | Schema check, commit, PR | 20-40m | ⬚ |
| 17 | 10 | Post-update review | Follow-up after merge path | 15-30m | ⬚ |
| 18 | 11 | Retrospective | Session close-out | 15-30m | ⬚ |
| 19 | 11 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables and limitations | 10-20m | ⬚ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | [`work-package/`](https://github.com/m2ux/workflow-server/tree/workflow/work-package-review-mode-friction-271/work-package) |
| PR | [#274](https://github.com/m2ux/workflow-server/pull/274) |
| Issue — review-mode friction | [#271](https://github.com/m2ux/workflow-server/issues/271) |
| Issue — publish-ref links | [#270](https://github.com/m2ux/workflow-server/issues/270) |
