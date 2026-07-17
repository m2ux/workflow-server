# Simplify workflow-design planning artifacts — July 2026

> Update · Created 2026-07-17 · **Status:** Complete

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Update `workflow-design` so its generated planning artifacts stay short and decision-facing: less redundancy, plain language, and only the facts needed at each checkpoint. Checkpoints today link large sprawling files that exceed the cognitive load for an informed choice.

## Problem Overview

The Workflow Design workflow walks an agent through creating, updating, or reviewing a workflow definition. Along the way it writes planning files and pauses at checkpoints so a person can confirm mode, requirements, impact, scope, drafts, and review findings. Those checkpoints point at the planning files as the evidence for each choice.

Today many of those files are long and overlapping. A person asked to confirm a change often faces far more text than they need for that decision, which slows the session and makes mistakes more likely. This update exists to slim those generated artifacts—cut redundancy, keep plain language, and leave only the salient facts that make each checkpoint easy to answer.

## Solution Overview

This update keeps Workflow Design’s create / update / review path the same. It changes how planning files are written and how checkpoints point at them: each gate gets one clear artifact with the facts needed to decide, written in plain language and short tables.

Fourteen files under `workflows/workflow-design/` are in scope — nine techniques, three resource templates, and two activity checkpoint messages. Nothing is added or removed from the activity graph. The full file list is in the [scope manifest](06-scope-manifest.md).

## Design Decisions

- [Design specification](03-design-specification.md) — lean checkpoint-linked planning artifacts (confirmed)
- [Assumptions log](03-assumptions-log.md) — four design assumptions; none open
- [Impact analysis](05-impact-analysis.md) — 12 intentional removals; topology intact (confirmed)
- [Scope manifest](06-scope-manifest.md) — 14 modify-only files (confirmed)

## Compliance Findings

Quality-review and post-update audits: **0 findings**. Detail: [08-verified-findings.md](08-verified-findings.md) · [10-post-update-review.md](10-post-update-review.md).

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None* | — | — |

## Scope Manifest

[06-scope-manifest.md](06-scope-manifest.md) — 14 modify; no create/remove; topology unchanged.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Structural inventory](01-structural-inventory.md) | File and entity counts (baseline) | 10m | ✅ Complete |
| 01 | [Format conventions](01-format-conventions.md) | YAML syntax and project conventions | 10m | ✅ Complete |
| 01 | [Applicable constructs](01-applicable-constructs.md) | Schema constructs for this update | 10m | ✅ Complete |
| — | Intake and Context | Mode, literacy, problem overview | 15-25m | ✅ Complete |
| 03 | [Design specification](03-design-specification.md) | Update-dimension lean-artifact spec | 20-30m | ✅ Complete |
| 03 | [Assumptions log](03-assumptions-log.md) | Design assumptions (none open) | 10-15m | ✅ Complete |
| — | Requirements Refinement | Design dimensions, specification, assumptions | 30-45m | ✅ Complete |
| 05 | [Impact analysis](05-impact-analysis.md) | Impact classification and preservation checks | 20-30m | ✅ Complete |
| 06 | [Scope manifest](06-scope-manifest.md) | File manifest and structural design | 15-20m | ✅ Complete |
| 06 | [Drafting plan](06-drafting-plan.md) | Per-file drafting deltas | 10-15m | ✅ Complete |
| 06 | [File review note](06-file-review-note.md) | Draft review and removal compare | 10-15m | ✅ Complete |
| 06 | [Draft attestation](06-draft-attestation.md) | Block-indexed draft attestation | 10-15m | ✅ Complete |
| — | Scope and Draft | Scope manifest and file-by-file drafting | 45-90m | ✅ Complete |
| 08 | [Verified findings](08-verified-findings.md) | Post-draft audit verification | 10-15m | ✅ Complete |
| — | Quality Review | Compliance and convention audits | 30-45m | ✅ Complete |
| 09 | Validate and Commit | Validation, scope verify, commit/PR | 20-30m | ✅ Complete |
| 10 | [Post-update review](10-post-update-review.md) | Re-audit after update | 15-25m | ✅ Complete |
| 10 | [Principle findings](10-principle-findings.md) | Post-update principle pass | — | ✅ Complete |
| 10 | [Anti-pattern findings](10-anti-pattern-findings.md) | Post-update anti-pattern pass | — | ✅ Complete |
| 11 | Retrospective | Session close-out | 10-15m | ✅ Complete |
| … | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, design decisions, limitations | 10-20m | ✅ Complete |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/workflow-design/` |
| Related workflow | — |
| PR | [#254](https://github.com/m2ux/workflow-server/pull/254) |
