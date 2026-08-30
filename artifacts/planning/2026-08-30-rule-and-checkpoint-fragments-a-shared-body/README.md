# Rule and Checkpoint Fragments: A Shared Home — August 2026

> Update · Created 2026-08-30 · **Status:** Drafting

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Issue #519 asks whether the `fragments` construct earns its place, or whether it stands in for two things the corpus lacks: a shared home for generic rules, and shared activities for shared gates. Both halves have found homes elsewhere since it was raised — [#522](https://github.com/m2ux/workflow-server/pull/522) built the shared home and deleted all seven rule fragments, and [#520](https://github.com/m2ux/workflow-server/issues/520) specifies the `routines/` construct that retires the checkpoint half. This run settles what neither reaches: `remediate-vuln` declares two of the eight variables the gates in its borrowed activities read and write, and the guard meant to catch that walks only each workflow's own activities directory.

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
| 4 | Scope and draft | Worktree, manifest, per-file drafting | 30-60m | ✅ |
| 5 | [Scope manifest](06-scope-manifest.md) | File-level change inventory | 15-30m | ✅ |
| 6 | Quality review | Criteria walk, consumer surface, guards | 30-60m | ✅ |
| 7 | [Findings register](07-findings-register.md) | Audit record, coverage, exclusions | 15-30m | ⬚ |
| 8 | Validate and commit | Scope re-check, commit, pull request | 20-40m | 🟡 |
| 9 | [Close-out](COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#519](https://github.com/m2ux/workflow-server/issues/519) |
| Target workflow | `workflows/work-package/` |
| Preceding change | [#522](https://github.com/m2ux/workflow-server/pull/522) |
| Supersedes the checkpoint half | [#520](https://github.com/m2ux/workflow-server/issues/520) |
| Related issue | [#518](https://github.com/m2ux/workflow-server/issues/518) |
