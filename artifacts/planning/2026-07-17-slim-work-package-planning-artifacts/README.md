# Slim work-package planning artifacts — July 2026

> Update · Created 2026-07-17 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Update `work-package` so checkpoint-linked planning artifacts (and the messages that point at them) stay cognitively light: one home per fact, salient-only content, plain language, dense tables. Follow the Output Economy shape already landed for `workflow-design` (PR #254). Topology stays intact unless impact analysis proves a tiny message-only change is required.

## Problem Overview

`work-package` pauses at checkpoints and asks the user to decide using linked planning files as evidence. Many of those files are large, overlap each other, and say more than the gate in front of the reader needs — so sessions slow down and rubber-stamping becomes tempting.

This update trims the generated artifacts and the checkpoint messages that point at them: one home per fact, salient-only content, plain language, and dense tables. The activity graph, modes, and transitions stay as they are unless a later impact check shows a tiny message-only tweak is required. The same lean style already landed for `workflow-design` (PR #254) is the pattern to follow.

## Solution Overview

*[Filled when known; link scope manifest for file breakdown.]*

## Design Decisions

Full dimension deltas (purpose, activity list, checkpoints, artifacts, rules): [design specification](03-design-specification.md).

## Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

## Scope Manifest

*[Link to scope-manifest artifact when confirmed.]*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Structural inventory](01-structural-inventory.md) | Baseline entity/file counts for `work-package` | 5-10m | ✅ Complete |
| 01 | [Format conventions](01-format-conventions.md) | YAML syntax + project conventions | 5-10m | ✅ Complete |
| 01 | [Applicable constructs](01-applicable-constructs.md) | Schema constructs for this update | 5-10m | ✅ Complete |
| 02 | Intake and context | Mode, literacy, problem overview | 15-25m | ✅ Complete |
| 03 | [Design specification](03-design-specification.md) | Change request + acceptance criteria | 20-40m | ✅ Complete |
| 03 | [Assumptions log](03-assumptions-log.md) | Design assumptions reconciled | 5-10m | ✅ Complete |
| 05 | Impact analysis | Blast radius; confirm no topology change | 15-30m | ⬚ Pending |
| 06 | Scope manifest | Confirmed file list | 10-20m | ⬚ Pending |
| 07 | Implementation | Edit techniques/resources/checkpoint messages | 45-90m | ⬚ Pending |
| 08 | Quality review | Post-update compliance | 20-40m | ⬚ Pending |
| 09 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, decisions, limitations | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Precedent (workflow-design) | [2026-07-17-simplify-workflow-design-planning-artifacts](../2026-07-17-simplify-workflow-design-planning-artifacts/) |
| Precedent PR | [#254](https://github.com/paritytech/workflow-server/pull/254) |
| Structural inventory | [01-structural-inventory.md](01-structural-inventory.md) |
| Format conventions | [01-format-conventions.md](01-format-conventions.md) |
| Applicable constructs | [01-applicable-constructs.md](01-applicable-constructs.md) |
| Design specification | [03-design-specification.md](03-design-specification.md) |
| Assumptions log | [03-assumptions-log.md](03-assumptions-log.md) |
