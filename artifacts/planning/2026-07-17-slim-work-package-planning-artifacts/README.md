# Slim work-package planning artifacts — July 2026

> Update · Created 2026-07-17 · **Status:** Reviewing · Revised 2026-07-18

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Update `work-package` so checkpoint-linked planning artifacts (and the messages that point at them) stay cognitively light: one home per fact, salient-only content, plain language, dense tables. Follow the Output Economy shape already landed for `workflow-design` (PR #254). Topology stays intact unless impact analysis proves a tiny message-only change is required.

## Problem Overview

`work-package` pauses at checkpoints and asks the user to decide using linked planning files as evidence. Many of those files are large, overlap each other, and say more than the gate in front of the reader needs — so sessions slow down and rubber-stamping becomes tempting.

This update trims the generated artifacts and the checkpoint messages that point at them: one home per fact, salient-only content, plain language, and dense tables. The activity graph, modes, and transitions stay as they are unless a later impact check shows a tiny message-only tweak is required. The same lean style already landed for `workflow-design` (PR #254) is the pattern to follow.

## Solution Overview

This update shortens four checkpoint messages and option descriptions in `work-package` so each gate is answerable in one short read, with a working link wherever a path variable already exists. Topology stays intact: no activities, transitions, options, effects, or variables are added or removed.

The change touches four activity files only — linking `{change_block_index}` and `{provenance_log_path}`, and dropping restated prose from those gates — while seven persist techniques were audited and left alone. File breakdown: [scope manifest](06-scope-manifest.md).

## Design Decisions

Full dimension deltas (purpose, activity list, checkpoints, artifacts, rules): [design specification](03-design-specification.md).

## Compliance Findings

Quality-review and post-update audits: **0 findings**. Detail: [08-verified-findings.md](08-verified-findings.md) · [10-post-update-review.md](10-post-update-review.md).

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None* | — | — |

## Scope Manifest

[06-scope-manifest.md](06-scope-manifest.md) — 4 activity files, message/description-only; intentional removals: 5.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Structural inventory](01-structural-inventory.md) | Baseline entity/file counts for `work-package` | 5-10m | ✅ Complete |
| 01 | [Format conventions](01-format-conventions.md) | YAML syntax + project conventions | 5-10m | ✅ Complete |
| 01 | [Applicable constructs](01-applicable-constructs.md) | Schema constructs for this update | 5-10m | ✅ Complete |
| 02 | Intake and context | Mode, literacy, problem overview | 15-25m | ✅ Complete |
| 03 | [Design specification](03-design-specification.md) | Change request + acceptance criteria | 20-40m | ✅ Complete |
| 03 | [Assumptions log](03-assumptions-log.md) | Design assumptions reconciled | 5-10m | ✅ Complete |
| 05 | [Impact analysis](05-impact-analysis.md) | Blast radius; confirm no topology change | 15-30m | ✅ Complete |
| 06 | [Scope manifest](06-scope-manifest.md) | Confirmed file list | 10-20m | ✅ Complete |
| 06 | [Drafting plan](06-drafting-plan.md) | Per-file deltas for 4 activities | 5-10m | ✅ Complete |
| 06 | [File review note](06-file-review-note.md) | Removals vs impact §3 | 5-10m | ✅ Complete |
| 06 | [Draft attestation](06-draft-attestation.md) | Block-indexed review of drafted edits | 5-10m | ✅ Complete |
| 07 | Implementation | Edit techniques/resources/checkpoint messages | 45-90m | ✅ Complete |
| 08 | [Verified findings](08-verified-findings.md) | Post-update compliance — 0 findings | 20-40m | ✅ Complete |
| 09 | Validate and commit | Schema validate, commit, open PR | 15-25m | ✅ Complete |
| 09 | [Workflow README](../../../../workflows/work-package/README.md) | Version header synced to v3.31.0 | 5-10m | ✅ Complete |
| 10 | [Post-update review](10-post-update-review.md) | Re-audit committed state — 0 findings | 15-25m | ✅ Complete |
| 10 | [Principle findings](10-principle-findings.md) | Post-update principle pass — 25/25 compliant | — | ✅ Complete |
| 10 | [Anti-pattern findings](10-anti-pattern-findings.md) | Post-update anti-pattern pass — 0 findings | — | ✅ Complete |
| 11 | Retrospective | Session close-out | 10-15m | ⬚ Pending |
| — | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, decisions, limitations | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| PR | [#255](https://github.com/m2ux/workflow-server/pull/255) |
| Precedent (workflow-design) | [2026-07-17-simplify-workflow-design-planning-artifacts](../2026-07-17-simplify-workflow-design-planning-artifacts/) |
| Precedent PR | [#254](https://github.com/paritytech/workflow-server/pull/254) |
| Structural inventory | [01-structural-inventory.md](01-structural-inventory.md) |
| Format conventions | [01-format-conventions.md](01-format-conventions.md) |
| Applicable constructs | [01-applicable-constructs.md](01-applicable-constructs.md) |
| Design specification | [03-design-specification.md](03-design-specification.md) |
| Assumptions log | [03-assumptions-log.md](03-assumptions-log.md) |
