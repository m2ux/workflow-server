# Formalise reusable parallel fan-out — August 2026

> Update · Created 2026-08-01 · **Status:** In progress (library + callers + canon)

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Formalise parallel fan-out as **activity coordination**. Reusable spines live under [`meta/activities/patterns/`](../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/meta/activities/patterns/README.md) (agent patterns 01–05; **06-process-unit-fan-out** for same-context process/shell/tool suites). Techniques endow atomic capabilities; they never reference other techniques (**AP-142**); multi-unit scatter/wait-all/gather on a technique is **AP-143**. Canon: **§2**, **§19–21**, **§26–27**, **§34**, **AP-68**, **AP-110**, **AP-114**, **AP-140–143**. `run-suite` is pure combine; validate mirrors the process-unit pattern. False-negative audit: [10-ap114-redesign-note.md](10-ap114-redesign-note.md).

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
| 6 | [Scope manifest](06-scope-manifest.md) | File-level change inventory | 15-30m | 🟡 (retargeted to patterns) |
| 7 | Quality review | Criteria walk, consumer surface, guards | 30-60m | 🟡 |
| 8 | [Findings register](08-findings-register.md) | Audit record + AP-114 retrospective | 15-30m | 🟡 |
| 9 | [AP-114 redesign note](10-ap114-redesign-note.md) | False-negative root cause + correct bind graph | 20-40m | ✅ |
| 10 | Canon layer model | §2, §34, inventory, AP-140–143, contradiction scrub | 45-90m | ✅ |
| 11 | Pattern library + validate | `06-process-unit-fan-out`, delete unit-fan-out technique, rewire 11-validate | 30-60m | ✅ |
| 12 | Validate and commit | Scope re-check, commit, pull request | 20-40m | 🟡 |
| 13 | [Close-out](09-COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#382](https://github.com/m2ux/workflow-server/issues/382) |
| Primary target | `workflows/meta/` |
| Co-edit | `workflows/workflow-design/`, `workflows/prism/`, `workflows/work-package/` |
| Worktree | `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/` |
| PR | [#385](https://github.com/m2ux/workflow-server/pull/385) |
| AP-114 note | [10-ap114-redesign-note.md](10-ap114-redesign-note.md) |
