# Corpus Condition-to-When Migration — August 2026

> Update · Created 2026-08-01 · **Status:** Quality review

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Migrates every legacy structured step `condition:` block with a plain comparison to the equivalent inline `when:` expression across the workflow corpus (#338 W7 / #189 C8), closing the last duplicate-declaration duality between the two step-gate dialects. Checkpoint steps and exists-shaped predicates stay structured, with every site's disposition recorded in a migration register, so the corpus matches the schema's stated direction without any semantic change.

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
| 7 | [Findings register](findings-register.md) | Audit record, coverage, exclusions | 15-30m | ⬚ |
| 8 | Validate and commit | Scope re-check, commit, pull request | 20-40m | ⬚ |
| 9 | [Close-out](COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#338](https://github.com/m2ux/workflow-server/issues/338) |
| PR | [#374](https://github.com/m2ux/workflow-server/pull/374) |
| Work branch | [workflow/338-when-migration](https://github.com/m2ux/workflow-server/tree/workflow/338-when-migration) |
