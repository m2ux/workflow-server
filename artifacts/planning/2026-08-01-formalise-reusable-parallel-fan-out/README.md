# Formalise reusable parallel fan-out — August 2026

> Update · Created 2026-08-01 · **Status:** Quality review

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Formalise parallel fan-out as **named meta contracts** (new same-context **unit-fan-out** for process/shell units; existing **scatter-gather** / **spawn-concurrent** for agent units), migrate free-prose call sites (`run-suite`, prism `independent-lenses`), and lock the preference into workflow-design **§33** + **AP-140**. Full-corpus inventory: [06-migration-candidates.md](06-migration-candidates.md). Primary bag target remains `meta`; co-edits touch `workflow-design` and `prism` under one worktree.

## Problem Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Intake and context | Mode, target, edit-surface path | 15-30m | ✅ |
| 2 | [Change brief](01-change-brief.md) | Purpose, multi-workflow, open judgements | 20-40m | ✅ |
| 3 | [Impact analysis](01-impact-analysis.md) | Blast radius meta + design + prism | 20-40m | ✅ |
| 4 | [Migration candidates](06-migration-candidates.md) | Full-corpus candidate / clean / N/A | 15-30m | ✅ |
| 5 | Scope and draft | Worktree, manifest, per-file drafting | 45-90m | ✅ |
| 6 | [Scope manifest](06-scope-manifest.md) | File-level change inventory (10 of 11; dispute out) | 15-30m | ✅ |
| 7 | Quality review | Criteria walk, consumer surface, guards | 30-60m | 🟡 |
| 8 | [Findings register](09-findings-register.md) | Audit record, coverage, exclusions | 15-30m | ⬚ |
| 9 | Validate and commit | Scope re-check, commit, pull request | 20-40m | ⬚ |
| 10 | [Close-out](09-COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#382](https://github.com/m2ux/workflow-server/issues/382) |
| Primary target | `workflows/meta/` |
| Co-edit | `workflows/workflow-design/`, `workflows/prism/` |
| Worktree | `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/` |
