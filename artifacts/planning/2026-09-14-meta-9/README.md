# Requirements Refinement Update — September 2026

> Update · Created 2026-09-14 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This session updates `requirements-refinement` against the workflow-design canon and adds a planning-folder README Progress table via a readme-seed profile, so Progress status writes have rows to land on. The known gap is that this workflow has no seed profile and no Progress inventory; a canon review of the same tree may add further in-workflow findings. Meta opening and dispatch defects (sticky repo bind, resolve-target host-root, unresolved `setVariable` templates, worker-spawned `dispatch-client-workflow`) are out of scope.

## Problem Overview

This project keeps a library of reusable written procedures that an AI assistant follows so the same kind of job is done the same way each time. One of those procedures takes meeting notes and rough documents and turns them into a tidy, formal list of requirements. When that procedure runs, it is supposed to keep a simple progress table in a planning folder — a checklist a person can skim — but this procedure never created that table. Every later attempt to mark a step done wrote to nothing.

A separate pass will also read the same procedure against the project's written house standards and correct what that reading finds inside it. Defects that belong to how sessions are opened and how child work is dispatched live elsewhere and are not part of this change. After this update, the requirements procedure grows a progress table its status writes can land on, and the rest of its own files match the house standards the review applies.

## Solution Overview

*Placeholder — a later step replaces it.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Intake and context | Target, mode, planning folder | 15-30m | ✅ |
| 2 | [Format conventions](01-format-conventions.md) | Authoring literacy notes | 5-10m | ✅ |
| 3 | [Design specification](design-specification.md) | Change goals and constraints | 20-40m | ⬚ |
| 4 | [Assumptions log](assumptions-log.md) | Open and settled assumptions | 10-15m | ⬚ |
| 5 | [Pattern analysis](pattern-analysis.md) | Applicable patterns and practices | 20-40m | ⬚ |
| 6 | [Impact analysis](impact-analysis.md) | Blast radius and preservations | 20-40m | ⬚ |
| 7 | [Scope manifest](scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 8 | [Drafting plan](drafting-plan.md) | Draft order and blocks | 10-20m | ⬚ |
| 9 | [Draft attestation](draft-attestation.md) | Batch review attestation | 5-10m | ⬚ |
| 10 | [File review note](file-review-note.md) | Removals and draft highlights | 5-10m | ⬚ |
| 11 | Quality review | Principle and anti-pattern audits | 30-60m | ⬚ |
| 12 | [Principle findings](principle-findings.md) | Principles audit satellite | 10-20m | ⬚ |
| 13 | [Anti-pattern findings](anti-pattern-findings.md) | Anti-pattern audit satellite | 10-20m | ⬚ |
| 14 | Validate and commit | Schema check, commit, PR | 20-40m | ⬚ |
| 15 | Post-update review | Follow-up after merge path | 15-30m | ⬚ |
| 16 | Retrospective | Session close-out | 15-30m | ⬚ |
| 17 | [Close-out](COMPLETE.md) | Deliverables and limitations | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/requirements-refinement/` |
