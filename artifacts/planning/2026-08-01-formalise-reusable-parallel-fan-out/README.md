# Formalise reusable parallel fan-out — August 2026

> Update · Created 2026-08-01 · **Status:** Complete (awaiting PR merge / host #383)

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Formalise parallel fan-out as **activity coordination**. Reusable spines live under [`meta/activities/patterns/`](../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/meta/activities/patterns/README.md) (agent patterns 01–05; **06-process-unit-fan-out** for same-context process/shell/tool suites). Techniques endow atomic capabilities; peer technique cites remain allowed (server will resolve them). Multi-unit scatter/wait-all/gather still prefers the activity layer (`coordination-in-technique`); multi-op Protocol façades remain `pass-orchestration-in-technique`. Canon smells by name: `technique-stage-agnostic`, `duplicate-shared-capability`, `pass-orchestration-in-technique`, `prose-based-dispatch-patterns`, `container-names-inheriting-ops`, `coordination-in-technique` (hard ban `technique-references-technique` retired; catalogue renumbered contiguously). Principles **§2**, **§19–21**, **§26–27**, **§34**. `run-suite` is pure combine; validate mirrors the process-unit pattern. False-negative audit: [10-ap114-redesign-note.md](10-ap114-redesign-note.md).

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
| 6 | [Scope manifest](06-scope-manifest.md) | File-level change inventory + #383 keep-site integrate | 15-30m | ✅ |
| 7 | Quality review | Criteria walk, consumer surface, guards + `check:when` via #383 tree | 30-60m | ✅ |
| 8 | [Findings register](08-findings-register.md) | Audit record + pass-orchestration retrospective + #383 + anchor retarget | 15-30m | ✅ |
| 9 | [pass-orchestration redesign note](10-ap114-redesign-note.md) | False-negative root cause + correct bind graph | 20-40m | ✅ |
| 10 | Canon layer model | §2, §34, inventory, dispatch/coordination smells, contradiction scrub | 45-90m | ✅ |
| 11 | Pattern library + validate | `06-process-unit-fan-out`, delete unit-fan-out technique, rewire 11-validate | 30-60m | ✅ |
| 12 | PR #383 keep-site integrate | Merge four OR `when:` migrations + validate step-gate dialect | 15-30m | ✅ |
| 13 | Validate and commit | Scope re-check, commit, pull request | 20-40m | ✅ |
| 14 | [Close-out](09-COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ✅ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#382](https://github.com/m2ux/workflow-server/issues/382) |
| Primary target | `workflows/meta/` |
| Co-edit | `workflows/workflow-design/`, `workflows/prism/`, `workflows/work-package/` |
| Worktree | `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/` |
| PR | [#385](https://github.com/m2ux/workflow-server/pull/385) |
| Dependency | [#383](https://github.com/m2ux/workflow-server/pull/383) when-expression / OR keep-sites (merged into workflows branch) |
| pass-orchestration note | [10-ap114-redesign-note.md](10-ap114-redesign-note.md) |
