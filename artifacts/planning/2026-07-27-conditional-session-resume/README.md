# Conditional Session Resume — July 2026

> Update · Created 2026-07-27 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Starting any work-package workflow currently pays an unconditional saved-session search: the `meta` workflow's `discover-session` activity walks every planning folder (131 today) and parses each `session.json` before the user's actual request begins. This update gates that search on explicit resume intent in the request, so a plain "start" request skips the scan entirely.

## Problem Overview

Every time someone asks the assistant to start a piece of work, it first goes hunting through the entire history of past sessions to see whether this request looks like something that was already underway. That hunt means opening and reading a saved state file inside each of the 131 planning folders accumulated so far, one after another, before a single word of the actual request is acted on. The user waits, sometimes for a long time, for a search they never asked for — and the wait grows steadily longer with every new piece of work the system records.

Worse, the search almost never pays off. The way saved sessions have been recorded since mid-July means recent folders no longer carry the marker the search looks for, so the search cannot match anything created recently no matter how relevant it is. The result is the worst of both worlds: a delay on every single start, in exchange for a match that only older folders could ever produce. People who genuinely want to pick up where they left off get no better service than people who simply want to begin.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Target, mode, planning folder | 15-30m | ✅ |
| 2 | 01 | [Structural inventory](01-structural-inventory.md) | Baseline shape of `meta` | 10-15m | ✅ |
| 3 | 01 | [Format conventions](02-format-conventions.md) | Authoring literacy notes | 5-10m | ✅ |
| 4 | 03 | [Design specification](design-specification.md) | Change goals and constraints | 20-40m | ⬚ |
| 5 | 03 | [Assumptions log](assumptions-log.md) | Open and settled assumptions | 10-15m | ⬚ |
| 6 | 04 | [Pattern analysis](pattern-analysis.md) | Applicable patterns and practices | 20-40m | ⬚ |
| 7 | 05 | [Impact analysis](impact-analysis.md) | Blast radius and preservations | 20-40m | ⬚ |
| 8 | 06 | [Scope manifest](scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 9 | 06 | [Drafting plan](drafting-plan.md) | Draft order and blocks | 10-20m | ⬚ |
| 10 | 06 | [Draft attestation](draft-attestation.md) | Batch review attestation | 5-10m | ⬚ |
| 11 | 06 | [File review note](file-review-note.md) | Removals and draft highlights | 5-10m | ⬚ |
| 12 | 08 | Quality review | Principle and anti-pattern audits | 30-60m | ⬚ |
| 13 | 08 | [Principle findings](principle-findings.md) | Principles audit satellite | 10-20m | ⬚ |
| 14 | 08 | [Anti-pattern findings](anti-pattern-findings.md) | Anti-pattern audit satellite | 10-20m | ⬚ |
| 15 | 09 | Validate and commit | Schema check, commit, PR | 20-40m | ⬚ |
| 16 | 10 | Post-update review | Follow-up after merge path | 15-30m | ⬚ |
| 17 | 11 | Retrospective | Session close-out | 15-30m | ⬚ |
| 18 | 11 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables and limitations | 10-20m | ⬚ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/meta/` |
| Repository | m2ux/workflow-server |
