# Workflow-Authoring Gitnexus Bindings — August 2026

> Update · Created 2026-08-01 · **Status:** Drafting

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Binds gitnexus graph operations into the `workflow-authoring` workflow so its workers answer structural questions from the code graph instead of falling back to text search (#310 Part 1, delivered via PR #375). Bindings land on the activity and technique surfaces where workers actually receive them — intake context loading, scope-manifest verification, quality-review impact and orphan scans, and pre-commit change detection.

## Problem Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Intake and context | Mode, target, edit-surface path | 15-30m | ✅ |
| 2 | [Change brief](01-change-brief.md) | Purpose, dimension shape, open judgements | 20-40m | ✅ |
| 3 | [Impact analysis](01-impact-analysis.md) | Blast radius, integrity, removals | 20-40m | ✅ |
| 4 | Scope and draft | Worktree, manifest, per-file drafting | 30-60m | ⬚ |
| 5 | [Scope manifest](06-scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 6 | Quality review | Criteria walk, consumer surface, guards | 30-60m | ⬚ |
| 7 | [Findings register](findings-register.md) | Audit record, coverage, exclusions | 15-30m | ⬚ |
| 8 | Validate and commit | Scope re-check, commit, pull request | 20-40m | ⬚ |
| 9 | [Close-out](COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/workflow-authoring/` |
| Issue | [#310](https://github.com/m2ux/workflow-server/issues/310) |
| PR | [#375](https://github.com/m2ux/workflow-server/pull/375) |
