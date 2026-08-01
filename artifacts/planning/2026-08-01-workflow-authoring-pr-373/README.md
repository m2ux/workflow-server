# Server When-Merge Tail — Checkpoint Dismissal, Activity-Rule Fragment Refs, AP-134 Guard — August 2026

> Update · Created 2026-08-01 · **Status:** Drafting

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Carries PR #373 — the server half of the `when`/`condition` merge routed as PR 2 of the 2026-08-01 backlog plan: `condition_not_met` dismissal extended to `when`-gated checkpoints, fragment references in activity-file rules, and the AP-134 citation-grain guard registered in the check-all suite, with test coverage for all three. Delivering it removes the last exclusive capability of legacy structured `condition` and unblocks the companion corpus-migration PR.

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
| 9 | [Close-out](09-COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Pull request | [#373](https://github.com/m2ux/workflow-server/pull/373) |
| Consolidated backlog issue | [#338](https://github.com/m2ux/workflow-server/issues/338) |
| Citation-grain issue | [#358](https://github.com/m2ux/workflow-server/issues/358) |
| Merge-direction provenance | [#189](https://github.com/m2ux/workflow-server/issues/189) |
| Routing plan | [Backlog PR routing](../2026-08-01-backlog-pr-routing/README.md) |
| Work branch | `feat/when-merge-rule-fragments-ap134-guard` (base `main`) |
