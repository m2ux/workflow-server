# Rule and Checkpoint Fragments: A Shared Home — August 2026

> Update · Created 2026-08-30 · **Status:** Complete

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Issue #519 asks whether the `fragments` construct earns its place, or whether it stands in for two things the corpus lacks: a shared home for generic rules, and shared activities for shared gates. Both halves have found homes elsewhere since it was raised — [#522](https://github.com/m2ux/workflow-server/pull/522) built the shared home and deleted all seven rule fragments, and [#520](https://github.com/m2ux/workflow-server/issues/520) specifies the `routines/` construct that retires the checkpoint half.

The one criterion left for this run to settle is discharged by measurement rather than by a change. A workflow that borrows an activity inherits that activity's own variable declarations: the declaration resolver reads each borrowed activity file and folds its writes into the borrowing workflow's declared set, so `remediate-vuln` resolves 118 declarations covering all eight variables its borrowed gates use. No gap exists and no guard is blind to one. That leaves #519 closable against #522 and #520, with every claim re-derivable from the corpus tip.

What the run delivers instead comes from its own quality review: two pre-existing defects found off the change surface and repaired. The Artifact Writing Register was unreachable from any workflow but `meta`, because two `meta` techniques cited it by a path that projects to an unqualified resource id wherever they are bundled — and fifteen activity files across fifteen workflows bind one of them. The schema construct inventory carried no row for `fragments.checkpoints`, a construct the schema declares at workflow scope. A third finding, a stale binding-fidelity triage entry, is recorded open: its remedy belongs to the server repository rather than to the corpus.

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
| 7 | [Findings register](09-findings-register.md) | Audit record, coverage, exclusions | 15-30m | ✅ |
| 8 | Validate and commit | Scope re-check, commit, pull request | 20-40m | ✅ |
| 9 | [Close-out](09-COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ✅ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#519](https://github.com/m2ux/workflow-server/issues/519) |
| Target workflow | `workflows/work-package/` |
| Preceding change | [#522](https://github.com/m2ux/workflow-server/pull/522) |
| Supersedes the checkpoint half | [#520](https://github.com/m2ux/workflow-server/issues/520) |
| Related issue | [#518](https://github.com/m2ux/workflow-server/issues/518) |
| Stale triage entry, carried separately | [#525](https://github.com/m2ux/workflow-server/pull/525) |
| Corpus pull request | [#541](https://github.com/m2ux/workflow-server/pull/541) |
